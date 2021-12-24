import { apis } from '../player-store';
import collectionLoader from "../collection-loader";
import soundStore from './sound-store';
const { ipcRenderer } = window.require('electron');
import { groupIntoPlaylist, ungroupPlaylist } from "../playlists/playlists";
import * as selectionManager from "../pointer/selection";

export function getContextMenuOptions(nodes, soundAPI) {
    let options = [];
    const soundID = soundAPI.getID();

    // Get selected music sound items
    const selectedMusics = nodes.map(node => soundStore.getItemFromNode(node))
        .filter(item => item && item.data.category == 'music');
    const selectedSoloMusic = selectedMusics.filter(item => item.data.sources.length == 1);
    const selectedPlaylists = selectedMusics.filter(item => item.data.sources.length > 1);

    if(selectedSoloMusic.length == nodes.length) {
        options.push({
            id: 'group-into-playlist',
            multiple: 'Group into playlist',
            onClickAll: () => {
                const newSoundItem = groupIntoPlaylist(selectedSoloMusic);
                openRenameModal(newSoundItem.id, "Playlist Name");
            },
            saveAfter: true
        });
    }

    if(selectedPlaylists.length == nodes.length) {
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
            onClickEach: () => openRenameModal(soundID)
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
        onClickEach: () => soundStore.removeSound(soundID),
        saveAfter: true
    });

    return options;
}

function openRenameModal(soundID, modalTitle = "Rename Sound") {
    const currentTitle = soundStore.getItemByID(soundID).data.title;
    apis.modal.show(
        modalTitle, 
        [
            { name: "Cancel", hotkey: 'Escape', onClick: () => apis.modal.hide() },
            { name: "OK", hotkey: 'Enter', onClick: () => {
                let newName = apis.modal.getInputValue();
                soundStore.renameSound(soundID, newName);
                apis.modal.hide();
                collectionLoader.saveCollection();
            }}
        ],
        { value: currentTitle, placeHolder: 'Enter sound name...' }
    );
}