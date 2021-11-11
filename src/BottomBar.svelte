<script>
    import VolumeSlider from './VolumeSlider.svelte';
    import Color from 'color';
    import GlobalColors from './GlobalColors';
    
    $: style = `--barColor: ${GlobalColors.bg.lighten(0.9).hex()};`;
</script>

<div id="bottom-bar" style={style}>
    <div class="center-controls">
        <i class="stop"></i>
        <div class="volume">
            <VolumeSlider mainColor={Color("#999")} volume=0.8 isPlaying={true}/>
        </div>
    </div>
</div>

<style lang="scss">
    @import './fonts.scss';

    $bottom-bar-size: 420px;
    $bottom-bar-height: 40px;

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

        position: absolute;
        left: 50%;
        top: (60px - $bottom-bar-height) / 2;
        width: $bottom-bar-size;
        height: $bottom-bar-height;
        margin-left: - $bottom-bar-size / 2;

        i.stop {
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
            right: 16px;
            height: 8px;
        }
    }
</style>