import { dialog, ipcMain } from 'electron'
import modules from './api/modules'
import { BiliConceDownloader, FileDownloader } from './download'
import path from 'path'
import SRTProcessor from './srt'
const downloader = new BiliConceDownloader(5)
export default function IPC(windowManager) {
  for (let moduleDef of modules) {
    ipcMain.handle(`api:${moduleDef.name}`, async (e, query) => {
      const moduleFunc = (await moduleDef.module(query)).default
      const res = await moduleFunc(query)
      return res.data
    })
  }
  ipcMain.handle('fs:addDownloadTask', (e, opt) => {
    let id = downloader.addTask(opt)
    return id
  })
  ipcMain.handle('fs:queryDownloadingStatus', (e) => {
    let tasks = downloader.getAllTasks()
    return tasks
  })
  ipcMain.handle(
    'dialog:openDialog',
    async (
      e,
      { properties = ['openDirectory'], defaultPath = process.cwd(), title = '选择文件夹' } = opt,
      filters = []
    ) => {
      const path = await dialog.showOpenDialog({
        properties,
        defaultPath,
        title,
        filters
      })
      if (path.canceled || !path.filePaths.length) {
        return null
      }
      return path.filePaths
    }
  )
  ipcMain.handle(
    'dialog:saveDialog',
    async (
      e,
      { defaultPath = process.cwd(), title = '保存文件', filters = [], fileName = '' } = opt
    ) => {
      const paths = await dialog.showSaveDialog({
        defaultPath: path.join(
          defaultPath,
          fileName
            .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
            .replace(/\s+/g, ' ')
            .trim()
        ),
        title,
        filters
      })
      if (paths.canceled || !paths.filePath) {
        return null
      }
      return paths.filePath
    }
  )
  ipcMain.handle('fs:downloadFile', async (e, options) => {
    const { url,  filePath, cookie } = options
    return FileDownloader.downloadFile({ url, filePath, cookie })
  })
  ipcMain.handle('fs:downloadSRT',(e,{url,fileName})=>{
    console.log(url)
    return new SRTProcessor(url,fileName).setup()
  })
}
