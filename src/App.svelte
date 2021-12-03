<script>
    import globalStyles from "./style/globalStyles";
    import collectionLoader from "./collectionLoader";
    import * as pointerManager from "./managers/pointerManager";
    import { onHomeScreen } from "./playerStore";
    import { onDestroy, onMount } from "svelte";
    import TopBar from "./TopBar.svelte";
    import SoundListView from "./SoundListView.svelte";
    import HomeScreen from "./HomeScreen.svelte";
    import ContextMenu from "./ContextMenu.svelte";
    import Modal from "./modal/Modal.svelte";

    $: style = `--bg: ${globalStyles.bg};`;
    
    let saveInterval;

    function onCollectionLoaded() {
        $onHomeScreen = false;
    }

    onMount(async() => {
        pointerManager.onAppMount();

        // Autosave collection every 30s
        saveInterval = setInterval(() => {
            if(collectionLoader.collectionPath != '' && !onHomeScreen)
                collectionLoader.saveCollection();
        }, 30000);

        // **** TEST BUTTON
        // window.addEventListener('keydown', e => {
        //     if(e.key != "t") return;
        // });

        // **** ON DEV
        // collectionLoader.openCollection('C:/Users/Alex/Desktop/tests.bmsounds');
        // $onHomeScreen = false;
    });

    onDestroy(async() => {
        pointerManager.onAppDestroy();
        clearInterval(saveInterval);
    });
</script>

<main style={style}>
    <TopBar/>
    {#if $onHomeScreen}
        <HomeScreen onCollectionLoaded={onCollectionLoaded}/>
    {:else}
        <SoundListView/>
        <ContextMenu/>
    {/if}
    <Modal/>
</main>

<style lang="scss">
    @import './style/fonts.scss';

    main {
        background-color: var(--bg, #333);
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>
