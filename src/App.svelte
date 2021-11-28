<script>
    import TopBar from "./TopBar.svelte";
    import GlobalStyles from "./GlobalStyles";
    import SoundListView from "./SoundListView.svelte";
    import HomeScreen from "./HomeScreen.svelte";
    import fileLoader from "./fileLoader";
    import { onDestroy, onMount } from "svelte";
    import { onHomeScreen } from "./playerStore";
    import ContextMenu from "./ContextMenu.svelte";
    import Modal from "./Modal/Modal.svelte";
    import * as pointerManager from "./Managers/PointerManager";
    $: style = `--bg: ${GlobalStyles.bg};`;
    
    let saveInterval;

    function onCollectionLoaded() {
        $onHomeScreen = false;
    }

    onMount(async() => {
        pointerManager.onAppMount();

        window.addEventListener('keydown', e => {
            if(e.key != "a") return;
            // soundStore.update(store => {
            //     console.log(store);
            //     return store;
            // })
            // apis.modal.show("Hey les potes !", [{ name: "yes", onClick: () => {
            //     $onHomeScreen = true;
            //     apis.modal.hide();
            // }}]);
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
    @import './fonts.scss';

    main {
        background-color: var(--bg, #333);
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>
