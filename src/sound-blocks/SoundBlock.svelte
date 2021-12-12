<script>
    import PlayButton from './PlayButton.svelte';
    import VolumeSlider from './VolumeSlider.svelte';
    import globalStyles from '../style/globalStyles';
    import Color from 'color';
    import soundStore from './soundStore';
    import { globalVolume, bigBlocks, apis } from '../playerStore';
    import _ from 'lodash';
    import { onDestroy, onMount } from 'svelte';
    import Fader from './Fader.svelte';
    import * as reorderables from "../pointer/reorderables";
    import * as selection from "../pointer/selection";
    import * as contextMenu from "../pointer/contextMenu";
    import collectionLoader from "../collectionLoader";
    import { getInputModal } from "../hotkeys/hotkey-manager";
    import tippy from 'tippy.js';
    const { ipcRenderer } = window.require('electron');
    
    export let id;
    export let soundData;
    let isPlaying = false;
    let isSelected = false;

    const dom = {
        soundBlock: undefined,
        mainBox: undefined,
        volumeSlider: undefined,
        playButton: undefined,
        assignButton: undefined
    }

    let fader;
    let faderValue = 0;
    let sound = new Audio(soundData.path.absolute);

    $: hotkeyName = soundData.hotkeyName ?? '';
    $: keyFontSize = getAssignKeySize(hotkeyName ? hotkeyName.length : 0, $bigBlocks); 
    $: missing = soundData.missingFile;

    const api = {
        getID: () => id,
        isPlaying: () => isPlaying,
        setPlaying: (play) => { isPlaying = play; },
        stop: () => stopSound,
        getDOM: () => dom,
        onHotkey: () => { 
            if(soundData.category == 'effects') {
                isPlaying = true;
                sound.currentTime = 0;
                fader.skipToOne();
            } else {
                isPlaying = !isPlaying;
            }
        },
        moveVolume: (delta) => {
            soundData.volume += delta;
            soundData.volume = _.clamp(soundData.volume, 0, 1);
        },
        refreshAudioPath: () => {
            if(!sound) sound = new Audio(soundData.path.absolute);
            else sound.src = soundData.path.absolute;
        }
    }

    const selectableAPI = {
        getNode: () => dom.soundBlock,
        getSelectionGroup: () => 'soundblocks',
        onSelect: () => isSelected = true,
        onDeselect: () => isSelected = false
    }

    const reorderableAPI = {
        getNode: () => dom.soundBlock,
        putAfter: node => {
            if(!node.dataset || !node.dataset.id) return;
            soundStore.update(store => {
                const targetSound = soundStore.getItemByID(node.dataset.id);
                return reorderables.moveArrayItemAfter(store, soundStore.getItemByID(id), targetSound);
            });
            collectionLoader.saveCollection();
        },
        putBefore: node => {
            if(!node.dataset || !node.dataset.id) return;
            soundStore.update(store => {
                const targetSound = soundStore.getItemByID(node.dataset.id);
                return reorderables.moveArrayItemBefore(store, soundStore.getItemByID(id), targetSound);
            });
            collectionLoader.saveCollection();
        }
    }

    const contextMenuAPI = {
        getNode: () => dom.soundBlock,
        getOptions: () => getContextMenuOptions()
    }
    
    onMount(async () => {
        reorderables.register(reorderableAPI);
        selection.register(selectableAPI);
        contextMenu.register(contextMenuAPI);
        soundStore.setSoundAPI(id, api);
        sound.src = soundData.path.absolute;
        sound.onended = () => {
            if(soundData.category != 'effects') sound.play();
            else isPlaying = false;
        };
        
        tippy(dom.assignButton, { content:  'Assign hotkey' });
        tippy(dom.volumeSlider, { content: 'Sound volume' });
    });
    
    onDestroy(async() => {
        reorderables.unregister(reorderableAPI);
        selection.unregister(selectableAPI);
        contextMenu.unregister(contextMenuAPI);
        sound.pause();
        sound.remove();
        fader.pause();
    });
    
    $: mainColor = getMainColor(soundData.category);
    
    $: style = `--mainColor: ${mainColor.hex()};`
    + `--mainColorLighter: ${mainColor.lighten(0.1)};`
    + `--mainBoxBG: ${isPlaying ? mainColor.hex() : globalStyles.bg.lighten(0.5).hex()};`
    + `--mainBoxBGHover: ${isPlaying ? mainColor.hex() : globalStyles.bg.lighten(0.65).hex()};`
    + `--mainBoxBGSelected: ${isPlaying ? mainColor.lighten(0.05).hex() : globalStyles.bg.lighten(1.2).hex()};`
    + `--mainBoxBGSelectedHover: ${isPlaying ? mainColor.lighten(0.07).hex() : globalStyles.bg.lighten(1.4).hex()};`
    + `--assignButtonBorder: ${isPlaying ? mainColor.lighten(0.3) : globalStyles.bg.lighten(1).hex()};`
    + `--fontWeight: ${isPlaying ? '600' : '400'};`;

    $: onVolumeChange(soundData.volume, $globalVolume, faderValue);

    $: onPlayingStateChange(isPlaying);

    function getContextMenuOptions() {
        let options = [];

        if(!missing) { 
            options.push({ 
                id: 'stop-sound-block',
                solo: 'Stop',
                multiple: 'Stop sounds',
                onClickEach: () => stopSound()
            });
            options.push({ 
                id: 'rename-sound-block',
                solo: 'Rename...',
                onClickEach: () => {
                    apis.modal.show(
                        "Rename sound", 
                        [
                            { name: "Cancel", hotkey: 'Escape', onClick: () => apis.modal.hide() },
                            { name: "OK", hotkey: 'Enter', onClick: () => {
                                let newName = apis.modal.getInputValue();
                                soundStore.renameSound(id, newName);
                                apis.modal.hide();
                                collectionLoader.saveCollection();
                            }}
                        ],
                        { value: soundData.title, placeHolder: 'Enter sound name...' }
                    );
                }
            });
        } else {
            options.push({ 
                id: 'replace-sound-block',
                solo: 'Replace file...',
                onClickEach: () => {
                    ipcRenderer.send('replace-sound-file', id);
                }
            });
        }

        options.push({ 
            id: 'remove-sound-block',
            solo: 'Remove',
            multiple: 'Remove sounds',
            onClickEach: () => {
                soundStore.removeSound(id);
            },
            saveAfter: true
        });

        return options;
    }

    function getMainColor(blockType) {
        switch (blockType) {
            case 'music': return globalStyles.music;
            case 'ambient': return globalStyles.ambient;
            case 'effects': return globalStyles.effects;
            default: return Color('#333');
        }
    }

    function getAssignKeySize(keyNameLength, bigBlocks) {
        if(bigBlocks) {
            if(keyNameLength <= 1) return '25px';
            else if(keyNameLength == 2) return '21px';
            else if(keyNameLength == 3) return '18px';
            else return '13px';
        } else {
            if(keyNameLength <= 1) return '17.5px';
            else if(keyNameLength == 2) return '15.5px';
            else if(keyNameLength == 3) return '13.5px';
            else return '10px';
        }
    }

    function onVolumeChange(dataVolume, globalVolume, faderValue) {
        if(sound) sound.volume = dataVolume * globalVolume * faderValue;
    }

    function stopSound() {
        if(!isPlaying) sound.currentTime = 0;
        else {
            isPlaying = false;
            fader.onNextEnd(() => {
                sound.currentTime = 0;
            });
        }
    }

    function onPlayingStateChange(play) {
        if(play && missing) return;
        let skipFade = false;

        if(play) {
            if(soundData.category == 'effects') {
                sound.currentTime = 0;
                skipFade = true;
            }
            if(soundData.category == 'music') {
                const otherPlayingSounds = soundStore.getPlayingSoundsInCategory('music').filter(s => s.id != id);
                otherPlayingSounds.forEach(sound => {
                    sound.api.setPlaying(false);
                });
                if(otherPlayingSounds.length == 0 && sound.currentTime == 0) skipFade = true;
            }
            fader.start(1.0);
            sound.play();
        }
        else {
            fader?.start(0.0);
            if(soundData.category == 'effects') skipFade = true;
        }

        if(skipFade) fader?.skip();
    }

    function onFaderEnd() {
        if(faderValue <= 0) sound.pause();
    }

    function onAssignButtonPressed(e) {
        if(missing) return;
        getInputModal()?.show(id);
    }
</script>

<div 
    class="sound-block" class:small={!$bigBlocks} class:selected={isSelected} class:missing={missing} style="{style}"
    bind:this={dom.soundBlock}
    data-id={id}
>
    <div class="main-box" bind:this={dom.mainBox}>
        <div class="info-zone" class:active={isPlaying}>
            <div class="info-bar">
                {#if missing}<span class="missing-file-icon"></span>{/if}
                <span class="title">{soundData.title ?? ""}</span>
            </div>
            <div class="volume">
                <VolumeSlider 
                    bind:domElement={dom.volumeSlider} 
                    bind:isBig={$bigBlocks} 
                    mainColor={mainColor} 
                    bind:isPlaying={isPlaying} 
                    bind:disabled={missing}
                    bind:volume={soundData.volume}
                />
            </div>
        </div>       
        <div bind:this={dom.assignButton} data-blockselection={true} class="assign-btn" on:click={onAssignButtonPressed} style="font-size: {keyFontSize}">
            {hotkeyName}
        </div>         
    </div>
    <PlayButton 
        bind:domElement={dom.playButton} 
        usePause= {soundData.category != 'effects'} 
        bind:isBig={$bigBlocks} 
        mainColor={mainColor} 
        bind:disabled={missing}
        bind:isPlaying={isPlaying}
    />
    <Fader 
        bind:this={fader} 
        bind:value={faderValue} 
        onEnd={onFaderEnd}
    />
</div>

<style lang="scss">
    .sound-block {
        font-family: 'Poppins', sans-serif;
        position: relative;
        padding: 8px 0;
        height: 52px;
        width: 100%;

        :global(.drop-preview-bar) {
            border-color: var(--mainColorLighter, white) !important;
        }

        &:first-of-type {
            margin-top: 0;
        }

        &.selected {
            .main-box {
                outline: 1px rgba(white, 0.75) solid;
                background-color: var(--mainBoxBGSelected, #333);
                

                &:hover {
                    background-color: var(--mainBoxBGSelectedHover, #333);
                }
            }
        }

        .main-box {
            position: absolute;
            top: 8px;
            bottom: 8px;
            left: 30px;
            right: 0;
            user-select: none;
            transition: box-shadow 0.15s;
            background-color: var(--mainBoxBG, #333);
            border-radius: 2px;
            box-sizing: border-box;

            &:hover {
                box-shadow: 0 0 10px transparentize(#000, 0.9);
                background-color: var(--mainBoxBGHover, #333);
            }

            .volume {
                position: absolute;
                bottom: 3px;
                width: 100%;
                height: 9px;
            }

            .assign-btn {
                position: absolute;
                height: 40px;
                width: 40px;
                right: 7px;
                top: 6px;
                box-sizing: border-box;
                border: 3px solid var(--assignButtonBorder, #555);
                border-radius: 5px;
                background-color: transparentize(#000, 0.8);
                color: white;
                text-align: center;
                padding: 5px;
                line-height: 26px;
                font-size: 25px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                justify-content: center;
                overflow: hidden;

                &:hover {
                    transition: 0.03s;
                    transform: scale(1.08);
                    background-color: transparentize(#000, 0.7);
                }

                &:active {
                    transition: transform 0.02s;
                    transform: scale(0.98);
                }
            }

            .info-zone {
                position: absolute;
                top: 5px;            
                left: 40px;
                bottom: 8px;
                right: 64px;
                font-weight: 400;
                text-shadow: 0 0.5px 6px #00000044;
                user-select: none;

                .info-bar {
                    position: absolute;
                    top: 0;
                    left: 0px;
                    right: 0px;
                    height: 24px;
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-weight: var(--fontWeight, 400);
                }
            }
        }

        &.small {
            height: 30px;
            padding: 1px 0;

            .main-box {
                left: 0;
                top: 1px;
                bottom: 0;
            }

            .assign-btn {
                width: 24px;
                height: 24px;
                top: 3px;
                right: 4px;
                border-width: 2px;
                border-radius: 3px;
                border-color: transparent;
                font-size: 17.5px;
                padding: 2px;
                line-height: 1em;
            }

            .volume {
                position: absolute;
                top: 10px;
                bottom: auto;
                height: 10px;
                left: 60%;
                right: 0px;
                width: auto;
            }

            .info-zone {
                top: 0px;
                bottom: 0;
                right: 43px;
                left: 40px;

                .info-bar {
                    height: 100%;
                    font-size: 13px;
                    top: 6px;            
                    left: 0px;
                    bottom: 8px;
                    right: 40%;
                    padding-right: 8px;
                }
            }
        }

        &.missing {
            .missing-file-icon {
                position: relative;
                display: inline-block;
                font-family: 'icomoon';
                width: 22px;

                &::before {
                    content: "\e905";
                    position: absolute;
                    display: block;
                    top: -14px;
                    color: rgb(255, 108, 108);
                    font-size: 18px;
                }
            }

            .info-bar {
                color: rgb(255, 166, 166);
            }

            .assign-btn {
                cursor: default;

                &:hover {
                    transform: none;
                }
            }
        }
    }
</style>