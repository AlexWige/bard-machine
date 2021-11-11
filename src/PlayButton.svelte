<script>
    import GlobalColors from "./GlobalColors";

    export let isPlaying = false;
    export let mainColor;
    $: style = `--mainColor: ${mainColor.hex()};`
        + `--iconColor: ${mainColor.mix(GlobalColors.bg, 0.62).hex()};`;

    function onClick() {
        isPlaying = !isPlaying;
        console.log(isPlaying);
    }
</script>

<div class="play-button" style="{style}" on:click="{onClick}">
    <i class="{isPlaying ? 'icon-stop2' : 'icon-play3'}"></i>
</div>

<style lang="scss">
    @import './fonts.scss';

    $size: 72px;

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
        padding-top: 17px;
        transition: transform 0.2s background-color 0.1s;
        background-color: var(--mainColor, #ccc);
        color: var(--iconColor, #333);

        i {
            font-size: 38px;

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