const { remote, app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let dialogOpened = false;
const dev = false;
let window;

const gotTheLock = app.requestSingleInstanceLock()
    
if (!gotTheLock) {
    // Executed by second instance on start itself
    const openedFile = process.argv.find(arg => arg.endsWith('.bmsounds'));
    if(openedFile) app.quit()
    else app.on('ready', onAppReady);
} else {
    // Executed by first instance when other instance is started
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if(!commandLine) return;
        const openedFile = commandLine.find(arg => arg.endsWith('.bmsounds'));
        if(openedFile) {
            window.webContents.send('collection-open-path-selected', openedFile);
            if (window) {
                if (window.isMinimized()) window.restore()
                window.focus()
            }
        }
    });
    app.on('ready', onAppReady);
}

function onAppReady() {
    window = new BrowserWindow({ 
        width: 1200, 
        height: 700,
        minWidth: 480,
        minHeight: 200,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: __dirname + '/icon.ico'
    });

    window.loadFile(path.join(__dirname, "public/index.html"));
    if(dev) window.webContents.openDevTools();
    
    updateMaximizeButton(window);
    
    ipcMain.on('maximize-window', event => {
        if(window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
        updateMaximizeButton(window);
    });

    ipcMain.on('minimize-window', () => {
        window.isMinimized() ? window.restore() : window.minimize();
    });

    ipcMain.on('close-window', () => {
        window.close();
    });    

    app.on('browser-window-focus', () => {
        window.webContents.send("app-focused");
    });

    ipcMain.on('dialog-open-collection', event => {
        if(dialogOpened) return;
        dialogOpened = true;
        dialog.showOpenDialog(window, { 
            title: 'Open Bard Machine Collection', 
            properties: ['openFile'], 
            filters: [
                {
                    name: "Collection",
                    extensions: ['bmsounds']
                },
            ]
        })
        .then((data) => {
            dialogOpened = false;
            if(!data.canceled && data.filePaths.length > 0) {
                event.sender.send('collection-open-path-selected', data.filePaths[0]);
            }
        });
    });

    ipcMain.on('dialog-import-sounds', event => {
        if(dialogOpened) return;
        dialogOpened = true;
        dialog.showOpenDialog(window, { 
            title: 'Open Bard Machine Sounds', 
            properties: ['openFile', 'multiSelections'], 
            filters: [
                {
                    name: "sounds",
                    extensions: ['mp3', 'wav', 'ogg']
                },
            ]
        })
        .then((data) => {
            dialogOpened = false;
            if(data.canceled || data.filePaths.length <= 0) {
                event.sender.send('import-new-sounds', []);
            } else {
                let paths = data.filePaths.filter(p => isMusicFile(p));
                event.sender.send('import-new-sounds', paths);
            }
        });
    });

    ipcMain.on('dialog-create-collection', event => {
        if(dialogOpened) return;
        dialogOpened = true;
        dialog.showSaveDialog(window, { 
            title: 'Create Bard Machine Collection',
            buttonLabel : "Create Collection",
            filters :[
                {name: 'Bard Machine Collection', extensions: ['bmsounds']},
            ]
        })
        .then((data) => {
            dialogOpened = false;
            if(!data.canceled && data.filePath != '') {
                event.sender.send('collection-create-path-selected', data.filePath);
            }
        });;
    });

    

    ipcMain.on('replace-sound-file', (event, id) => {
        if(dialogOpened) return;
        dialogOpened = true;
        dialog.showOpenDialog(window, { 
            title: 'Open Bard Machine Sounds',
            properties: ['openFile'],
            filters: [
                {
                    name: "sounds",
                    extensions: ['mp3', 'wav', 'ogg']
                },
            ]
        })
        .then((data) => {
            dialogOpened = false;
            let path = '';
            if(!data.canceled && data.filePaths.length > 0) {
                path = data.filePaths.find(p => isMusicFile(p));   
            }
            event.sender.send('replaced-sound-file-path', { path: path, id: id });
        });
    });    

    ipcMain.on('app-mounted', event => onOpenFile());
}

function onOpenFile() {
    const openFilePath = process.argv.find(arg => arg.endsWith('.bmsounds'));
    if (process.platform == 'win32' && openFilePath) {
        window.webContents.send("collection-open-path-selected", openFilePath);
    }
    //window.webContents.openDevTools();
}

function updateMaximizeButton(window) {
    if(window.isMaximized()) {
        window.webContents.send('window-maximized');
    } else {
        window.webContents.send('window-unmaximized');
    }
}

function isMusicFile(filePath) {
    let ext = path.extname(filePath);
    return ext == '.mp3' || ext == '.ogg' || ext == '.wav';
}

const getWindow = () => remote.BrowserWindow.getFocusedWindow();

try {
    require('electron-reloader')(module)
} catch (_) {}