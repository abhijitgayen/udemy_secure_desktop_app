const { contextBridge, ipcRenderer } = require('electron/renderer')

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

contextBridge.exposeInMainWorld('electronAPI', {
  getMessageFromMain: (callback) => ipcRenderer.on('get-data', callback),
  sendMessageFromMain: (data) => {
    ipcRenderer.send('send-data', data)
  }
})