const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop controls to React window context
contextBridge.exposeInMainWorld('electronAPI', {
  sendSystemCommand: (command) => ipcRenderer.send('system-command', command),
  onSystemResponse: (callback) => ipcRenderer.on('system-response', (event, value) => callback(value)),
  getPlatformInfo: () => process.platform
});
