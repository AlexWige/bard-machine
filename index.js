const { remote, app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

let dialogOpened = false;

app.on("ready", () => {
    const window = new BrowserWindow({ 
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
    // window.webContents.openDevTools();
    
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

    ipcMain.on('open-file-dialog', (event) => {
        if(dialogOpened) return;
        dialogOpened = true;
        dialog.showOpenDialog({ title: 'Bard Machine Directory', properties: ['openDirectory']})
        .then((data) => {
            dialogOpened = false;
            if(data.canceled || data.filePaths.length <= 0) {
                app.quit();
            } else {
                event.sender.send('selected-directory', data.filePaths[0]);
            }
        });        
        // dialogOpened = false;
        // event.sender.send('selected-directory', 'D:/RPG/Bard Machine/BardMachineSounds/_Export');
    })
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