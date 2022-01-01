<script>
    import globalStyles from "./style/global-styles";
    import BottomBar from "./BottomBar.svelte";
    import InputModal from "./hotkeys/InputModal.svelte";
    import SoundCategory from "./SoundCategory.svelte";
    import RoomSidebar from "./rooms/RoomSidebar.svelte";
    import * as roomsManager from "./rooms/rooms-manager";
    import { currentRoomID } from "./rooms/rooms-manager";
    import { scale, fly } from "svelte/transition";

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
            {#if $currentRoomID != 0}
                <div id="room-title-bg"></div>
            {/if}
            <div class="container">
                <div class="room-title-spacer" class:active={$currentRoomID != 0}></div>
                {#if $currentRoomID != 0}
                <div id="room-title" class:active={$currentRoomID != 0}>
                    <h4 in:fly="{{ x: -100, duration: 200 }}" out:fly="{{ x: -100, duration: 200 }}">ROOM</h4>
                    <h1 in:fly="{{ x: -100, duration: 200, delay: 50 }}" out:fly="{{ x: -100, duration: 200 }}">{roomsManager.getRoomByID($currentRoomID)?.name}</h1>
                </div>
                {/if}
                <div class="categories">
                    <SoundCategory category="music"/>
                    <SoundCategory category="ambient"/>
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
        padding: 0;

        #room-title-bg {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100px;
            background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.20) 100%);
        }

        .room-title-spacer {
            height: 0;
            overflow: hidden;
            box-sizing: border-box;
            transition: height 0.15s;

            &.active {
                height: 120px;
            }
        }

        #room-title {
            position: absolute;
            left: 13px;
            top: 0;
            width: 100%;

            h4 {
                margin: 22px 0 0 0;
                font-size: 12px;
                opacity: 0.8;
            }

            h1 {
                margin: 0;
                font-size: 36px;
                transform: translateY(-5px);
            }
        }

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
            padding: 0;
            box-sizing: border-box;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-color: dark;
        }

        .container {
            width: 94%;
            max-width: 1450px;
            margin: auto;
            position: relative;

            .categories {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
            }
        }
    }
</style>