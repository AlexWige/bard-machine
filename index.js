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

    ipcMain.on('dialog-open-folder', (event) => {
        if(dialogOpened) return;
        dialogOpened = true;
        dialog.showOpenDialog({ title: 'Open Bard Machine Collection', properties: ['openDirectory']})
        .then((data) => {
            dialogOpened = false;
            if(data.canceled || data.filePaths.length <= 0) {
                return;
            } else {
                event.sender.send('open-collection-directory', data.filePaths[0]);
            }
        });
    });

    ipcMain.on('dialog-create-folder', (event) => {
        if(dialogOpened) return;
        dialogOpened = true;
        dialog.showOpenDialog({ title: 'Create Bard Machine Collection', properties: ['openDirectory']})
        .then((data) => {
            dialogOpened = false;
            if(data.canceled || data.filePaths.length <= 0) {
                return;
            } else {
                event.sender.send('selected-tocreate-directory', data.filePaths[0]);
            }
        });
    });
});

function updateMaximizeButton(window) {
    if(window.isMaximized()) {
        window.webContents.send('window-maximized');
    } else {
        window.webContents.send('window-unmaximized');
    }
}

const getWindow = () => remote.BrowserWindow.getFocusedWindow();

try {
    require('electron-reloader')(module)
} catch (_) {}