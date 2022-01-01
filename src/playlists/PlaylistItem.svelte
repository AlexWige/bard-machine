<script>
    import globalStyles from "../style/global-styles";
    import { onMount, onDestroy } from "svelte";
    import * as reorderables from "../pointer/reorderables";
    import * as selectionManager from "../pointer/selection";
    import * as contextMenuManager from "../context-menu/context-menu";
    import { modal } from "../modal/modal-manager";
    import soundStore from "../sound-blocks/sound-store";

    $: style = `--background: ${globalStyles.bg.lighten(0.5)};`
        +  `--backgroundHover: ${globalStyles.bg.lighten(0.55)};`
        +  `--mainColor: ${globalStyles.music};`
        + `--mainBoxBGSelected: ${globalStyles.bg.lighten(1.2).hex()};`
        + `--mainBoxBGSelectedHover: ${globalStyles.bg.lighten(1.4).hex()};`;

    export let source;
    export let sourceID;
    export let playlistID;
    let mainNode;
    let isSelected = false;

    const reorderableAPI = {
        getNode: () => mainNode,
        putBefore: node => {
            reorderables.moveArrayItemBefore(getPlaylist().data.sources, source, getSourceFromNode(node));
        },
        putAfter: node => {
            reorderables.moveArrayItemAfter(getPlaylist().data.sources, source, getSourceFromNode(node));
        }
    }

    const selectableAPI = {
        getNode: () => mainNode,
        getSelectionGroup: () => 'playlist-items',
        onSelect: () => isSelected = true,
        onDeselect: () => isSelected = false
    }

    const contextMenuAPI = {
        getNode: () => mainNode,
        getOptions: (nodes) => getContextMenuOptions(nodes)
    }

    function getContextMenuOptions(nodes) {
        const options = [];
        options.push({
            id: 'remove-playlist-item',
            solo: 'Remove',
            multiple: 'Remove',
            onClickEach: () => {
                soundStore.update(store => {
                    const playlist = store.find(s => s.id == playlistID);
                    playlist.data.sources = playlist.data.sources.filter(s => s.id != sourceID);
                    if(playlist.api.getCurrentSourceID() == sourceID) {
                        playlist.api.stop();
                        playlist.api.setSourceIndex(0);
                    }
                    return store;
                });
            },
            saveAfter: true
        });

        options.push({
            id: 'rename-playlist-item',
            solo: 'Rename...',
            onClickEach: () => {
                modal.show(
                    "Rename Playlist Item",
                    [
                        { name: "Cancel", hotkey: 'Escape', onClick: () => modal.hide() },
                        { name: "OK", hotkey: 'Enter', onClick: () => {
                            let newName = modal.getInputValue();
                            soundStore.update(store => {
                                const playlist = store.find(s => s.id == playlistID);
                                playlist.data.sources.find(s => s.id == sourceID).title = newName;
                                return store;
                            });
                            modal.hide();
                        }}
                    ],
                    { value: source.title, placeHolder: 'Enter name...' }
                );
            },
            saveAfter: true
        });

        return options;
    }

    function getSourceFromNode(node) {
        return getPlaylist().data.sources.find(s => s.id == parseInt(node.dataset.id))
    }

    function getPlaylist() {
        return soundStore.getItemByID(playlistID);
    }

    onMount(async() => {
        reorderables.register(reorderableAPI);
        selectionManager.register(selectableAPI);
        contextMenuManager.register(contextMenuAPI);
    });
    
    onDestroy(async() => {
        reorderables.unregister(reorderableAPI);
        selectionManager.unregister(selectableAPI);
        contextMenuManager.unregister(contextMenuAPI);
    });
</script>

<div bind:this={mainNode} class="playlist-item" style="{style}" data-draggable="true" data-id={sourceID}>
    <div class="node-bg" class:selected={isSelected}>
        <span class="title">{source.title}</span>
    </div>
</div>

<style lang="scss">
    .playlist-item {
        position: relative;
        margin: 0;
        padding: 4px 6px;

        &:first-of-type {
            padding-top: 6px;
        }

        .node-bg {
            background-color: var(--background);
            border-radius: 2px;
            padding: 5px 10px;
            overflow: hidden;
            text-overflow: ellipsis;

            &:hover {
                background-color: var(--backgroundHover);
            }

            &.selected {
                outline: 1px rgba(white, 0.75) solid;
                background-color: var(--mainBoxBGSelected, #333);
                

                &:hover {
                    background-color: var(--mainBoxBGSelectedHover, #333);
                }
            }
        }

        :global(.drop-preview-bar) {
            border-color: var(--mainColor) !important;
        }

        .title {
            font-size: 14px;
            font-weight: 400;
            text-overflow: hidden;
            overflow: hidden;
            white-space: nowrap;

            &:before {
                display: inline;
                content: '♫';
                color: var(--mainColor);
                font-size: 17px;
                margin-left: 2px;
                margin-right: 7px;
            }
        }
    }
</style>