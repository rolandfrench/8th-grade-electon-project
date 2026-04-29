const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
})

contextBridge.exposeInMainWorld('rfidAPI', {
  readTag: () => {
    ipcRenderer.send('get-rfid-tag');
    return new Promise((resolve) => {
      ipcRenderer.once('rfid-tag-result', (event, arg) => resolve(arg));
    });
  }
});