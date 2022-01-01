<script>
    import PlaylistItem from "./PlaylistItem.svelte";
    import globalStyles from "../style/global-styles";
    import { onMount, onDestroy, tick } from "svelte";
    import * as playlistManager from "./playlists";
    import collectionLoader from "../collection-loader";
    import soundStore from "../sound-blocks/sound-store";
    import AddSoundButton from "../sound-blocks/AddSoundButton.svelte";
    import { SoundDataSource, getNewSourceID } from "../sound-blocks/sound-data";
    import { modal } from "../modal/modal-manager";

    $: style = `--bgCache: ${globalStyles.bg.darken(0.5).fade(0.4)};`
            + `--boxBG: ${globalStyles.bg.lighten(0.2)};`
            + `--titleBG: ${globalStyles.bg.lighten(0.6)};`
            + `--optionHoverBG: ${globalStyles.bg.lighten(0.8)};`
            + `--topBarHeight: ${globalStyles.topBarSize};`;

    let title = "";
    let visible = false;
    let playlistID = 0;
    $: sources = getSources($soundStore);

    const api = {
        show: show,
        hide: hide
    }

    function show(_playlistID) {
        playlistID = _playlistID;
        title = getPlaylist().data.title;
        visible = true;
    }

    function hide() {
        visible = false;
    }

    function onClickOK() {
        const playlist = getPlaylist();
        playlist.data.title = title;

        if(playlist.data.sources.length == 0) {
            modal.show(
                "Without sounds, this playlist will be deleted.",
                [
                    { name: "Cancel", hotkey: 'Escape', onClick: () => modal.hide() },
                    { name: "Delete playlist", hotkey: 'Enter', onClick: () => {
                        let newName = modal.getInputValue();
                        soundStore.update(store => {
                            const playlist = store.find(s => s.id == playlistID);
                            store = store.filter(s => s != playlist);
                            return store;
                        });
                        modal.hide();
                        hide();
                        collectionLoader.saveCollection();
                    }}
                ]
            );
        } else if(playlist.data.sources.length == 1) {
            modal.show(
                "Playlist will be converted to normal sound.",
                [
                    { name: "Cancel", hotkey: 'Escape', onClick: () => modal.hide() },
                    { name: "OK", hotkey: 'Enter', onClick: () => {
                        const playlist = getPlaylist();
                        playlist.data.title = playlist.data.sources[0].title;
                        modal.hide();
                        hide();
                        collectionLoader.saveCollection();
                    }}
                ]
            );
        } else {
            collectionLoader.saveCollection();
            tick();
            hide();
        }
    }

    function getPlaylist() {
        return soundStore.getItemByID(playlistID);
    }

    function getSources(soundStore) {
        const playlist = soundStore.find(s => s.id == playlistID);
        if(playlist) return playlist.data.sources;
        else return [];
    }

    onMount(async() => {
        playlistManager.registerEditorWindow(api);
        window.addEventListener('keydown', onKeyDown);
    });

    onDestroy(async() => {
        window.removeEventListener('keydown', onKeyDown);
    });

    function onKeyDown(e) {
        if(visible && e.key == "Enter") onClickOK();
    }

    function onSoundPathAdded(paths) {
        soundStore.update(store => {
            const playlist = store.find(s => s.id == playlistID);
            paths.forEach(path => {
                const newSource = new SoundDataSource(path);
                newSource.id = getNewSourceID(playlist.data);
                playlist.data.sources.push(newSource);
            });
            return store;
        });
        collectionLoader.saveCollection();
    }
</script>

{#if visible}
<div id="modal" style={style}>
    <div class="modal-content">
        <div class="title-box">
            <div class="title">Playlist</div>
            <input type="text" name="playlist-name" bind:value={title} id="playlist-name"/>
        </div>
        <div class="tracks-container custom-scroll">
            {#each sources as source (source.id)}
                <PlaylistItem source={source} sourceID={source.id} playlistID={playlistID}/>
            {/each}
            <AddSoundButton onSoundPathAdded={onSoundPathAdded} />
        </div>
        <div class="bottom-options">
            <div class="option" on:click={onClickOK}>Close</div>
        </div>
    </div>
</div>
{/if}

<style lang="scss">
    #modal {
        display: block;
        background-color: var(--bgCache, #333333cc);
        position: fixed;
        top: var(--topBarHeight, 25px);
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;

        .modal-content {
            position: fixed;
            z-index: 1001;
            left: 50%;
            top: 15%;
            bottom: 20%;
            transform: translateX(-50%);
            width: 80%;
            max-width: 500px;
            background-color: var(--boxBG, #ccc);
            box-shadow: 0 0 20px 1px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;

            &>div {
                width: 100%;
                box-sizing: border-box;
                border-bottom: 1px rgba(0, 0, 0, 0.363) solid;

                &:last-of-type {
                    border-bottom: none;
                }
            }

            .title-box {
                height: 85px;
                padding: 10px;
                background-color: var(--titleBG);

                .title {
                    font-size: 13px;
                    color: #aaa;
                    margin-bottom: 4px;
                    padding-left: 3px;
                }
            }

            .tracks-container {
                flex: 1;
                overflow-x: hidden;
                overflow-y: scroll;
                padding-bottom: 50px;
                padding-top: 2px;
            }

            .bottom-options {
                display: flex;
                height: 45px;

                .option {           
                    flex: 1;         
                    height: 100%;
                    background-color: var(--titleBG);
                    border-right: 1px rgba(0, 0, 0, 0.164) solid;
                    text-align: center;
                    padding-top: 9px;
                    cursor: pointer;

                    &:last-of-type {
                        border-right: none;
                    }
                    
                    &:hover {
                        background-color: var(--optionHoverBG);
                    }
                }
            }
        }
    }
</style>