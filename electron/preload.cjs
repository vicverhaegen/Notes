const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadData: () => ipcRenderer.invoke('storage:load'),
  saveData: (data) => ipcRenderer.invoke('storage:save', data),
  exportDataToFile: (data) => ipcRenderer.invoke('dialog:export', data),
  importDataFromFile: () => ipcRenderer.invoke('dialog:import'),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  pickImage: () => ipcRenderer.invoke('dialog:pickImage'),
  sendNotification: (title, body) => ipcRenderer.send('notify:show', { title, body }),
});
