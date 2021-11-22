<script>
    import PlayButton from './PlayButton.svelte';
    import VolumeSlider from './VolumeSlider.svelte';
    import GlobalStyles from './GlobalStyles';
    import Color from 'color';
    import soundStore from './soundStore';
    import { globalVolume, bigBlocks, apis } from './playerStore';
    import _ from 'lodash';
    import { onDestroy, onMount } from 'svelte';
    import Fader from './Fader.svelte';
    
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
    let sound = new Audio(soundData.path);

    let keyCode = 0;
    let keyName = "";

    const api = {
        getID: () => id,
        isPlaying: () => isPlaying,
        setPlaying: (play) => { isPlaying = play; },
        isSelected: () => isSelected,
        setSelected: (select) => { isSelected = select; },
        toggleSelected: () => { isSelected = !isSelected; },
        clickEventCanSelect: (event) => {
            return event.path.includes(dom.mainBox) 
                && !event.path.includes(dom.volumeSlider)
                && !event.path.includes(dom.playButton)
                && !event.path.includes(dom.assignButton);
        },
        stop: () => {
            if(!isPlaying) sound.currentTime = 0;
            else {
                isPlaying = false;
                fader.onNextEnd(() => {
                    sound.currentTime = 0;
                });
            }
        },
        getDOM: () => dom,
    }

    const hotKeyAPI = {
        getKeyCode: () => { return keyCode },
        setKey: (code, name) => { keyCode = code; keyName = name; },
        clearKeyCode: () => { keyCode = undefined; keyName = '';},
        triggerSound: () => { 
            if(soundData.category == 'effects') {
                isPlaying = true;
                sound.currentTime = 0;
                fader.skipTo(1);
            } else {
                isPlaying = !isPlaying;
            }
        }
    }
    
    onMount(async () => {
        soundStore.setSoundAPI(id, api);
        sound.src = soundData.path;
        sound.onended = () => {
            if(soundData.category != 'effects') sound.play();
            else isPlaying = false;
        };
    });
    
    onDestroy(async() => {
        sound.pause();
        sound.remove();
        fader.pause();
    });
    
    $: mainColor = getMainColor(soundData.category);

    $: displayedKey = keyName;
    
    $: style = `--mainColor: ${mainColor.hex()};`
    + `--mainBoxBG: ${isPlaying ? mainColor.hex() : GlobalStyles.bg.lighten(0.5).hex()};`
    + `--mainBoxBGHover: ${isPlaying ? mainColor.hex() : GlobalStyles.bg.lighten(0.65).hex()};`
    + `--mainBoxBGSelected: ${isPlaying ? mainColor.lighten(0.05).hex() : GlobalStyles.bg.lighten(1.2).hex()};`
    + `--mainBoxBGSelectedHover: ${isPlaying ? mainColor.lighten(0.07).hex() : GlobalStyles.bg.lighten(1.4).hex()};`
    + `--assignButtonBorder: ${isPlaying ? mainColor.lighten(0.3) : GlobalStyles.bg.lighten(1).hex()};`
    + `--fontWeight: ${isPlaying ? '600' : '400'};`;

    $: onVolumeChange(soundData.volume, $globalVolume, faderValue);

    $: onPlayingStateChange(isPlaying);

    function getMainColor(blockType) {
        switch (blockType) {
            case 'music': return GlobalStyles.music;
            case 'ambient': return GlobalStyles.ambient;
            case 'effects': return GlobalStyles.effects;
            default: return Color('#333');
        }
    }

    function onVolumeChange(dataVolume, globalVolume, faderValue) {
        if(sound) sound.volume = dataVolume * globalVolume * faderValue;
    }

    function onPlayingStateChange(play) {
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
        apis.inputPrompt?.show(hotKeyAPI);
    }
</script>

<div class="sound-block" bind:this={dom.soundBlock} class:small={!$bigBlocks} class:selected={isSelected} style="{style}" data-id={id}>
    <div class="main-box" bind:this={dom.mainBox}>
        <div class="info-zone" class:active={isPlaying}>
            <div class="info-bar">
                {soundData.title ?? ""}
            </div>
            <div class="volume">
                <VolumeSlider 
                    bind:domElement={dom.volumeSlider} 
                    bind:isBig={$bigBlocks} 
                    mainColor={mainColor} 
                    bind:isPlaying={isPlaying} 
                    bind:volume={soundData.volume}
                />
            </div>
        </div>       
        <div bind:this={dom.assignButton} class="assign-btn" on:click={onAssignButtonPressed}>{displayedKey}</div>         
    </div>
    <PlayButton 
        bind:domElement={dom.playButton} 
        usePause= {soundData.category != 'effects'} 
        bind:isBig={$bigBlocks} 
        mainColor={mainColor} 
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
        margin: 15px 0;
        height: 52px;
        width: 100%;

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
            top: 0;
            bottom: 0;
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
            margin: 1px 0;

            .main-box {
                left: 0;
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
    }
</style>