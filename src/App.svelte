<script>
    import TopBar from "./TopBar.svelte";
    import GlobalStyles from "./GlobalStyles";
    import SoundListView from "./SoundListView.svelte";
    import HomeScreen from "./HomeScreen.svelte";
    import fileLoader from "./fileLoader";
    import { onMount } from "svelte";
    import { onHomeScreen } from "./playerStore";
    import SoundContextMenu from "./SoundContextMenu.svelte";
    import soundStore from "./soundStore";
    const { ipcRenderer } = window.require('electron');

    $: style = `--bg: ${GlobalStyles.bg};`;
    $: collectionPath = fileLoader.collectionPath;

    function onCollectionLoaded() {
        $onHomeScreen = false;
    }

    onMount(async() => {
        window.addEventListener('keydown', e => {
            if(e.key != "a") return;
            soundStore.update(store => {
                console.log(store.sounds);
                return store;
            });
        });
        
        fileLoader.openCollection('C:/Users/Alex/Desktop/tests.bmsounds');
        $onHomeScreen = false;
    });    
</script>

<main style={style}>
    <TopBar/>
    {#if $onHomeScreen}
        <HomeScreen onCollectionLoaded={onCollectionLoaded}/>
    {:else}
        <SoundListView/>
        <SoundContextMenu/>
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
