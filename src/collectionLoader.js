const fs = require('fs');
import soundStore from './sound-blocks/soundStore';
import gettableStore from './utils/gettableStore';
const { ipcRenderer } = window.require('electron');
import { onHomeScreen } from "./playerStore";
import _ from 'lodash';

export const collectionPath = gettableStore('');
export const recentlyOpened = gettableStore('');

function onAppMount() {
    refreshRecentlyOpened();
    ipcRenderer.addListener('collection-open-path-selected', onOpenCollectionEvent);
    ipcRenderer.addListener('collection-create-path-selected', onCreateCollectionEvent);
    document.body.addEventListener("dragover", onDocumentDragover);
    document.body.addEventListener("drop", onDocumentDrop);    
}

function onAppDestroy() {
    ipcRenderer.removeListener('collection-open-path-selected', onOpenCollectionEvent);
    ipcRenderer.removeListener('collection-create-path-selected', onCreateCollectionEvent);
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
    addToRecentlyOpened(path);
    collectionPath.set(path);
    onHomeScreen.set(false);
    refreshCollection();
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

function refreshCollection() {
    const path = collectionPath.get();
    if(!path || path == '') return;
    if(fs.existsSync(path)) {
        fs.readFile(path, "utf8", (err, data) => {
            soundStore.fromJSON(data);
        });
    }
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
    closeCollection
};