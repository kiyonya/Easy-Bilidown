
import { computed } from 'vue'
import store from '../store'
const tasks = computed({
  get: () => store.state.tasks,
  set: (value) => store.commit('updateTasks', value)
})
export default class DownloadAPI{
  constructor(){}
  static async  downloadAudio(uuid) {
    let task = tasks.value.get(uuid)
    if (!task?.userSelect?.audio) {
      return
    }
    let ext = task.userSelect.audio.codecs === 'fLaC' ? 'flac' : 'mp3'
    let fileName = `${task.title}-音频.${ext}`
    let filePath = await window.electron.ipcRenderer.invoke('dialog:saveDialog', {
      title: `保存音频`,
      filters: [{ name: '音频文件', extensions: ['mp3', 'flac'] }],
      fileName
    })
    if (!filePath) {
      return
    }
    window.electron.ipcRenderer.invoke('fs:downloadFile', {
      url: task.userSelect.audio.url,
      filePath,
      cookie: task.cookie
    })
  }
  static async downloadSRT(uuid){
let task = tasks.value.get(uuid)
    if (!task?.userSelect?.lang) {
      return
    }
    let fileName = `${task.title}-${task?.userSelect?.lang?.doc}.srt`
    let filePath = await window.electron.ipcRenderer.invoke('dialog:saveDialog', {
      title: `保存字幕`,
      filters: [{ name: 'SRT字幕文件', extensions: ['srt'] }],
      fileName
    })
    if (!filePath) {
      return
    }
    window.electron.ipcRenderer.invoke('fs:downloadSRT',{url:task?.userSelect?.lang?.url,fileName:filePath})
  }

  static async donwloadCover(uuid){
    let task = tasks.value.get(uuid)
    let fileName = `${task.title}.jpg`
    let filePath = await window.electron.ipcRenderer.invoke('dialog:saveDialog', {
      title: `保存封面`,
      filters: [{ name: '图片', extensions: ['jpg'] }],
      fileName
    })
    if (!filePath) {
      return
    }
    window.electron.ipcRenderer.invoke('fs:downloadFile', {
      url: task.cover,
      filePath,
      cookie: null
    })
  }
  
}
