const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

console.log("Preload script loaded!");

contextBridge.exposeInMainWorld('rfidAPI', {
  readTag: () => ipcRenderer.invoke('get-rfid-tag')
});
