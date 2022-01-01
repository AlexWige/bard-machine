<script>
    import PlayButton from './PlayButton.svelte';
    import VolumeSlider from './VolumeSlider.svelte';
    import globalStyles from '../style/global-styles';
    import AssignKeyButton from "../hotkeys/AssignKeyButton.svelte";
    import Color from 'color';
    import soundStore from './sound-store';
    import { globalVolume, bigBlocks } from '../player-store';
    import _ from 'lodash';
    import { onDestroy, onMount } from 'svelte';
    import Fader from './Fader.svelte';
    import * as reorderables from "../pointer/reorderables";
    import * as selection from "../pointer/selection";
    import * as contextMenu from "../context-menu/context-menu";
    import collectionLoader from "../collection-loader";
    import { getContextMenuOptions } from "./sound-block-context-menu";
    import * as roomsManager from "../rooms/rooms-manager";
    import tippy from 'tippy.js';
    
    export let id;
    export let soundData;
    let currentSourceID;
    let isPlaying = false;
    let isSelected = false;
    let sound = new Audio(getSartingSourcePath());
    let fader;
    let faderValue = 0;
    let titleTippy;

    $: onChangeSource(currentSourceID);

    const dom = {
        soundBlock: undefined,
        mainBox: undefined,
        titleBar: undefined,
        volumeSlider: undefined,
        playButton: undefined,
        assignButton: undefined
    }

    $: hotkeyName = soundData.hotkeyName ?? '';
    $: missing = soundData.sources.find(s => s.isMissing);
    $: onSoundStoreChanged($soundStore);
    $: isSmall = !$bigBlocks;
    $: hotkeyButtonEnabled = !missing;

    const api = {
        getNode: () => dom.soundBlock,
        getID: () => id,
        getData: () => soundData,
        isPlaying: () => isPlaying,
        setPlaying: (play) => { isPlaying = play; },
        play: () => { isPlaying = true; },
        stop: () => { stopSound() },
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
        setVolume: (volume) => {
            soundData.volume = _.clamp(volume, 0, 1);
        },
        refreshAudioPath: () => {
            const sourceIndex = getCurrentSourceIndex();
            if(!sound) sound = new Audio(soundData.sources[sourceIndex].absolutePath);
            else sound.src = soundData.sources[sourceIndex].absolutePath;
        },
        getCurrentSourceIndex: () => getCurrentSourceIndex(),
        getCurrentSourceID: () => currentSourceID,
        setSourceIndex: (index) => {
            if(index < 0) index = soundData.sources.length - 1;
            if(index >= soundData.sources.length) index = 0;
            const source = soundData.sources[index];
            if(!source) return;
            currentSourceID = source.id;
            sound.src = source.absolutePath;
            sound.currentTime = 0;
            if(isPlaying) sound.play();
        },
        getCurrentTime: () => sound.currentTime,
        getSoundElement: () => sound
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
        getOptions: (nodes) => getContextMenuOptions(nodes, api)
    }
    
    onMount(async () => {
        reorderables.register(reorderableAPI);
        selection.register(selectableAPI);
        contextMenu.register(contextMenuAPI);
        soundStore.setSoundAPI(id, api);
        api.setSourceIndex(0);
        sound.src = getSartingSourcePath();
        sound.onended = () => onSoundEnd();

        tippy(dom.volumeSlider, { content: 'Sound volume' });
        titleTippy = tippy(dom.titleBar, { content: soundData.title });
    });
    
    onDestroy(async() => {
        reorderables.unregister(reorderableAPI);
        selection.unregister(selectableAPI);
        contextMenu.unregister(contextMenuAPI);
        sound.pause();
        sound.remove();
        fader.pause();
    });
    
    $: onVolumeChange(soundData.volume, $globalVolume, faderValue);
    $: onPlayingStateChange(isPlaying);
    $: mainColor = getMainColor(soundData.category);
    $: style = `--mainColor: ${mainColor.hex()};`
        + `--mainColorLighter: ${mainColor.lighten(0.1)};`
        + `--mainBoxBG: ${isPlaying ? mainColor.hex() : globalStyles.bg.lighten(0.5).hex()};`
        + `--mainBoxBGHover: ${isPlaying ? mainColor.hex() : globalStyles.bg.lighten(0.65).hex()};`
        + `--mainBoxBGSelected: ${isPlaying ? mainColor.lighten(0.05).hex() : globalStyles.bg.lighten(1.2).hex()};`
        + `--mainBoxBGSelectedHover: ${isPlaying ? mainColor.lighten(0.07).hex() : globalStyles.bg.lighten(1.4).hex()};`
        + `--assignButtonBorder: ${isPlaying ? mainColor.lighten(0.3) : globalStyles.bg.lighten(1).hex()};`
        + `--fontWeight: ${isPlaying ? '600' : '400'};`;

    function onSoundStoreChanged(store) {
        if(titleTippy) titleTippy.setContent(soundData.title);
    }

    function getCurrentSourceIndex() {
        const source = soundData.sources.find(s => s.id == currentSourceID);
        if(source) return soundData.sources.indexOf(source);
        else return 0;
    }

    function getSartingSourcePath() {
        if(soundData.sources && soundData.sources.length > 0) return soundData.sources[0].absolutePath;
        else '';
    }

    function getMainColor(blockType) {
        switch (blockType) {
            case 'music': return globalStyles.music;
            case 'ambient': return globalStyles.ambient;
            case 'effects': return globalStyles.effects;
            default: return Color('#333');
        }
    }

    function onKeyAssign(keyCode, keyName) {
        soundStore.update(store => {
            store.forEach(item => {
                // Remove other sound hotkey with same keycode
                if(item.data.hotkeyCode == keyCode) {
                    item.data.hotkeyCode = '';
                    item.data.hotkeyName = '';
                }
                // Assign hotkey
                if(item.id == id) {
                    item.data.hotkeyCode = keyCode;
                    item.data.hotkeyName = keyName;
                }
            });
            return store;
        });
        collectionLoader.saveCollection();
    }

    function onSoundEnd() {
        if(soundData.category == 'effects') {
            isPlaying = false;
        } else {
            // If playlist, go to next source
            if(soundData.sources.length > 1) {
                let index = getCurrentSourceIndex();
                index++;
                if(index >= soundData.sources.length) 
                    index = 0;
                sound.src = soundData.sources[index].absolutePath;
                currentSourceID = soundData.sources[index].id;
            }
            sound.play();
        }
    }

    function onVolumeChange(dataVolume, globalVolume, faderValue) {
        if(sound) {
            sound.volume = dataVolume * globalVolume * faderValue;
        
            // Store room info
            const currentRoomID = roomsManager.getActiveRoomID();
            soundData.rooms['R' + currentRoomID] = { 
                isPlaying: isPlaying && soundData.category != 'effects', 
                volume: dataVolume 
            };
        }
    }

    function stopSound() {
        if(!isPlaying) sound.currentTime = 0;
        else {
            isPlaying = false;
            sound.currentTime = 0;
            sound.pause();
            fader.onNextEnd(() => {
                sound.currentTime = 0;
            });
        }
    }

    function onChangeSource(newID) {
        if(!soundData || !dom.soundBlock) return;
        const index = getCurrentSourceIndex();
        const event = new CustomEvent('change-source', { detail: { index: index, source: soundData.sources[index] }});
        dom.soundBlock.dispatchEvent(event);
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
        
        // Store room info
        if(soundData.category != 'effects') {
            const currentRoomID = roomsManager.getActiveRoomID();
            soundData.rooms['R' + currentRoomID] = { isPlaying: play, volume: soundData.volume };
            roomsManager.refreshPlayingCounts();
        }

        if(skipFade) fader?.skip();
    }

    function onFaderEnd() {
        if(faderValue <= 0) sound.pause();
    }
</script>

<div 
    class="sound-block" class:small={isSmall} class:selected={isSelected} class:missing={missing} style="{style}"
    bind:this={dom.soundBlock}
    data-id={id}
>
    <div class="main-box" bind:this={dom.mainBox}>
        <div class="info-zone" class:active={isPlaying}>
            <div class="info-bar" bind:this={dom.titleBar}>
                {#if soundData.sources.length > 1}<span class="playlist-icon"></span>{/if}
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
        <AssignKeyButton bind:hotkeyName={hotkeyName} bind:small={isSmall} onKeyAssign={onKeyAssign} bind:enabled={hotkeyButtonEnabled}/>
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

        .playlist-icon {
            position: relative;
            display: inline-block;
            font-family: 'icomoon';
            width: 20px;

            &::before {
                content: "\e906";
                position: absolute;
                display: block;
                top: -14px;
                left: -1px;
                font-size: 18px;
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

            :global(.assign-btn) {
                cursor: default;

                &:hover {
                    transform: none;
                }
            }
        }
    }
</style>