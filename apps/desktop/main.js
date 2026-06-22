const { app, BrowserWindow, ipcMain, Notification, shell } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0f1117',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ─── IPC: Notificaciones nativas ─────────────────────────────
ipcMain.on('notify', (_, { title, body }) => {
  try {
    if (Notification.isSupported()) {
      new Notification({ title, body, silent: false }).show();
    }
  } catch (_) {}
});

// ─── IPC: Abrir link externo ──────────────────────────────────
ipcMain.on('open-external', (_, url) => {
  shell.openExternal(url);
});

// ─── IPC: Versión de la app ───────────────────────────────────
ipcMain.handle('get-version', () => app.getVersion());
