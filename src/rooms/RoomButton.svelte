<script>
    import globalStyles from "../style/global-styles";
    import AssignKeyButton from "../hotkeys/AssignKeyButton.svelte";
    import ActiveSoundCount from "./ActiveSoundCount.svelte";
    import { onMount, onDestroy, afterUpdate, tick } from "svelte";
    import * as reorderables from "../pointer/reorderables";
    import * as selectionManager from "../pointer/selection";
    import * as contextMenuManager from "../context-menu/context-menu";
    import * as rooms from "./rooms-manager";
    import roomsStore from "./rooms-store";
    import { modal } from "../modal/modal-manager";
    import tippy from "tippy.js"
    import collectionLoader from "../collection-loader";
    import { deleteAllWithHotkey } from "../hotkeys/hotkey-manager";

    export let id = 0;
    export let name = '';
    export let playingAmbient = 0;
    export let playingMusic = 0;
    export let isActive = false;
    export let isMain = false;
    export let hotkeyName = '';
    export let hotkeyCode = -1;

    let mainNode;
    let tippyBox;
    let tippyBoxTemplate;
    let isSelected = false;

    const api = {
        getNode: () => mainNode,
        getID: () => id
    }

    const selectableAPI = {
        getNode: () => mainNode,
        getSelectionGroup: () => 'room-buttons',
        onSelect: () => isSelected = true,
        onDeselect: () => isSelected = false
    }

    const reorderableAPI = {
        getNode: () => mainNode,
        putBefore: node => {
            roomsStore.update(store => {
                const target = rooms.getRoomByID(rooms.getRoomIDFromNode(node));
                return reorderables.moveArrayItemBefore(store, rooms.getRoomByID(id), target);
            });
            const event = new Event('room-reordered');
            window.dispatchEvent(event);
        },
        putAfter: node => {
            roomsStore.update(store => {
                const target = rooms.getRoomByID(rooms.getRoomIDFromNode(node));
                return reorderables.moveArrayItemAfter(store, rooms.getRoomByID(id), target);
            });
            const event = new Event('room-reordered');
            window.dispatchEvent(event);
        }
    }

    const contextMenuAPI = {
        getNode: () => mainNode,
        getOptions: (nodes) => getContextMenuOptions(nodes)
    }

    $: style = `--bg: ${globalStyles.bg.lighten(0.15)};`
        + `--bgHover: ${globalStyles.bg.lighten(0.3)};`
        + `--musicColor: ${globalStyles.music};`
        + `--ambientColor: ${globalStyles.ambient};`;
    
    let activeSoundTitleList = {
        music: [],
        ambient: []
    };
    
    onMount(async() => {
        reorderables.register(reorderableAPI);
        selectionManager.register(selectableAPI);
        contextMenuManager.register(contextMenuAPI);
        rooms.registerRoomAPI(api);
        setupTippy();
        window.addEventListener('room-reordered', onRoomReordered);
    });
    
    onDestroy(async() => {
        reorderables.unregister(reorderableAPI);
        selectionManager.unregister(selectableAPI);
        contextMenuManager.unregister(contextMenuAPI);
        rooms.unregisterRoomAPI(api);
        mainNode.removeEventListener('context-menu-opened', onContextMenuOpened, true);
        window.removeEventListener('room-reordered', onRoomReordered);
    });

    // Ugly fix for tippy bug
    function onRoomReordered(e) {
        setupTippy();
    }

    export function getHotkeyCode() {
        return hotkeyCode;
    }

    async function setupTippy() {
        if(tippyBox) tippyBox.destroy();
        await tick();
        activeSoundTitleList = rooms.getRoomActiveSoundTitleList(id);
        if(!isMain) tippyBox = tippy(mainNode, { 
            content: tippyBoxTemplate, 
            theme: 'sidebar'
        });
        else tippyBox = tippy(mainNode, { content: 'Go back to main state', theme: 'sidebar' });
    }

    function onButtonClick(e) {
        rooms.setRoomActive(id);
    }

    function onContextMenuOpened(e) {
        selectionManager.selectNodes([mainNode]);
    }

    function onKeyAssign(keyCode, keyName) {
        deleteAllWithHotkey(keyCode);
        if(isMain) {
            rooms.mainRoom.update(r => {
                r.hotkeyCode = keyCode;
                r.hotkeyName = keyName;
                return r;
            });
        } else {
            roomsStore.update(store => {
                const room = store.find(r => r.id == id);
                room.hotkeyCode = keyCode;
                room.hotkeyName = keyName;
                return store;
            });
        }
        
        collectionLoader.saveCollection();
    }

    function getContextMenuOptions(nodes) {
        const options = [];
        if(isMain) return options;
        options.push({
            id: 'remove-room',
            solo: 'Remove',
            multiple: 'Remove',
            onClickEach: () => {
                rooms.removeRoom(id);
            },
            saveAfter: true
        });

        options.push({
            id: 'rename-playlist-item',
            solo: 'Rename...',
            onClickEach: () => {
                modal.show(
                    "Rename Room",
                    [
                        { name: "Cancel", hotkey: 'Escape', onClick: () => modal.hide() },
                        { name: "OK", hotkey: 'Enter', onClick: () => {
                            let name = modal.getInputValue();
                            roomsStore.update(store => {
                                const room = store.find(room => room.id == id);
                                room.name = name;
                                return store;
                            });
                            modal.hide();
                        }}
                    ],
                    { value: name, placeHolder: 'Enter name...' }
                );
            },
            saveAfter: true
        });

        return options;
    }
</script>

<div bind:this={mainNode} class="room-button" style={style} class:selected={isSelected} class:active={isActive} data-blockselection={true}>
    <div class="button-bg" on:click={onButtonClick}>
        <div class="name">{name}</div>
        {#if !isMain}
        <ActiveSoundCount category="music" count={playingMusic}/>
        <ActiveSoundCount category="ambient" count={playingAmbient}/>
        {/if}
        <div class="assign-btn-container">
            <AssignKeyButton small={true} bind:hotkeyName={hotkeyName} onKeyAssign={onKeyAssign}/>
        </div>
    </div>

    <div class="room-tippy-template" bind:this={tippyBoxTemplate}>
        {#if activeSoundTitleList.music.length > 0}
            <div class="playing-category music">
                <h4>Music</h4>
                {#each activeSoundTitleList.music as title}
                    <div>{title}</div>
                {/each}
            </div>
        {/if}
        {#if activeSoundTitleList.ambient.length > 0}
            <div class="playing-category ambient">
                <h4>Ambient</h4>
                {#each activeSoundTitleList.ambient.slice(0, 4) as title}
                    <div>{title}</div>
                {/each}
                {#if activeSoundTitleList.ambient.length > 4}
                    <div class="and-more">+{activeSoundTitleList.ambient.length - 4} more...</div>
                {/if}
            </div>
        {/if}
        {#if activeSoundTitleList.ambient.length == 0 && activeSoundTitleList.music.length == 0}
            No sounds playing in this room
        {/if}
    </div>
</div>

<style lang="scss">
    :global(.tippy-box .room-tippy-template) {
        font-size: 13px;

        .playing-category {
            margin-top: 0;
            margin-bottom: 8px;
            min-width: 100px;

            &:last-of-type {
                margin-bottom: 3px;
            }

            h4 {
                margin: 0;
            }

            h4::before {
                display: inline-block;
                font-family: 'icomoon';
                font-weight: 400;
                font-size: 1.2em;
                margin-right: 5px;
                transform: translateY(3px);
            }

            .and-more {
                font-size: 12px;
                font-weight: 600;
                margin-top: 3px;
            }

            &.music h4::before {
                content: '\e901';
                color: #f45353;
            }

            &.ambient h4::before  {
                content: '\e900';
                color: #66c754;
            }
        }
    }

    .room-button {
        position: relative;
        width: 100%;
        height: 46px;
        margin: 0;
        overflow: hidden;
        box-sizing: border-box;

        .room-tippy-template {
            display: none;
        }

        :global(.drop-preview-bar) {
            border-color: rgb(127, 182, 255) !important;
        }

        .button-bg {
            display: flex;
            box-sizing: border-box;
            position: relative;
            width: 100%;
            height: 38px;
            margin: 4px 0;
            padding: 9px;
            border-radius: 19px;
            font-size: 14.5px;
            background-color: var(--bg);
            cursor: pointer;
        }

        .name {
            flex: 1;
            text-align: left;
            margin: 0 5px;
            font-size: 13.5px;
            height: 25px;
            text-overflow: ellipsis;
            overflow: hidden;
            overflow-wrap: break-word;
            white-space: nowrap;
        }

        .assign-btn-container {
            position: relative;
            width: 35px;
            height: 35px;
            box-sizing: border-box;
            margin-top: -5px;
            margin-right: -2px;
        }

        &:hover {
            .button-bg {
                background-color: var(--bgHover);
            }
        }
        
        &.selected {
            .button-bg {
                border: 1px #ffffff60 solid;
                background-color: var(--bgHover);
            }
        }

        &.active {
            .button-bg {
                background-color: #495889;
                border: 1px #7f8fff solid;
            }

            .name {
                font-weight: 500;
            }
        }
    }
</style>