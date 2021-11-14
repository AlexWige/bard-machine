<script>
    import TopBar from "./TopBar.svelte";
    import BottomBar from "./BottomBar.svelte";
    import SoundBlock from "./SoundBlock.svelte";
    import GlobalStyles from "./GlobalStyles";
    import InputPrompt from "./InputPrompt.svelte";
    import { onDestroy, onMount, tick } from "svelte";
    const { ipcRenderer } = window.require('electron');
    import fileLoader from "./fileLoader";
    import soundStore from "./soundStore";

    let inputPrompt;

    $: style = `--bg: ${GlobalStyles.bg};`
            + `--topBarHeight: ${GlobalStyles.topBarSize};`;
            
    ipcRenderer.send('open-file-dialog');

    onMount(async () => {
        ipcRenderer.on('selected-directory', (event, path) => onFolderLoaded(path));
    })

    onDestroy(async () => {
        ipcRenderer.removeListener('selected-directory', (event, path) => onFolderLoaded(path))
    });

    function onFolderLoaded(path) {
        fileLoader.getFilePaths(path, data => {
            fileLoader.createSoundDatas(data, 'music');
            fileLoader.createSoundDatas(data, 'ambient');
            fileLoader.createSoundDatas(data, 'sfx');
        });
    }
</script>

<main style={style}>
    <TopBar/>
    <div id="app">
        <div class="first-col">
            <div class="category music">
                <h2>Music</h2>
                <div class="sound-box-container">
                    {#each $soundStore.music.sounds as sound}
                        <SoundBlock blockType="music" bind:soundData={sound} inputPrompt={inputPrompt}/>
                    {/each}
                </div>
            </div>
            <div class="category ambient">
                <h2>Ambient</h2>
                <div class="sound-box-container">
                    {#each $soundStore.ambient.sounds as sound}
                        <SoundBlock blockType="ambient" bind:soundData={sound} inputPrompt={inputPrompt}/>
                    {/each}
                </div>
            </div>
        </div>
        <div class="second-col">
            <div class="category sfx">
                <h2>Effects</h2>
                <div class="sound-box-container">
                    {#each $soundStore.sfx.sounds as sound}
                        <SoundBlock blockType="sfx" bind:soundData={sound} inputPrompt={inputPrompt}/>
                    {/each}
                </div>
            </div>
        </div>        
    </div>
    <BottomBar/>
    <InputPrompt bind:this={inputPrompt}/>
</main>

<style lang="scss">
    @import './fonts.scss';

    main {
        background-color: var(--bg, #333);
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0; 

        #app {
            position: absolute;
            top: var(--topBarHeight, 25px);
            left: 0;
            right: 0;
            padding: 0 5px;
            bottom: 0;
            box-sizing: border-box;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-color: dark;

            &::-webkit-scrollbar {
                width: 10px;
            }

            &::-webkit-scrollbar-corner {
                background: rgba(0,0,0,0);
            }

            &::-webkit-scrollbar-thumb {
                background-color: rgba(252,255,255,0.6);
                border-radius: 4px;
                border: 4px solid rgba(0,0,0,0);
            }

            &::-webkit-scrollbar-track {
                background-color: rgba(0,0,0, 0.1);
            }
        }

        .category {
            float: left;
            box-sizing: border-box;
            padding: 15px;
            padding-bottom: 70px;

            h2 {
                width: 100%;
                margin-top: 5px;
                text-align: center;
                user-select: none;
            }
        }

        .first-col {
            float: left;
            width: 66.66%;

            @media (max-width: 950px) {
                width: 50%;
            }

            @media (max-width: 650px) {
                width: 100%;
            }

            .category {
                width: 50%;
                
                @media (max-width: 950px) {
                    width: 100%;
                }
            }
        }   

        .second-col {
            float: left;
            width: 33.33%;
            
            @media (max-width: 950px) {
                width: 50%;
            }

            @media (max-width: 650px) {
                width: 100%;
            }

            .category {
                width: 100%;
            }
        }
    }
</style>
