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
        if(soundAPI) {
            soundIsPlaying = soundAPI.isPlaying();
            progressBar.subscribeSound(soundAPI);
        }
    }

    function onStopPressed() {
        soundAPI.stop();
        soundIsPlaying = soundAPI.isPlaying();
    }

    function onPlayPressed() {
        soundAPI.play();
        soundIsPlaying = soundAPI.isPlaying();
    }

    function onPrevPressed() {
        if(soundAPI.getData().sources.length > 1 && soundAPI.getCurrentTime() < 2) {
            soundAPI.setSourceIndex(soundAPI.getCurrentSourceIndex() - 1);
        }
        soundAPI.getSoundElement().currentTime = 0;
    }

    function onNextPressed() {
        if(soundAPI.getData().sources.length > 1) {
            soundAPI.setSourceIndex(soundAPI.getCurrentSourceIndex() + 1);
        }
    }
</script>

<div class="controls-container">
    {#if soundIsPlaying}
        <div class="stop-button button" on:click={onStopPressed}></div>
    {:else}
    <div class="play-button button" on:click={onPlayPressed}></div>
    {/if}
    <div class="prev-button button" on:click={onPrevPressed}></div>
    {#if soundAPI.getData().sources.length > 1}
        <div class="next-button button" on:click={onNextPressed}></div>
    {/if}
    <div class="progress-bar">
        <ProgressBar bind:this={progressBar}/>
    </div>
</div>

<style lang='scss'>
    div.controls-container {
        display: flex;
        margin: 0 -3px;
        justify-content: flex-start;
        gap: 4px;

        .button {
            width: 25px;
            height: 20px;
            opacity: 0.8;
            cursor: pointer;
            position: relative;
            box-sizing: border-box;
            margin: 0;

            &::before {
                display: block;
                position: absolute;
                font-family: icomoon;
                font-size: 18px;
                top: 0;
                left: 3px;
            }

            &:hover {
                opacity: 1;
            }
        }

        .stop-button::before {
            content: '\ea1e';
        }

        .play-button::before {
            content: '\ea1c';
        }

        .prev-button::before {
            content: '\ea23';
            transform: scaleX(1.4);
        }

        .next-button::before {
            content: '\ea24';
            transform: scaleX(1.4);
            left: 1px;
        }

        .progress-bar {
            flex: 1;
            height: 18px;
            position: relative;
        }
    }
</style>