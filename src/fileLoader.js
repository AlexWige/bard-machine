const fs = require('fs');
import { SoundData } from './soundData';
import soundStore from './soundStore';
import gettableStore from './gettableStore';

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

function saveCollection() {
    const jsonData = soundStore.toJSON();
    const path = collectionPath.get();
    if(!path || path == '') return;
    fs.writeFile(path, jsonData, "utf8", () => console.log("Collection saved!"));
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
    soundStore.update(store => {
        paths.forEach(path => {
            const id = getNewID(store.sounds);
            console.log(id);
            store.sounds.push(new SoundData(id, path, category));
        });
        return store;
    });
}

function getNewID(sounds) {
    const ids = sounds.map(s => s.id);
    for(let i = 0; i < ids.length + 1; i++) {
        if(ids.indexOf(i) == -1) return i;
    }
}

export default { 
    openCollection,
    createCollection,
    addSounds,
    saveCollection
};