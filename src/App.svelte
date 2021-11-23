<script>
    import TopBar from "./TopBar.svelte";
    import GlobalStyles from "./GlobalStyles";
    import SoundListView from "./SoundListView.svelte";
    import HomeScreen from "./HomeScreen.svelte";
    import fileLoader from "./fileLoader";
    import { onDestroy, onMount } from "svelte";
    import { onHomeScreen } from "./playerStore";
    import SoundContextMenu from "./SoundContextMenu.svelte";
    import soundStore from "./soundStore";
    import SelectionManager from "./SelectionManager.svelte";

    $: style = `--bg: ${GlobalStyles.bg};`;
    
    let saveInterval;

    function onCollectionLoaded() {
        $onHomeScreen = false;
    }

    onMount(async() => {
        window.addEventListener('keydown', e => {
            if(e.key != "a") return;
            // soundStore.update(store => {
            //     console.log(store);
            //     return store;
            // })
        });

        // Autosave collection every 30s
        saveInterval = setInterval(() => {
            if(fileLoader.collectionPath != '' && !onHomeScreen)
                fileLoader.saveCollection();
        }, 30000);
        
        // On Dev
        // fileLoader.openCollection('C:/Users/Alex/Desktop/tests.bmsounds');
        // $onHomeScreen = false;
    });

    onDestroy(async() => {
        clearInterval(saveInterval);
    });
</script>

<main style={style}>
    <TopBar/>
    {#if $onHomeScreen}
        <HomeScreen onCollectionLoaded={onCollectionLoaded}/>
    {:else}
        <SoundListView/>
        <SoundContextMenu/>
        <SelectionManager/>
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
