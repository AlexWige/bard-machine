<script>
    import globalStyles from "../style/global-styles";
    import RoomButton from "./RoomButton.svelte";
    import ResizeGrabZone from "../utils/ResizeGrabZone.svelte";

    let resizeBarWidth = 300;
    $: barWidth = resizeBarWidth;

    $: style = `--bg: ${globalStyles.bg.darken(0.3)};`
        + `--dockBG: ${globalStyles.bg.darken(0.5)};`
        + `--barWidth: ${barWidth}px;`;

</script>

<div id="room-sidebar" class="custom-scroll" style={style}>
    <div id="rooms">
        <h2>&lt; Rooms</h2>
        <RoomButton/>
        <RoomButton/>
        <RoomButton/>
        <RoomButton/>
        <RoomButton/>
        <RoomButton/>
        <RoomButton/>
        <RoomButton/>
        <RoomButton/>
    </div>
    <ResizeGrabZone min=150 max=450 bind:width={resizeBarWidth}/>
</div>

<style lang="scss">
    #room-sidebar {
        display: flex;
        position: relative;
        background-color: var(--bg);
        height: 100%;
        width: var(--barWidth);
        box-sizing: border-box;

        #rooms {
            flex: 1;
            padding: 0px 10px;
            border-right: 1px rgba(0, 0, 0, 0.25) solid;
            overflow-x: hidden;
            overflow-y: auto;
        }
    }
</style>