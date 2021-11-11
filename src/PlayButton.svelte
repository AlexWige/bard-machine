<script>
import Color from "color";

    import GlobalColors from "./GlobalColors";

    export let isPlaying = false;
    export let mainColor;
    export let onPressed;

    $: style = `--mainColor: ${isPlaying ? 'white' : mainColor.hex()};`
        + `--iconColor: ${getIconColor()};`;

    function getIconColor() {
        if(!isPlaying) return mainColor.mix(GlobalColors.bg, 0.62).hex();
        else return Color('white').mix(GlobalColors.bg, 0.7).hex();
    }

    function onPointerDown() {
        isPlaying = !isPlaying;
        onPressed(isPlaying);
    }
</script>

<div class="play-button" style="{style}" on:pointerdown="{onPointerDown}">
    <i class="{isPlaying ? 'icon-stop2' : 'icon-play3'}"></i>
</div>

<style lang="scss">
    @import './fonts.scss';

    $size: 67px;

    .play-button {
        position: absolute;
        height: $size;
        width: $size;
        border-radius: 50%;
        top: -4px;
        cursor: pointer;
        transition: 0.1s;
        box-sizing: border-box;
        text-align: center;
        padding-top: 16px;
        transition: transform 0.2s background-color 0.1s;
        background-color: var(--mainColor, #ccc);
        color: var(--iconColor, #333);

        i {
            font-size: 35px;

            &.icon-play3 {
                margin-left: 8px;
            }
        }

        &:hover {
            transition: transform 0.05s;
            transform: scale(1.06);
        }

        &:active {
            transition: transform 0.02s;
            transform: scale(1.1);
        }
    }
</style>