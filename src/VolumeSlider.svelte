<script>
    import Color from "color";
    import { onMount } from "svelte";
    import fileLoader from "./fileLoader";

    export let volume;
    export let mainColor;
    export let isPlaying = false;
    export let onChange = (v) => {};
    export let isBig = true;
    export let domElement = {};

    let bar;
    let activeBar;

    $: iconClass = getVolumeIconClass(volume);

    $: updateVolume(volume);

    $: style = `--barColor: ${isPlaying ? Color('white') : mainColor.hex()};`;

    onMount(async() => {
        moveKnob(volume);
    });

    function getVolumeIconClass(vol) {
        if(vol < 0.1) return 'mute';
        else if(vol < 0.5) return 'low';
        else if (vol < 0.9) return 'mid';
        else return 'high';
    }

    function onPointerDown(e) {
        if(e.pointerType == "mouse" && e.button != 0) return;
        
        onPointerMove(e);
        if(e.pointerType == "mouse") {
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        } else {
            window.addEventListener('touchmove', onPointerMove);
            window.addEventListener('touchend', onPointerUp);
        }
    }

    function onPointerUp(e) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
        fileLoader.saveCollection();
    }

    function onPointerMove(e) {
        let x = e.touches ? e.touches[0].clientX : e.clientX;
        let rect = bar.getBoundingClientRect();
        let ratio = (x - rect.left) / (rect.right - rect.left);
        ratio = Math.min(Math.max(ratio, 0), 1);
        if(isNaN(ratio)) return;
        moveKnob(ratio);
    }

    function moveKnob(vol) {
        vol = Math.round(vol * 1000) / 1000;
        volume = vol;
        updateVolume(volume);
        onChange(vol);
    }

    function updateVolume(volume) {
        if(activeBar) activeBar.style.width = volume * 100 + '%';
    }
</script>


<div bind:this={domElement}  class="volume-slider" class:small={!isBig} style="{style}" data-blockselection={true} data-blockdrag={true}>
    <i class="icon-font volume-icon {iconClass}"></i>
    <div class="bar" bind:this={bar} on:pointerdown={onPointerDown}>
        <div class="bar-bg"></div>
        <div class="active-volume" bind:this={activeBar}></div>
    </div>
</div>

<style lang="scss">
    @import './fonts.scss';

    $safe-margin: 8px;

    .volume-slider {
        width: 100%;
        height: 100%;

        i {
            &::before {
                font-family: 'icomoon';
                display:  block;
                position: absolute;
                left: 0;
                top: 50%;
                margin-top: -8.5px;
                font-size: 17px;
                font-style: normal;
                font-weight: normal;
                color: var(--barColor, #fff);
                text-shadow: none;
            }
        
            &.mute::before {
                content: "\ea29";
            }
            &.low::before {
                content: "\ea28";
            }
            &.mid::before {
                content: "\ea27";
            }
            &.high::before {
                content: "\ea26";
            }
        }

        .bar {
            cursor: pointer;
            position: absolute;
            top: -$safe-margin;
            bottom: -$safe-margin;
            left: 26px;
            right: 0;

            .bar-bg {
                top: $safe-margin;
                bottom: $safe-margin;
                width: 100%;
                position: absolute;
                background-color: transparentize(black, 0.7);
            }

            .active-volume {
                position: absolute;
                top: $safe-margin;
                bottom: $safe-margin;
                width: 60%;
                background-color: var(--barColor, #ccc);
            }
        
            .volume-btn {
                content: ' ';
                display: block;
                opacity: 0;
                position: absolute;
                left: 60%;
                margin-left: -9px;
                width: 20px;
                top: -7px;
                height: 20px;
                border-radius: 50%;
                cursor: pointer;
                background-color: var(--barColor, #fff);
        
                &:hover {
                    transform: scale(1.1);
                }
            }
        }

        &.small {
            i {
                display: none;
            }

            .bar {
                left: 0px;
            }

            .volume-btn {
                opacity: 0;
                height: 15px;
                top: -4px;
                width: 14px;
                margin-left: -7px;
                border-radius: 2px;
            }
        }
    }
</style>