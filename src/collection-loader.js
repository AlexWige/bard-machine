import soundStore from './sound-blocks/sound-store';
const { ipcRenderer } = window.require('electron');
import { onHomeScreen } from "./player-store";
import roomsStore from './rooms/rooms-store';
import { collectionPath, recentlyOpened } from './collection-paths';
import { SoundStoreItem } from "./sound-blocks/sound-store-item";
import { version } from './player-store';
import _ from 'lodash';
import { mainRoom } from './rooms/rooms-manager';
const fs = require('fs');
const path = require('path');

let isSaving = false;
let onFinishSaving = [];

function onAppMount() {
    refreshRecentlyOpened();
    ipcRenderer.addListener('app-focused', onAppFocus);
    ipcRenderer.addListener('collection-open-path-selected', onOpenCollectionEvent);
    ipcRenderer.addListener('collection-create-path-selected', onCreateCollectionEvent);
    ipcRenderer.addListener('replaced-sound-file-path', onReplacedSoundFilePath);
    document.body.addEventListener("dragover", onDocumentDragover);
    document.body.addEventListener("drop", onDocumentDrop);    
}

function onAppDestroy() {
    ipcRenderer.removeListener('app-focused', onAppFocus);
    ipcRenderer.removeListener('collection-open-path-selected', onOpenCollectionEvent);
    ipcRenderer.removeListener('collection-create-path-selected', onCreateCollectionEvent);
    ipcRenderer.removeListener('replaced-sound-file-path', onReplacedSoundFilePath);
    document.body.removeEventListener("dragover", onDocumentDragover);
    document.body.removeEventListener("drop", onDocumentDrop);
}

/************* MAIN METHODS  ****************/

function createCollection(path) {
    if(!path.endsWith('.bmsounds')) path += '.bmsounds';
    roomsStore.set([]);
    collectionPath.set(path);
    openCollection(path);
}

function openCollection(path) {
    closeCollection();
    if(!path || path == '') return;
    addToRecentlyOpened(path);
    collectionPath.set(path);
    if(fs.existsSync(path)) {
        fs.readFile(path, "utf8", (err, fileData) => {
            let data = {};
            try {
                data = JSON.parse(fileData);
            } catch(error) {
                console.log(error);
                data = {};
            };

            if(data.sounds) {
                soundStore.update(store => {
                    store = [];
                    for (let i = 0; i < data.sounds.length; i++) {
                        store.push(new SoundStoreItem(i, data.sounds[i]))
                    }
                    return store; 
                })
            }
            
            if(data.mainRoom) {
                mainRoom.update(r => {
                    return data.mainRoom;
                });
            }

            if(data.rooms) {
                roomsStore.update(store => {
                    return data.rooms; 
                });
            }

            refreshSoundPaths();
            onHomeScreen.set(false);
            window.dispatchEvent(new Event('collection-opened'))
        });
    }
}

function closeCollection() {
    soundStore.closeCollection();
    collectionPath.set('');
}

function saveCollection(onSaved) {
    console.log("save");
    if(isSaving) {
        if(onSaved) onFinishSaving.push(onSaved);
        return;
    }
    isSaving = true;
    const jsonData = JSON.stringify({
        version: version,
        sounds: soundStore.getAllData(),
        mainRoom: mainRoom.get(),
        rooms: roomsStore.get() ?? []
    });
    const path = collectionPath.get();
    if(!path || path == '') return;
    fs.writeFile(path, jsonData, "utf8", () => {
        if(onSaved) onSaved();
        window.dispatchEvent(new Event('collection-saved'))
        isSaving = false;
        if(onFinishSaving.length > 0) {
            onFinishSaving.forEach(callback => {
                if(callback) callback();
            });
            onFinishSaving = [];
        }
    });
}

function executeOnFinishSaving(callback) {
    if(isSaving) {
        onFinishSaving.push(callback);
    } else {
        callback();
    }
}

function refreshSoundPaths() {
    soundStore.update(store => {
        store.forEach(sound => {
            sound.data.sources.forEach(source => {
                source.isMissing = false;
                const collectionDirname = path.dirname(collectionPath.get());
                const reconstructedPath = path.join(collectionDirname, source.relativePath);
                const absoluteExists = fs.existsSync(source.absolutePath);
                const relativeExists = fs.existsSync(reconstructedPath);

                if(!absoluteExists && relativeExists) {
                    source.absolutePath = reconstructedPath;
                } else if(absoluteExists && !relativeExists) {
                    source.relativePath = path.relative(collectionDirname, source.absolutePath);
                } else if(!absoluteExists && !relativeExists)  {
                    source.isMissing = true;
                }
            });
        });
        return store;
    });
    saveCollection();
}

function addSounds(paths, category) {
    soundStore.addSounds(paths, category);
}

/************* RECENTLY OPENED  ****************/

function refreshRecentlyOpened() {
    let storedPaths = getRecentlyOpenedFromLocalStorage();
    if(!storedPaths) storedPaths = [];

    for (let i = storedPaths.length - 1; i >= 0; i--) {
        if(!fs.existsSync(storedPaths[i])) {
            storedPaths.splice(i, 1);
        }
    }

    localStorage.setItem('recently-opened-collections', JSON.stringify(storedPaths));
    recentlyOpened.set(storedPaths);
}

function getRecentlyOpenedFromLocalStorage() {
    let storedPaths = [];
    try {
        storedPaths = JSON.parse(localStorage.getItem('recently-opened-collections'));
    } catch {
        storedPaths = []
    }
    return storedPaths;
}

function addToRecentlyOpened(path) {
    let storedPaths = getRecentlyOpenedFromLocalStorage();
    if(!storedPaths) storedPaths = [];

    if(storedPaths.includes(path)) {
        storedPaths = storedPaths.filter(p => p != path);
    }
    storedPaths = storedPaths.reverse();
    storedPaths.push(path);

    if(storedPaths.length > 5) {
        storedPaths = storedPaths.slice(-5);
    }
    storedPaths = storedPaths.reverse();
    localStorage.setItem('recently-opened-collections', JSON.stringify(storedPaths));
    recentlyOpened.set(storedPaths);
}

/************* EVENT LISTENERS  ****************/

function onAppFocus() {
    refreshSoundPaths();
}

function onReplacedSoundFilePath(e, data) {
    let soundAPI;
    soundStore.update(store => {
        const sound = store.find(s => s.id == data.id);
        if(sound) {
            soundAPI = sound.api;
            sound.data.sources[0].absolutePath = data.path;
        }
        return store;
    });
    refreshSoundPaths();
    if(soundAPI) soundAPI.refreshAudioPath();
}

function onCreateCollectionEvent(e, path) {
    createCollection(path);
    onHomeScreen.set(false);
}

function onOpenCollectionEvent(e, path) {
    openCollection(path);
}

function onDocumentDragover(event) {
    event.preventDefault()
}

function onDocumentDrop(event) {
    event.preventDefault();
    const collectionFile = Array.from(event.dataTransfer.files).find(file => file.path.endsWith('.bmsounds'));
    if(collectionFile) openCollection(collectionFile.path);
}

/************* EXPORT  ****************/

export default {
    isSaving,
    executeOnFinishSaving,
    onAppMount,
    onAppDestroy,
    openCollection,
    createCollection,
    addSounds,
    saveCollection,
    refreshRecentlyOpened,
    closeCollection
};