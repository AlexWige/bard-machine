<script>
    import ProgressBar from "./ProgressBar.svelte";
    import { onMount, onDestroy } from "svelte";

    let progressBar;
    let soundIsPlaying;
    export let soundAPI;

    onMount(async() => {
        subscribeSound();
    });

    onDestroy(async() => {
        progressBar.unsubscribeSound();
    });

    export function updateSound(_soundAPI) {
        soundAPI = _soundAPI;
        subscribeSound();
    }

    function subscribeSound() {
        soundIsPlaying = soundAPI.isPlaying();
        progressBar.subscribeSound(soundAPI);
    }

    function onStopPressed() {
        soundAPI.stop();
        soundIsPlaying = soundAPI.isPlaying();
    }

    function onPlayPressed() {
        soundAPI.play();
        soundIsPlaying = soundAPI.isPlaying();
    }

    function onRestartPressed() {
        soundAPI.getSoundElement().currentTime = 0;
    }
</script>

<div class="controls-container">
    &nbsp;
    {#if soundIsPlaying}
    <div class="stop-button button" on:click={onStopPressed}></div>
    {:else}
    <div class="play-button button" on:click={onPlayPressed}></div>
    {/if}
    <div class="restart-button button" on:click={onRestartPressed}></div>
    <div class="progress-bar">
        <ProgressBar bind:this={progressBar}/>
    </div>
</div>

<style lang='scss'>
    div.controls-container {
        .button {      
            position: absolute;
            top: 0;
            bottom: 0;
            width: 30px;
            opacity: 0.8;
            cursor: pointer;

            &::before {
                display: block;
                position: absolute;
                font-family: icomoon;
                font-size: 18px;
                top: var(--verticalPadding, 4px);
                left: 5.5px;
            }

            &:hover {
                opacity: 1;
            }
        }

        .stop-button, .play-button {
            left: 4px;

            &::before {
                content: '\ea1e';
            }
        }

        .play-button {
            &::before {
                content: '\ea1c';
            }
        }

        .restart-button {
            left: 34px;

            &::before {
                left: 3px;
                content: '\ea23';
                transform: scaleX(1.4);
            }
        }

        .progress-bar {
            position: absolute;
            left: 64px;
            right: 10px;
            top: 0;
            bottom: 0;
        }
    }
</style>