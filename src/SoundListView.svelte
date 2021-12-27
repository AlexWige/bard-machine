<script>
    import globalStyles from "./style/global-styles";
    import BottomBar from "./BottomBar.svelte";
    import InputModal from "./hotkeys/InputModal.svelte";
    import SoundCategory from "./SoundCategory.svelte";
    import RoomSidebar from "./rooms/RoomSidebar.svelte";

    $: style = `--bg: ${globalStyles.bg};`
            + `--topBarHeight: ${globalStyles.topBarSize};`
            + `--musicColor: ${globalStyles.music};`
            + `--ambientColor: ${globalStyles.ambient};`
            + `--effectsColor: ${globalStyles.effects};`
            + `--bottomBarHeight: 60px;`;
</script>

<div id="sound-list-view" style="{style}">
    <div class="center-container">
        <!-- <RoomSidebar/> -->
        <div id="sound-list" class="custom-scroll">
            <div class="container">
                <div class="first-col">
                    <SoundCategory category="music"/>
                    <SoundCategory category="ambient"/>
                </div>
                <div class="second-col">
                    <SoundCategory category="effects"/>
                </div>
            </div>
            <InputModal/>
        </div>
    </div>
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

        .center-container {
            display: flex;
            flex-direction: row;
            position: absolute;
            top: 0;
            width: 100%;
            bottom: var(--bottomBarHeight);
        }

        #sound-list {
            height: 100%;
            flex: 1;
            padding: 0 5px;
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