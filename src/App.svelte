<script>
    import TopBar from "./TopBar.svelte";
    import GlobalStyles from "./GlobalStyles";
    import SoundListView from "./SoundListView.svelte";
    import HomeScreen from "./HomeScreen.svelte";
    import fileLoader from "./fileLoader";

    $: style = `--bg: ${GlobalStyles.bg};`;

    let homeScreen = true;

    function onFolderLoaded(path) {
        fileLoader.getFilePaths(path, data => {
            fileLoader.createSoundDatas(data, 'music');
            fileLoader.createSoundDatas(data, 'ambient');
            fileLoader.createSoundDatas(data, 'sfx');
        });
        homeScreen = false;
    }
    
</script>

<main style={style}>
    <TopBar/>
    {#if homeScreen}
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
