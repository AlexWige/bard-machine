<script>
	import Switch from './Switch.svelte';
    import VolumeSlider from './VolumeSlider.svelte';
    import Color from 'color';
    import GlobalStyles from './GlobalStyles';
    import { globalVolume, smallBlocks } from './playerStore';
    import soundStore from './soundStore';
    
    $: style = `--barColor: ${GlobalStyles.bg.lighten(0.9).hex()};`;
</script>

<div id="bottom-bar" style={style}>
    <div class="center-controls">
        <i class="stop" on:pointerdown="{soundStore.stopAll}"></i>
        <div class="volume">
            <VolumeSlider mainColor={Color("#999")} bind:volume={$globalVolume} isPlaying={true}/>
        </div>
        <div class="switch">
            <Switch bind:checked={$smallBlocks}></Switch>
            <img class:active={$smallBlocks} src="icons/reduce-icon.svg" alt="Use Small Icons">
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
        margin: 9px auto;
        width: 90%;
        height: 40px;
        max-width: 500px;

        i.stop {
            line-height: 31px;
            &:hover::after {
                transform: scale(1.1);
                opacity: 1;
            }
        }

        i.stop::after {
            font-family: 'icomoon';
            content: '\ea1e';
            font-size: 32px;
            padding-top: 4px;
            padding-left: 8px;
            box-sizing: border-box;
            font-style: normal;
            position: absolute;
            left: 0;
            width: 48px;
            top: 0;
            bottom: 0;
            cursor: pointer;
            opacity: 0.8;
        }

        .volume {
            display: block;
            position: absolute;
            top: 16px;
            left: 65px;
            right: 95px;
            height: 8px;
        }

        .switch {
            display: block;
            position: absolute;
            top: 9px;
            right: 38px;
            height: 8px;

            img {
                width: 19px;
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