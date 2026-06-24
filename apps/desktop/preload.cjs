const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  notify: (title, body, action) => ipcRenderer.send('notify', { title, body, action }),
  onNotifyAction: (cb) => {
    const handler = (_, action) => cb(action);
    ipcRenderer.on('notify-action', handler);
    return () => ipcRenderer.off('notify-action', handler);
  },
  openExternal: (url) => ipcRenderer.send('open-external', url),
  getVersion: () => ipcRenderer.invoke('get-version'),
});
