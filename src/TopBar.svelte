<script>
    import { onMount } from "svelte";
    import { onHomeScreen } from "./playerStore";
    import GlobalStyles from "./GlobalStyles";
    const { ipcRenderer } = window.require('electron');
    let maximizedWindow = false;

    $: style = `--barHeight: ${GlobalStyles.topBarSize};`;
    let hoveringHomeButton = false;

    onMount(async () => {
        ipcRenderer.on('window-unmaximized', () => {
            maximizedWindow = false;
        });

        ipcRenderer.on('window-maximized', () => {
            maximizedWindow = true;
        });
    });

    function onClickTitle() {
        console.log("hey");
        onHomeScreen.set(true)
    }
</script>

<div id="top-bar" style={style}>
    <div id="home-button" on:click={onClickTitle} on:mouseenter={() => hoveringHomeButton = true} on:mouseleave={() => hoveringHomeButton = false}>
        <img src="icon_color_1.svg" alt="color" style="visibility: hidden;">
        <img src="{hoveringHomeButton ? 'icon_color_1.svg' : 'icon_grey_1.svg'}" id="icon" alt="icon"> <div id="title">Bard Machine</div>
    </div>
    <div id="command-buttons">
        <div class="button close" on:pointerup="{(e) => ipcRenderer.send('close-window')}" >
            <img src="top-bar/title-bar-btn-03-close.svg" alt="Close window">
        </div>
        <div class="button" on:pointerup="{(e) => ipcRenderer.send('maximize-window')}" >
            <img src="top-bar/title-bar-btn-02{maximizedWindow ? 'b' : ''}-enlarge.svg" alt="Maximize window">
        </div>
        <div class="button" on:pointerup="{(e) => ipcRenderer.send('minimize-window')}" >
            <img src="top-bar/title-bar-btn-01-reduce.svg" alt="Minimize window">
        </div>
    </div>
</div>

<style lang="scss">
    #top-bar {
        position: fixed;
        top: 0;
        width: 100%;
        height: var(--barHeight, 25px);
        background-color: rgba(0, 0, 0, 0.4);
        -webkit-user-select: none;
        -webkit-app-region: drag;
        
        #home-button {
            display: block;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 130px;
            cursor: pointer;
            -webkit-app-region: no-drag;

            #title {
                display: block;
                position: absolute;
                font-size: 12px;
                top: 6px;
                left: 40px;
                width: 100px;
                bottom: 0;
                color: #aaa;
                -webkit-app-region: no-drag;
            }

            #icon {
                display: block;
                position: absolute;
                top: 4px;
                left: 11px;
                height: 20px;
                opacity: 0.7;
                -webkit-app-region: no-drag;
            }

            &:hover #title  {
                color: white;
            }

            &:hover #icon  {
                opacity: 1;
            }
        }

        #command-buttons {
            color: white;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            width: 200px;

            .button {
                position: relative;
                box-sizing: border-box;
                -webkit-app-region: no-drag;
                float: right;
                padding: 3px 8px;
                width: 38px;
                height: var(--barHeight, 25px); 
                overflow: hidden;

                &:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                }

                &.close:hover {
                    background-color: #ce2626;
                }

                img {
                    position: relative;
                    overflow: hidden;
                    display: block;
                    box-sizing: border-box;
                    height: 22px;
                }
            }
        }
    }
</style>