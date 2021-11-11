<script>
    import Color from "color";
    import GlobalColors from "./GlobalColors";

    export let volume = 0.65;
    export let mainColor;
    export let isPlaying = false;

    let bar;
    let knob;
    let activeBar;

    $: iconClass = getVolumeIconClass(volume);

    $: style = `--barColor: ${isPlaying ? mainColor.mix(Color('white'), 0.7).hex() : mainColor.hex()};`
        + `--knobColor: ${isPlaying ? Color('white') : mainColor.mix(Color('white'), 0.65).hex()};`
        + `--iconColor: ${isPlaying ? Color('white') : mainColor.hex()}`;

    function getVolumeIconClass(vol) {
        if(vol < 0.1) return 'mute';
        else if(vol < 0.5) return 'low';
        else if (vol < 0.9) return 'mid';
        else return 'high';
    }

    function onKnobPointerDown(e) {
        window.addEventListener('pointermove', onKnobPointerMove);
        window.addEventListener('pointerup', onKnobPointerUp);
    }

    function onKnobPointerUp(e) {
        window.removeEventListener('pointermove', onKnobPointerMove);
        window.removeEventListener('pointerup', onKnobPointerUp);
    }

    function onKnobPointerMove(e) {
        let rect = bar.getBoundingClientRect();
        let ratio = (e.clientX - rect.left) / (rect.right - rect.left);
        ratio = Math.min(Math.max(ratio, 0), 1);
        moveKnob(ratio);
    }

    function moveKnob(vol) {
        if(vol !== volume) {
            activeBar.style.width = vol * 100 + '%';
            knob.style.left = (vol * 100) + '%';
            volume = vol;
        }    
    }
</script>


<div class="volume-slider" style="{style}">
    <i class="volume-icon {iconClass}"></i>
    <div class="bar" bind:this={bar} on:pointerdown={onKnobPointerDown}>
        <div class="active-volume" bind:this={activeBar}></div>
        <div class="volume-btn" bind:this={knob}
            on:pointerdown={onKnobPointerDown}
        ></div>
    </div>
</div>

<style lang="scss">
    .volume-slider {
        width: 100%;
        height: 8px;

        i {
            &::before {
                font-family: 'icomoon';
                display:  block;
                position: absolute;
                left: 0;
                top: -7px;
                font-size: 20px;
                font-style: normal;
                font-weight: normal;
                color: var(--iconColor, #fff);
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
            position: absolute;
            height: 100%;
            left: 32px;
            right: 0;
            background-color: transparentize(black, 0.75);

            .active-volume {
                position: absolute;
                top: 0;
                bottom: 0;
                width: 60%;
                background-color: var(--barColor, #ccc);
            }
        
            .volume-btn {
                content: ' ';
                display: block;
                position: absolute;
                left: 60%;
                margin-left: -9px;
                width: 18px;
                top: -7px;
                height: 22px;
                border-radius: 4px;
                cursor: pointer;
                transition: 0;
                background-color: var(--knobColor, #fff);
        
                &:hover {
                    transform: scale(1.1);
                }
            }
        }    
    }
</style>