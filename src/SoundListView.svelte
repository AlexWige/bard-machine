<script>
    import globalStyles from "./style/global-styles";
    import BottomBar from "./BottomBar.svelte";
    import InputModal from "./hotkeys/InputModal.svelte";
    import SoundCategory from "./SoundCategory.svelte";

    $: style = `--bg: ${globalStyles.bg};`
            + `--topBarHeight: ${globalStyles.topBarSize};`
            + `--musicColor: ${globalStyles.music};`
            + `--ambientColor: ${globalStyles.ambient};`
            + `--effectsColor: ${globalStyles.effects};`;
</script>

<div id="sound-list-view" style="{style}">
    <div id="app" class="custom-scroll">
        <div class="container">
            <div class="first-col">
                <SoundCategory category="music"/>
                <SoundCategory category="ambient"/>
            </div>
            <div class="second-col">
                <SoundCategory category="effects"/>
            </div>
        </div>
    </div>
    <InputModal/>
    <BottomBar/>
</div>


<style lang="scss">
    @import './style/fonts.scss';

    #sound-list-view {
        position: fixed;
        background-color: var(--bg, #333);
        top: var(--topBarHeight, 25);
        bottom: 0;
        width: 100%;
        overflow: hidden;

        #app {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 0 5px;
            bottom: 60px;
            box-sizing: border-box;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-color: dark;
        }

        .container {
            width: 94%;
            max-width: 1450px;
            margin: auto;
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

            :global(.category) {
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

            :global(.category) {
                width: 100%;
            }
        }
    }
</style>