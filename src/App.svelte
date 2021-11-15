<script>
    import TopBar from "./TopBar.svelte";
    import GlobalStyles from "./GlobalStyles";
    import SoundListView from "./SoundListView.svelte";
    import HomeScreen from "./HomeScreen.svelte";
    import fileLoader from "./fileLoader";
    import { onMount } from "svelte";
    import { onHomeScreen } from "./playerStore";
    const { ipcRenderer } = window.require('electron');

    $: style = `--bg: ${GlobalStyles.bg};`;
    $: collectionPath = fileLoader.collectionPath;

    function onFolderLoaded(path) {
        collectionPath.set(path);
        fileLoader.getFilePaths(path, data => {
            fileLoader.createSoundDatas(data, 'music');
            fileLoader.createSoundDatas(data, 'ambient');
            fileLoader.createSoundDatas(data, 'sfx');
        });
        $onHomeScreen = false;
    }

    onMount(async() => {
        ipcRenderer.on("app-focused", () => {
            fileLoader.refreshFiles();
        });
    });    
</script>

<main style={style}>
    <TopBar/>
    {#if $onHomeScreen}
        <HomeScreen onFolderLoaded={onFolderLoaded}/>
    {:else}
        <SoundListView/>
    {/if}
</main>

<style lang="scss">
    @import './fonts.scss';

    main {
        background-color: var(--bg, #333);
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>
