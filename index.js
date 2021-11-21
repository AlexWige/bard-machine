const { remote, app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let dialogOpened = false;
const dev = false;
let window;

app.on("ready", () => {
    window = new BrowserWindow({ 
        width: 1200, 
        height: 700,
        minWidth: 400,
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
    
    ipcMain.on('maximize-window', (e) => {
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

    ipcMain.on('dialog-open-collection', (event) => {
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

    ipcMain.on('dialog-import-sounds', (event) => {
        if(dialogOpened) return;
        dialogOpened = true;
        dialog.showOpenDialog(window, { 
            title: 'Open Bard Machine Sounds', 
            properties: ['multiSelections'], 
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

    ipcMain.on('dialog-create-collection', (event) => {
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
});

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