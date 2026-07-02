const { app, BrowserWindow, ipcMain, Notification, shell, session } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Solo se permite navegar dentro de estos orígenes. Todo lo demás se bloquea
// o se abre en el navegador del sistema.
const ORIGENES_PERMITIDOS = [
  'http://localhost:5173',
  'https://cpxywvxwdnpsrxqjoqjl.supabase.co',
];

let mainWindow;

function esUrlExternaSegura(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function aplicarCSP() {
  // CSP solo en producción: en dev, Vite (HMR + React refresh) requiere inline/eval.
  if (isDev) return;
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://*.supabase.co",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
          ].join('; '),
        ],
      },
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0B0B0B',
    title: 'Portia',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  // Bloquear navegación a orígenes no permitidos (ej. un link inyectado).
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const permitido = ORIGENES_PERMITIDOS.some(o => url.startsWith(o));
    if (!permitido) {
      event.preventDefault();
      if (esUrlExternaSegura(url)) shell.openExternal(url);
    }
  });

  // Ninguna ventana nueva se abre dentro de la app; los links externos van al navegador.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (esUrlExternaSegura(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools(); // descomentar para debug
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

app.whenReady().then(() => {
  aplicarCSP();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on('notify', (_, payload) => {
  // Validación de entrada IPC: solo strings, longitud acotada.
  if (!payload || typeof payload !== 'object') return;
  const title = typeof payload.title === 'string' ? payload.title.slice(0, 120) : '';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 300) : '';
  const action = typeof payload.action === 'string' ? payload.action.slice(0, 60) : '';
  if (!title) return;
  try {
    if (!Notification.isSupported()) return;
    const n = new Notification({ title, body });
    if (action) {
      n.on('click', () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
          mainWindow.webContents.send('notify-action', action);
        }
      });
    }
    n.show();
  } catch (_) {}
});

ipcMain.on('open-external', (_, url) => {
  if (typeof url === 'string' && esUrlExternaSegura(url)) shell.openExternal(url);
});

ipcMain.handle('get-version', () => app.getVersion());
