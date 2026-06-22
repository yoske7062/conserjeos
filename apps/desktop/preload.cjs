const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  notify: (title, body) => ipcRenderer.send('notify', { title, body }),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  getVersion: () => ipcRenderer.invoke('get-version'),
});
