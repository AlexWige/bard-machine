const fs = require('fs');
import { SoundData } from './soundData';
import soundStore from './soundStore';
import { writable } from "svelte/store";

const collectionPath = writable('');
collectionPath.get = () => {
    let path;
    collectionPath.update(p => { path = p;  return p; });
    return path;
}

function getFilePaths(mainPath, callback) {
    let filePaths = {};
    filePaths['ambient'] = getFilePathsFromDir(mainPath + '\\ambient');
    filePaths['sfx'] = getFilePathsFromDir(mainPath + '\\effects');
    filePaths['music'] = getFilePathsFromDir(mainPath + '\\music');
    callback(filePaths);
}

function refreshFiles() {
    if(collectionPath == '') return;
    getFilePaths(collectionPath.get(), filePaths => {
        refreshCategory('ambient', filePaths['ambient']);
        refreshCategory('sfx', filePaths['sfx']);
        refreshCategory('music', filePaths['music']);
    });
}

function refreshCategory(category, categoryPaths) {
    soundStore.update(store => {
        if(store && store[category]) {
            categoryPaths.forEach(path => {
                let existing = store[category].sounds.find(d => d.path == path);
                if(!existing) {
                    store[category].sounds.push(new SoundData(path, category));
                }
            });
        }
        return store;
    });
}

function createFolders(location, collectionName, callback) {
    const mainPath = location + '\\' + collectionName;
    createFolderIfNotExist(mainPath);
    createFolderIfNotExist(mainPath + '\\ambient')
    createFolderIfNotExist(mainPath + '\\effects')
    createFolderIfNotExist(mainPath + '\\music')
    callback(mainPath);
}

function createFolderIfNotExist(folder) {
    if(!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
    }
}

function getFilePathsFromDir(path) {
    if(fs.existsSync(path)) {
        let dir = fs.readdirSync(path);
        let filePaths = [];
    
        dir.forEach(function (file) {
            if(file.endsWith('.mp3') || file.endsWith('.ogg') || file.endsWith('.wav') || file.endsWith('.flac'))
            filePaths.push(path + '\\' + file);
        });

        return filePaths;
    }
    else return [];
}

function createSoundDatas(pathsObject, category) {
    if(pathsObject[category]) {
        soundStore.update(store => {
            if(store && store[category]) {
                store[category].sounds = [];
                pathsObject[category].forEach(path => {
                    store[category].sounds.push(new SoundData(path, category));
                });
            }
            return store;
        });
    }
}

export default { collectionPath, createFolders, getFilePaths, getFilePathsFromDir, createSoundDatas, refreshFiles };