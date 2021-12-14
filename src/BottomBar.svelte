<script>
    import Color from 'color';
    import globalStyles from './style/global-styles';
    import { globalVolume, bigBlocks } from './player-store';
    import soundStore from './sound-blocks/sound-store';
	import Switch from './utils/Switch.svelte';
    import VolumeSlider from './sound-blocks/VolumeSlider.svelte';
    import tippy from "tippy.js";
    import { onMount, onDestroy } from "svelte";
    
    $: style = `--barColor: ${globalStyles.bg.lighten(0.9).hex()};`;

    const dom = {
        stopButton: undefined,
        volumeSlider: undefined,
        bigBlocksSwitch: undefined
    }

    let bigBlockUnsubscribe;
    let volumeUnsubscribe;

    onMount(async() => {
        tippy(dom.stopButton, { content: 'Stop all sounds' });
        tippy(dom.volumeSlider, { content: 'Global volume' });
        tippy(dom.bigBlocksSwitch, { content: 'Toggle big blocks' });
        // Big blocks
        bigBlocks.set(localStorage.getItem('use-big-blocks') == 'true');
        bigBlockUnsubscribe = bigBlocks.subscribe(value => {
            localStorage.setItem('use-big-blocks', value);
        });
        // Volume
        let volume = 0.8;
        try {
            volume = parseFloat(localStorage.getItem('global-volume'));
        } catch {
            volume = 0.8;
        }
        if(!volume || isNaN(volume)) volume = 0.8;
        globalVolume.set(volume);
        volumeUnsubscribe = globalVolume.subscribe(value => {
            localStorage.setItem('global-volume', value);
        });
    });

    onDestroy(async() => {
        bigBlockUnsubscribe();
        volumeUnsubscribe();
    });
</script>

<div id="bottom-bar" style={style}>
    <div class="center-controls">
        <i class="stop" bind:this={dom.stopButton} on:pointerdown="{soundStore.stopAll}"></i>
        <div class="volume">
            <VolumeSlider mainColor={Color("#999")} bind:domElement={dom.volumeSlider} bind:volume={$globalVolume} isPlaying={true}/>
        </div>
        <div class="switch">
            <Switch bind:domElement={dom.bigBlocksSwitch} bind:checked={$bigBlocks}></Switch>
            <img class:active={$bigBlocks} src="icons/enlarge-icon.svg" alt="Use Small Icons">
        </div>
    </div>
</div>

<style lang="scss">
    $bottom-bar-size: 420px;

    #bottom-bar {
        position: fixed;
        z-index: 500;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 60px;
        background-color: var(--barColor, #ccc);
        user-select: none;
    }

    #bottom-bar .center-controls {
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
        margin: 9px auto;
        width: 90%;
        height: 40px;
        max-width: 450px;

        i.stop {
            position: relative;
            display: block;
            line-height: 31px;
            width: 30px;
            height: 30px;
            margin-top: 4px;

            &:hover::after {
                transform: scale(1.1);
                opacity: 1;
            }
        }

        i.stop::after {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            font-family: 'icomoon';
            content: '\ea1e';
            font-size: 30px;
            box-sizing: border-box;
            font-style: normal;
            cursor: pointer;
            opacity: 0.8;
        }

        .volume {
            display: block;
            position: absolute;
            top: 16px;
            left: 65px;
            right: 105px;
            height: 8px;
        }

        .switch {
            display: block;
            position: absolute;
            top: 11px;
            right: 38px;
            height: 8px;

            img {
                width: 18px;
                display: block;
                position: absolute;
                right: -29px;
                top: 2px;
                opacity: 0.6;

                &.active {
                    opacity: 1;
                }
            }
        }
    }
</style>