<script>
import Color from "color";

    import GlobalStyles from "./GlobalStyles";

    export let isPlaying;
    export let mainColor;
    export let onPressed = null;
    export let onRightClick = null;
    export let isBig = true;
    export let usePause = false;
    export let domElement = {};

    $: style = `--mainColor: ${isPlaying ? 'white' : mainColor.hex()};`
        + `--iconColor: ${getIconColor()};`;

    $: iconClass = getIconClass(isPlaying, usePause);

    function getIconClass (isPlaying, usePause) {
        if(!isPlaying) return 'play';
        else {
            if(usePause) return 'pause';
            return 'stop';
        }
    };

    function getIconColor() {
        if(!isPlaying) return mainColor.mix(GlobalStyles.bg, 0.62).hex();
        else return Color('white').mix(GlobalStyles.bg, 0.7).hex();
    }

    function onPointerDown(e) {
        if(e.button == 0 || e.pointerType != 'mouse') {
            if(onPressed) onPressed(!isPlaying);
            isPlaying = !isPlaying;
        } else if(e.button == 1 || e.pointerType == 'mouse') {
            if(onRightClick) onRightClick();
        }
    }
</script>

<div bind:this={domElement} class="play-button" class:small={!isBig} style="{style}" on:pointerdown="{onPointerDown}" data-blockselection={true} data-blockdrag={true}>
    <i class="{iconClass} icon-font"></i>
</div>

<style lang="scss">
    @import './fonts.scss';

    .play-button {
        position: absolute;
        height: 58px;
        width: 58px;
        border-radius: 50%;
        top: 5px;
        cursor: pointer;
        box-sizing: border-box;
        text-align: center;
        padding-top: 12px;
        background-color: var(--mainColor, #ccc);
        color: var(--iconColor, #333);

        i {
            font-size: 35px;
            font-family: 'icomoon';
            font-style: normal;
            line-height: 1;
            margin-left: 1px;

            &.play {
                margin-left: 7px;

                &::before {
                    content: "\ea1c";
                }
            }

            &.pause {
                margin-left: 0px;

                &::before {
                    content: "\ea1d";
                }
            }

            &.stop::before {
                content: "\ea1e";
            }
        }

        &:hover {
            transform: scale(1.06);
        }

        &:active {
            transform: scale(1.1);
        }

        &.small {
            width: 34px;
            height: 34px;
            padding-top: 5px;
            border-radius: 0;
            top: 0px;
            left: 0px;
            background-color: transparent;

            i {
                margin-left: 2px;
                font-size: 18px;
                color: var(--mainColor, #ccc);

                &.play {
                    margin-left: 3px;
                }
            }
        }
    }
</style>