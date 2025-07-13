import { app, shell, ipcMain } from 'electron'
import { join } from 'path'
import { optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import IPC from './ipc'
import EventEmitter from 'events'
import WindowManager from './windows'
class BiliDownApp extends EventEmitter {
  constructor() {
    super()
    this.mainWindow = null
    this.windowManager = new WindowManager()
    this.openDevTools = true
    this.useOptimizer = true
    this.initApp()
  }
  static mainWindowOptions = {
    width: 800,
    height:500,
    maxWidth:800,
    maxHeight:500,
    resizable: false,
    frame: false,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  }
  initApp() {
    if (!app.requestSingleInstanceLock()) {
      app.quit()
    } else {
      app.on('second-instance', () => {
        if (this.mainWindow) {
          if (this.mainWindow.isMinimized()) {
            this.mainWindow.restore()
          }
          this.mainWindow.focus()
          this.mainWindow.flashFrame(true)
        }
      })
      app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          this.quitApp()
        }
      })
      app.whenReady().then(() => {
        this.createAppInstance()
        app.on('browser-window-created', (_, window) => {
          this.useOptimizer && optimizer.watchWindowShortcuts(window)
        })
        //注册IPC
        IPC(this.windowManager)
      })
    }
  }
  createAppInstance() {
    this.mainWindow = this.windowManager.createWindow('main', BiliDownApp.mainWindowOptions)
    this.mainWindow.setMaximizable(false)
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })
    if (is.dev && this.openDevTools) {
      this.mainWindow.webContents.openDevTools({
        mode:'detach'
      })
    }
    ipcMain.on('mainwindow:close', (e) => {
      this.quitApp()
    })
    ipcMain.on('mainwindow:minimize', () => {
      this.mainWindow.minimize()
    })
    ipcMain.on('mainwindow:maximize', () => {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.restore()
      } else {
        this.mainWindow.maximize()
      }
    })
    return this.mainWindow
  }
  quitApp(){
    this.windowManager.closeAllWindows()
    app.quit()
  }
}

/////////////////
new BiliDownApp()