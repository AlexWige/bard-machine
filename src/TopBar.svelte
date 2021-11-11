<script>
import { onMount } from "svelte";
const { ipcRenderer } = window.require('electron');
let maximizedWindow = false;

onMount(async () => {
    ipcRenderer.on('window-unmaximized', () => {
        maximizedWindow = false;
    });

    ipcRenderer.on('window-maximized', () => {
        maximizedWindow = true;
    });

    document.getElementById("min-btn").addEventListener("click", function (e) {
        ipcRenderer.send('minimize-window');
    });

    document.getElementById("max-btn").addEventListener("click", function (e) {
        ipcRenderer.send('maximize-window');
    });

    document.getElementById("close-btn").addEventListener("click", function (e) {
        ipcRenderer.send('close-window');
    }); 
});
</script>

<div id="top-bar">
    <div id="command-buttons">
        <img src="top-bar/title-bar-btn-03-close.svg" alt="Close" class="button" id="close-btn">
        <img src="top-bar/title-bar-btn-02{maximizedWindow ? 'b' : ''}-enlarge.svg" alt="Enlarge" class="button" id="max-btn">
        <img src="top-bar/title-bar-btn-01-reduce.svg" alt="Reduce" class="button" id="min-btn">
    </div>
</div>

<style lang="scss">
    #top-bar {
        $top-bar-height: 24px;

        position: fixed;
        top: 0;
        width: 100%;
        height: $top-bar-height;
        background-color: rgba(0, 0, 0, 0.4);
        -webkit-user-select: none;
        -webkit-app-region: drag;

        #command-buttons {
            color: white;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            width: 200px;

            .button {
                -webkit-app-region: no-drag;
                float: right;
                padding: 0 8px;
                width: $top-bar-height;

                &:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                }
            }
        }
    }
</style>