<script>
    import globalStyles from "./style/global-styles";
    import collectionLoader from "./collection-loader";
    import { collectionPath } from "./collection-paths";
    import * as pointerManager from "./pointer/pointer-manager";
    import { onHomeScreen } from "./player-store";
    import { onDestroy, onMount } from "svelte";
    import * as hotkeys from "./hotkeys/hotkey-manager";
    import TopBar from "./TopBar.svelte";
    import SoundListView from "./SoundListView.svelte";
    import HomeScreen from "./HomeScreen.svelte";
    import ContextMenu from "./context-menu/ContextMenu.svelte";
    import Modal from "./modal/Modal.svelte";
    import 'tippy.js/dist/tippy.css';
    import tippy from "tippy.js";
    import soundStore from "./sound-blocks/sound-store";
    const { ipcRenderer } = window.require('electron');

    $: style = `--bg: ${globalStyles.bg};`;
    
    let saveInterval;

    onMount(async() => {
        pointerManager.onAppMount();
        collectionLoader.onAppMount();
        hotkeys.onAppMount();
        ipcRenderer.send('app-mounted');

        // Autosave collection every 30s
        saveInterval = setInterval(() => {
            if(collectionPath.get() != '' && !onHomeScreen)
                collectionLoader.saveCollection();
        }, 30000);

        tippy.setDefaultProps({ delay: [1000, 0], touch: false });

        // **** TEST BUTTON
        window.addEventListener('keydown', e => {
            if(e.key != "t") return;
            soundStore.update(store => {
                console.log(store);
                return store;
            });
        });

        // **** ON DEV
        // collectionLoader.openCollection('C:\\Users\\alexa\\Desktop\\tests.bmsounds');
        // $onHomeScreen = false;
    });

    onDestroy(async() => {
        collectionLoader.onAppDestroy();
        pointerManager.onAppDestroy();
        hotkeys.onAppDestroy();
        clearInterval(saveInterval);
    });
</script>

<main style={style}>
    <TopBar/>
    {#if $onHomeScreen}
        <HomeScreen/>
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
