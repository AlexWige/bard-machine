<script>
    const { ipcRenderer } = window.require('electron');
    import collectionLoader from "./collection-loader";
    import globalStyles from './style/global-styles';
    import tippy from "tippy.js";
    import { onMount } from "svelte";

    export let category = 'music';

    let rootNode;

    onMount(async() => {
        tippy(rootNode, { content : 'Open file browser...' });
    });

    function askForSoundPaths() {
        ipcRenderer.addListener('import-new-sounds', onSoundPathResponse);
        ipcRenderer.send('dialog-import-sounds');
    }

    function onSoundPathResponse(e, paths) {
        ipcRenderer.removeListener('import-new-sounds', onSoundPathResponse);
        collectionLoader.addSounds(paths, category);
        collectionLoader.saveCollection();
    }

    $: style = `--bg: ${globalStyles.bg.darken(0.1)};`
            + `--bgHover: ${globalStyles.bg.lighten(0.5)};`;
</script>

<div bind:this={rootNode} class="add-button" on:click={askForSoundPaths} style={style}>Add sounds…</div>

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