import soundStore from './sound-blocks/soundStore';
const { ipcRenderer } = window.require('electron');
import { onHomeScreen } from "./playerStore";
import { collectionPath, recentlyOpened } from './collectionPaths';
import _ from 'lodash';
const fs = require('fs');
const path = require('path');

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
    collectionPath.set(path);
    saveCollection();
    openCollection(path);
}

function openCollection(path) {
    closeCollection();
    if(!path || path == '') return;
    addToRecentlyOpened(path);
    collectionPath.set(path);
    if(fs.existsSync(path)) {
        fs.readFile(path, "utf8", (err, data) => {
            soundStore.fromJSON(data);
            refreshSoundPaths();
            onHomeScreen.set(false);
        });
    }
}

function closeCollection() {
    soundStore.closeCollection();
    collectionPath.set('');
}

function saveCollection() {
    const jsonData = soundStore.toJSON();
    const path = collectionPath.get();
    if(!path || path == '') return;
    fs.writeFile(path, jsonData, "utf8", () => {});
}

function refreshSoundPaths() {
    soundStore.update(store => {
        store.forEach(sound => {
            sound.data.missingFile = false;
            const collectionDirname = path.dirname(collectionPath.get());
            const reconstructedPath = path.join(collectionDirname, sound.data.path.relative);
            const absoluteExists = fs.existsSync(sound.data.path.absolute);
            const relativeExists = fs.existsSync(reconstructedPath);

            if(!absoluteExists && relativeExists) {
                sound.data.path.absolute = reconstructedPath;
            } else if(absoluteExists && !relativeExists) {
                sound.data.path.relative = path.relative(collectionDirname, sound.data.path.absolute);
            } else if(!absoluteExists && !relativeExists)  {
                sound.data.missingFile = true;
            }
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
            sound.data.path.absolute = data.path;
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
    onAppMount,
    onAppDestroy,
    openCollection,
    createCollection,
    addSounds,
    saveCollection,
    refreshRecentlyOpened,
    closeCollection
};