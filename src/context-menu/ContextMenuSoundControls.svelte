<script>
    import ProgressBar from "./ProgressBar.svelte";
</script>

<div class="controls-container">
    &nbsp;
    <div class="play-stop-button button"></div>
    <div class="restart-button button"></div>
    <div class="progress-bar">
        <ProgressBar/>
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

        .play-stop-button {
            left: 0;

            &::before {
                content: '\ea1e';
            }
        }

        .restart-button {
            left: 30px;

            &::before {
                content: '\ea23';
            }
        }

        .progress-bar {
            position: absolute;
            left: 60px;
            right: 5px;
            top: 0;
            bottom: 0;
        }
    }
</style>