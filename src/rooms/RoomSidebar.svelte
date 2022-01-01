<script>
    import globalStyles from "../style/global-styles";
    import RoomButton from "./RoomButton.svelte";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import AddRoomButton from "./AddRoomButton.svelte";
    import { mainRoom } from "./rooms-manager";
    import roomsStore from "./rooms-store";

    let opened = false;

    $: style = `--bg: ${opened ? globalStyles.bg.darken(0.3) : globalStyles.bg.darken(0.15)};`
        + `--barWidth: ${opened ? 'clamp(200px, 23.6%, 380px)' : '20px'};`;

    onMount(async() => {
        opened = localStorage.getItem('opened-room-sidebar') == 'true';
    });

    function setOpened(state) {
        opened = state;
        localStorage.setItem('opened-room-sidebar', state);
    }

</script>

<div id="room-sidebar" class="custom-scroll" style={style}>
    {#if opened}
    <div id="rooms" in:fly="{{ delay: 110 }}">
        <h2 on:click={() => setOpened(false)}><span class="chevron-left"></span> Rooms</h2>
        <RoomButton {...$mainRoom}/>
        <hr/>
        <div class="rooms-list">
            {#each $roomsStore as room (room.id)}
                <RoomButton 
                    bind:id={room.id} 
                    bind:name={room.name} 
                    bind:isActive={room.isActive} 
                    bind:playingMusic={room.playingMusic} 
                    bind:playingAmbient={room.playingAmbient}
                />
            {/each}
        </div>
        <AddRoomButton/>
    </div>
    {/if}
    {#if !opened}
        <div on:click={() => setOpened(true)} class="enlarge-icon"></div>
    {/if}
</div>

<style lang="scss">
    #room-sidebar {
        display: flex;
        position: relative;
        background-color: var(--bg);
        height: 100%;
        width: var(--barWidth);
        box-sizing: border-box;
        overflow: visible;
        transition: 0.2s;
        #rooms {
            flex: 1;
            padding: 0px 10px;
            border-right: 1px rgba(0, 0, 0, 0.25) solid;
            overflow-x: hidden;
            overflow-y: auto;
        }

        h2 {
            text-align: center;
            transform: translateX(-5px);
            cursor: pointer;
            color: rgba(255, 255, 255, 0.8);
            font-size: 18px;
            margin-bottom: 20px;

            &:hover {
                color: white;
            }

            .chevron-left::before {
                display: inline-block;
                font-family: 'icomoon';
                content: '\e908';
                font-size: 0.7em;
            }
        }

        hr {
            margin: 8px auto;
            border: none;
            border-bottom: 1px rgba(255, 255, 255, 0.22) solid;
        }

        .enlarge-icon {
            display: flex;
            position: absolute;
            width: 100%;
            top: 0;
            bottom: 0;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            overflow: visible;

            &::after {
                display: block;
                content: ' ';
                background-color: var(--bg);
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                width: 5px;
                transition: 0.1s;
            }
            
            &:hover::after {
                right: -8px;
                width: 8px;
            }

            &::before {
                display: block;
                font-family: 'icomoon';
                content: '\e90c';
                transform: translateX(-1px);
                color: rgba(255, 255, 255, 0.26);
                transition: 0.1s;
            }

            &:hover::before {
                transform: translateX(2px) scale(1.25);
                color: white;
            }
        }
    }
</style>