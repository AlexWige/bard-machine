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
        <RoomSidebar/>
        <div id="sound-list" class="custom-scroll">
            <div class="container">
                <SoundCategory category="music"/>
                <SoundCategory category="ambient"/>
                <SoundCategory category="effects"/>
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
            display: flex;
            flex-wrap: wrap;
            width: 94%;
            max-width: 1450px;
            margin: auto;
        }
    }
</style>