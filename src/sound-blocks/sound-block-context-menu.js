import { modal } from "../modal/modal-manager";
import collectionLoader from "../collection-loader";
import soundStore from './sound-store';
const { ipcRenderer } = window.require('electron');
import { groupIntoPlaylist, ungroupPlaylist } from "../playlists/playlists";
import * as playlistManager from "../playlists/playlists";
import * as roomManager from "../rooms/rooms-manager";

export function getContextMenuOptions(nodes, soundAPI) {
    let options = [];
    const soundID = soundAPI.getID();

    // Get selected music sound items
    const selectedMusics = nodes.map(node => soundStore.getItemFromNode(node))
        .filter(item => item && item.data.category == 'music');
    const selectedSoloMusics = selectedMusics.filter(item => item.data.sources.length == 1);
    const selectedPlaylists = selectedMusics.filter(item => item.data.sources.length > 1);

    if(selectedSoloMusics.length == nodes.length) {
        options.push({
            id: 'group-into-playlist',
            multiple: 'Group into playlist...',
            onClickAll: () => {
                modal.show(
                    "New Playlist Name",
                    [
                        { name: "Cancel", hotkey: 'Escape', onClick: () => modal.hide() },
                        { name: "OK", hotkey: 'Enter', onClick: () => {
                            let newName = modal.getInputValue();
                            selectedSoloMusics.forEach(music => {
                                music.api.stop();
                            });
                            const newSoundItem = groupIntoPlaylist(selectedSoloMusics);
                            newSoundItem.data.title = newName;
                            collectionLoader.saveCollection();
                            modal.hide();
                        }}
                    ],
                    { value: "New Playlist", placeHolder: 'Enter playlist name...' }
                );
            },
            saveAfter: true
        });
    }

    if(selectedPlaylists.length == nodes.length) {
        options.push({
            id: 'manage-playlist',
            solo: 'Manage playlist...',
            onClickEach: () => {
                playlistManager.editorWindowAPI.show(soundID);
            }
        });

        options.push({
            id: 'ungroup-playlists',
            solo: 'Ungroup playlist',
            multiple: 'Ungroup playlists',
            onClickAll: () => {
                selectedPlaylists.forEach(playlist => { 
                    ungroupPlaylist(playlist);
                });
            },
            saveAfter: true
        });
    }

    if(!soundAPI.getData().missingFile) { 
        options.push({ 
            id: 'stop-sound-block',
            multiple: 'Stop sounds',
            onClickEach: () => soundAPI.stop()
        });
        options.push({ 
            id: 'rename-sound-block',
            solo: 'Rename...',
            onClickEach: () => {
                const currentTitle = soundStore.getItemByID(soundID).data.title;
                modal.show(
                    "Rename Sound",
                    [
                        { name: "Cancel", hotkey: 'Escape', onClick: () => modal.hide() },
                        { name: "OK", hotkey: 'Enter', onClick: () => {
                            let newName = modal.getInputValue();
                            soundStore.renameSound(soundID, newName);
                            modal.hide();
                            collectionLoader.saveCollection();
                        }}
                    ],
                    { value: currentTitle, placeHolder: 'Enter sound name...' }
                );
            }
        });
    } else {
        options.push({ 
            id: 'replace-sound-block',
            solo: 'Replace file...',
            onClickEach: () => ipcRenderer.send('replace-sound-file', soundID)
        });
    }

    options.push({ 
        id: 'remove-sound-block',
        solo: 'Remove',
        multiple: 'Remove sounds',
        onClickEach: () => {
            soundStore.removeSound(soundID);
            roomManager.refreshPlayingCounts();
        },
        saveAfter: true
    });

    return options;
}