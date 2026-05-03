const { contextBridge, ipcRenderer } = require('electron/renderer');

contextBridge.exposeInMainWorld('rfidAPI', {
  onTagScanned: (callback) => ipcRenderer.on('from-python', (_event, value) => callback(value))
});

contextBridge.exposeInMainWorld('electronAPI', {
  launchGame: (data) => ipcRenderer.send('launch-game', data),
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
});

console.log("Preload script loaded!");
