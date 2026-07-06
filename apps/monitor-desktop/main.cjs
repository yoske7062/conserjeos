const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

const MONITOR_URL = 'https://portia-monitor.vercel.app';

// Única vista permitida: el propio dominio del monitor y su auth de Supabase.
// Todo lo demás (links externos) se abre en el navegador del sistema.
const ORIGENES_PERMITIDOS = [
  MONITOR_URL,
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
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          [
            "default-src 'self' https://portia-monitor.vercel.app",
            "script-src 'self' 'unsafe-inline' https://portia-monitor.vercel.app",
            "style-src 'self' 'unsafe-inline' https://portia-monitor.vercel.app https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://*.supabase.co https://portia-monitor.vercel.app",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://portia-monitor.vercel.app",
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
    title: 'Portia Monitor',
    titleBarStyle: 'hiddenInset',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const permitido = ORIGENES_PERMITIDOS.some((o) => url.startsWith(o));
    if (!permitido) {
      event.preventDefault();
      if (esUrlExternaSegura(url)) shell.openExternal(url);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (esUrlExternaSegura(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // El contenido es remoto (Next.js en Vercel) y no marca ninguna zona como
  // arrastrable — sin esto la ventana no se puede mover con hiddenInset.
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      body::before {
        content: '';
        position: fixed;
        top: 0; left: 0; right: 0; height: 28px;
        -webkit-app-region: drag;
        z-index: 999999;
      }
    `);
  });

  mainWindow.loadURL(MONITOR_URL);

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
