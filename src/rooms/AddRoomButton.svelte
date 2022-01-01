<script>
    import globalStyles from '../style/global-styles';
    import tippy from "tippy.js";
    import { onMount } from "svelte";
    import { createRoom } from "./rooms-manager";
    import { modal } from "../modal/modal-manager";
    import collectionLoader from '../collection-loader';

    let mainNode;

    onMount(async() => {
        tippy(mainNode, { content : 'Create new room from current state' });
    });

    function onButtonClick(e) {
        modal.show(
            "New Room Name",
            [
                { name: "Cancel", hotkey: 'Escape', onClick: () => modal.hide() },
                { name: "OK", hotkey: 'Enter', onClick: () => {
                    let name = modal.getInputValue();
                    createRoom(name);
                    modal.hide();
                    collectionLoader.saveCollection();
                }}
            ],
            { value: "New Room", placeHolder: 'Enter Room Name...' }
        );
    }

    $: style = `--bg: ${globalStyles.bg.darken(0.1)};`
            + `--bgHover: ${globalStyles.bg.lighten(0.5)};`;
</script>

<div bind:this={mainNode} class="add-button" on:click={onButtonClick} style={style}>Create Room</div>

<style lang="scss">
    .add-button {
        position: relative;
        margin: 10px auto;
        margin-top: 20px;
        width: fit-content;
        text-align: center;
        font-size: 12px;
        padding: 5px 16px;
        padding-left: 32px;
        border-radius: 50px;
        color: rgba(white, 0.8);
        background-color: var(--bg, #333);
        border: 1px rgba(white, 0.1) solid;

        &::before {
            content: '+';
            position: absolute;
            top: 0;
            left: 12px;
            font-size: 18px;
        }

        &:hover {
            cursor: pointer;
            color: white;
            background-color: var(--bgHover, #333);
            border: 1px rgba(white, 0.4) solid;
        }

        &:active {
            background-color: var(--bg, #333);
            border: 1px rgba(white, 0.6) solid;
        }
    }
</style>