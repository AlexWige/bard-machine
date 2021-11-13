const fs = require('fs');
import { SoundData } from './soundData';
import soundStore from './soundStore';

function getFilePaths(mainPath, callback) {
    let filePaths = {};
    filePaths['ambient'] = getFilePathsFromDir(mainPath + '\\ambient');
    filePaths['sfx'] = getFilePathsFromDir(mainPath + '\\sfx');
    filePaths['music'] = getFilePathsFromDir(mainPath + '\\music');
    callback(filePaths);
}

function getFilePathsFromDir(path) {
    if(fs.existsSync(path)) {
        let dir = fs.readdirSync(path);
        let filePaths = [];
    
        dir.forEach(function (file) {
            filePaths.push(path + '\\' + file);
        });

        return filePaths;
    }
}

function createSoundDatas(pathsObject, category) {
    if(pathsObject[category]) {
        soundStore.update(store => {
            if(store && store[category]) {
                pathsObject[category].forEach(path => {
                    store[category].sounds.push(new SoundData(path, category));
                });
            }
            return store;
        });
    }
}

export default { getFilePaths, getFilePathsFromDir, createSoundDatas };