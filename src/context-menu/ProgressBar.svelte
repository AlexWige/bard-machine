<script>
    let bar = {};
    let activeBar = {};
    let currentSound;

    export function subscribeSound(soundAPI) {
        unsubscribeSound();
        if(!soundAPI) return;
        currentSound = soundAPI.getSoundElement();
        currentSound.addEventListener('timeupdate', onSoundUpdate);
        updateBarFromSound(currentSound);
    }

    export function unsubscribeSound() {
        currentSound?.removeEventListener('timeupdate', onSoundUpdate);
    }

    function onSoundUpdate(event) {
        const sound = event.path[0];
        if(sound) updateBarFromSound(sound);
    }

    function updateBarFromSound(sound) {
        const progress = sound.currentTime / sound.duration;
        moveBar(progress);
    }

    function onPointerDown(e) {
        if(!currentSound) return;

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
    }

    function onPointerMove(e) {
        if(!currentSound) return;
        let x = e.touches ? e.touches[0].clientX : e.clientX;
        let rect = bar.getBoundingClientRect();
        let ratio = (x - rect.left) / (rect.right - rect.left);
        ratio = Math.min(Math.max(ratio, 0), 1);
        if(isNaN(ratio)) return;
        moveBar(ratio);
        currentSound.currentTime = currentSound.duration * ratio;
    }

    function moveBar(progress) {
        progress = Math.round(progress * 1000) / 1000;
        if(activeBar) activeBar.style.width = progress * 100 + '%';
    }
</script>

<div class="progress-bar-container" on:pointerdown={onPointerDown}>
    <div class="bar" bind:this={bar}>
        <div class="bar-bg"></div>
        <div bind:this={activeBar} class="active-volume"></div>
    </div>
</div>

<style lang="scss">
    @import '../style/fonts.scss';

    $height: 8px;

    .progress-bar-container {
        width: 100%;
        height: 100%;
        cursor: pointer;

        .bar {
            position: absolute;
            height: $height;
            top: 49%;
            left: 0;
            right: 0;
            transform: translateY(-50%);

            .bar-bg {
                position: absolute;
                width: 100%;
                top: 0;
                bottom: 0;
                background-color: transparentize(white, 0.8);
            }

            .active-volume {
                position: absolute;
                width: 60%;
                top: 0;
                bottom: 0;
                background-color: var(--barColor, #ccc);
            }
        }

        &:hover {
            .active-volume {
                background-color: #eee;
            }
        }
    }
</style>