const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
// Module to control application life.

const path = require('path')
const url = require('url')
const isDev = require('electron-is-dev')
const {autoUpdater} = require('electron-updater')
const log = require('electron-log')

// configure logging
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')

// stop auto update
let updater
autoUpdater.autoDownload = false

const SCREEN_WIDTH = 1280
const SCREEN_HEIGHT = 768
const SCREEN_HEIGHT_WIN = 820
const SCREEN_WIDTH_WIN = 1304

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
//   // Someone tried to run a second instance, we should focus our window.
//   if (mainWindow) {
//     if (mainWindow.isMinimized()) mainWindow.restore()
//     mainWindow.focus()
//   }
// })
app.requestSingleInstanceLock()
app.on('second-instance', (event, commandLine, workingDirectory) => {
  /* ... */
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
})

app.releaseSingleInstanceLock()

let dev = false
if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
  dev = true
}

const template = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('http://bacoor-vietnam.co/hb-desktop/') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: 'HB WALLET DESKTOP',
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  })

  // Edit menu
  template[1].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [
        { role: 'startspeaking' },
        { role: 'stopspeaking' }
      ]
    }
  )

  // Window menu
  template[3].submenu = [
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' }
  ]
}

function createWindow () {
  // Create the browser window.
  if (process.platform === 'darwin') {
    mainWindow = new BrowserWindow({
      width: SCREEN_WIDTH,
      minWidth: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      minHeight: SCREEN_HEIGHT,
      show: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        webviewTag: true
      },
      title: 'HB WALLET DESKTOP',
      useContentSize: true
    })
  } else {
    mainWindow = new BrowserWindow({
      width: SCREEN_WIDTH_WIN,
      minWidth: SCREEN_WIDTH_WIN,
      height: SCREEN_HEIGHT_WIN,
      minHeight: SCREEN_HEIGHT_WIN,
      show: false,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        webviewTag: true
      },
      icon: path.join(__dirname, '../src/Assets/Image/iconApp/icApp_256.png'),
      title: 'HB WALLET DESKTOP',
      useContentSize: true
    })
  }

  // and load the index.html of the app.
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`)
  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    log.info('ready-to-show')
    mainWindow.show()
    setTimeout(() => {
      setAutoUpdater(mainWindow)
    }, 6000)
    // Open the DevTools automatically if developing
    if (isDev) {
      mainWindow.webContents.openDevTools()
      console.log('sendStatusToWindow-This is dev')
      // mainWindow.webContents.on('did-finish-load', () => {
      //   mainWindow.webContents.send('ping', 'whoooooooh!')
      //   console.log('sendStatusToWindow-This is did-finish-load')
      // })
    } else {
      const menu = Menu.buildFromTemplate(template)
      Menu.setApplicationMenu(menu)
      // mainWindow.webContents.openDevTools()
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    let allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length > 0) {
      allWindows.map(w => {
        w.destroy()
      })
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const triggerSendEventToAllWindow = (message, data) => {
  // get all windows
  // console.log('BrowserWindow2222: ', BrowserWindow)
  let allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length > 0) {
    allWindows.map(w => {
      // send message includes data for each window
      w.webContents.send(message, data)
    })
  }
}

const setAutoUpdater = (mainWindow) => {
  console.log('checkForUpdates-checkForUpdates')
  autoUpdater.checkForUpdates()
  autoUpdater.on('checking-for-update', () => {
    console.log('sendStatusToWindow-Checking for update...')
    sendStatusToWindow('Checking for update...')
  })
  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('ipcUpdate', 'new update')
    ipcMain.on('replyIpcUpdate', (event, text) => {
      if (text.toString() === 'true') {
        autoUpdater.downloadUpdate()
      }
    })
  })
  autoUpdater.on('update-not-available', (info) => {
    console.log('sendStatusToWindow-Update not available.')
    sendStatusToWindow('Update not available.')
  })
  autoUpdater.on('error', (err) => {
    console.log('sendStatusToWindow-Error in auto-updater. ' + err)
    sendStatusToWindow('Error in auto-updater. ' + err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = 'Download speed: ' + progressObj.bytesPerSecond
    logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%'
    logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    console.log('sendStatusToWindow-logMessage', logMessage)
    sendStatusToWindow(logMessage)
  })
  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('ipcDownloadCompleted', 'download completed')
    ipcMain.on('replyIpcDownloadCompleted', (event, text) => {
      if (text.toString() === 'true') {
        autoUpdater.quitAndInstall()
      }
    })
  })
}

app.on('ready', () => {
  createWindow()
  // triggerSendEventToAllWindow('add-new-account', 'newCardData')
  // check for update
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

function sendStatusToWindow (text) {
  // log.info(text)
  // win.webContents.send('message', text)
  console.log('sendStatusToWindow====> ', text)
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
