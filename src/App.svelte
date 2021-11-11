<script>
    import TopBar from "./TopBar.svelte";
    import BottomBar from "./BottomBar.svelte";
    import SoundBlock from "./SoundBlock.svelte";
    import GlobalColors from "./GlobalColors";
    import InputPrompt from "./InputPrompt.svelte";
    import { onMount } from "svelte";

    let inputPrompt;

    $: style = `--bg: ${GlobalColors.bg};`
</script>

<main style={style}>
    <TopBar/>
    <div id="app">
        <div class="first-col">
            <div class="category music">
                <h2>Music</h2>
                <div class="sound-box-container">
                    <SoundBlock blockType="music" title="Titre de la musique" inputPrompt={inputPrompt}/>
                    <SoundBlock blockType="music" title="Titre de la musique" inputPrompt={inputPrompt}/>
                    <SoundBlock blockType="music" title="Titre de la musique" inputPrompt={inputPrompt}/>
                </div>
            </div>
            <div class="category ambient">
                <h2>Ambient</h2>
                <div class="sound-box-container">
                    <SoundBlock blockType="ambient" title="Titre de l'ambiance"/>
                    <SoundBlock blockType="ambient" title="Titre de l'ambiance"/>
                    <SoundBlock blockType="ambient" title="Titre de l'ambiance"/>
                </div>
            </div>
        </div>
        <div class="second-col">
            <div class="category sfx">
                <h2>Effects</h2>
                <div class="sound-box-container">
                    <SoundBlock blockType="sfx" title="Titre de l'effet"/>
                    <SoundBlock blockType="sfx" title="Titre de l'effet"/>
                    <SoundBlock blockType="sfx" title="Titre de l'effet"/>
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
            top: 24px;
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
