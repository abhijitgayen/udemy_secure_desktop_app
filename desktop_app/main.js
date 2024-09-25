const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const { ipcMain } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('src/index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('send-data', (event, arg) => {
  console.log(arg); // Prints 'Hello from Renderer'
  // Send a reply back to the renderer process
  event.reply('get-data', 'Hello from Main');
});