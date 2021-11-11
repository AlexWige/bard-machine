const { remote, app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

app.on("ready", () => {
    const window = new BrowserWindow({ 
        width: 800, 
        height: 600, 
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });
    window.loadFile(path.join(__dirname, "public/index.html"));
    
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