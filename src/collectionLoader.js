const fs = require('fs');
import soundStore from './sound-blocks/soundStore';
import gettableStore from './utils/gettableStore';

const collectionPath = gettableStore('');

function createCollection(path) {
    if(!path.endsWith('.bmsounds')) path += '.bmsounds';
    collectionPath.set(path);
    saveCollection();
    openCollection(path);
}

function openCollection(path) {
    collectionPath.set(path);
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

export default { 
    openCollection,
    createCollection,
    addSounds,
    saveCollection,
    closeCollection
};