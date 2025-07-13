import { v4 } from 'uuid'
import { computed } from 'vue'
import store from '../store'
const tasks = computed({
  get: () => store.state.tasks,
  set: (value) => store.commit('updateTasks', value)
})
const config = computed({
  get: () => store.state.config
})

export default class TaskManager {
  constructor() {
    this._task = new Map()
    this.commitedTask = []
    this.progressMonitorInterval = null
    this.monitorDuration = 1000
  }
  async commitTask(taskCommitment) {
    this.commitedTask = taskCommitment
    let tasksWithBiliInfo = await this.requestTaskInfo()
    for (let i of tasksWithBiliInfo) {
      tasks.value.set(i?.uuid, i)
      console.log(i)
    }
    this.commitedTask = []
  }
  requestTaskInfo() {
    let cookie = localStorage.getItem('user_cookie')
    let renderMapPromise = this.commitedTask.map((i) => {
      return new Promise(async (resolve, reject) => {
        let playUrlInfo = await window.electron.ipcRenderer.invoke('api:getPlayUrl', {
          cid: i.cid,
          bvid: i.bvid,
          cookie
        })
        let playerInfo = await window.electron.ipcRenderer.invoke('api:getPlayer', {
          aid: i.aid,
          cid: i.cid,
          cookie
        })
        let videoInfo = await window.electron.ipcRenderer.invoke('api:videoInfo', { bvid: i.bvid })
        let duration = playUrlInfo.data.dash.duration
        let res = {
          ...i,
          videos: [],
          audios: [],
          duration,
          lang: [],
          title: videoInfo.data.title,
          cover: videoInfo.data.pic,
          pubDate: videoInfo.data.pubdate,
          userSelect: {
            video: null,
            audio: null,
            lang: null,
            cover:null,
            danmakuXml:false,
            danmakuAss:false,
            downloadAudio:true,
            downloadVideo:true,
            downloadLang:false,
            downloadCover:false,
          },
          status: 'pending',
          uuid: v4(),
          progress: 0,
          speed: 0
        }
        let videoQualityMap = new Map()
        for (let videoFormat of playUrlInfo?.data?.support_formats) {
          videoQualityMap.set(videoFormat.quality, {
            format: videoFormat.format,
            name: videoFormat.new_description
          })
        }
        let videoIndex = 0
        for (let videoDash of playUrlInfo?.data?.dash?.video) {
          res.videos.push({
            width: videoDash.width,
            height: videoDash.height,
            codec: videoDash.codecs,
            mime: videoDash.mimeType,
            frameRate: videoDash.frameRate,
            size: (videoDash.bandwidth * duration) / (8 * 1024 * 1024),
            ...videoQualityMap.get(videoDash.id),
            url: videoDash.baseUrl,
            backupUrl: videoDash.backupUrl,
            index:videoIndex,
          })
          videoIndex++
        }
        let audioIndex = 0
        for (let audioDash of playUrlInfo.data.dash.audio) {
          res.audios.push({
            codecs: audioDash.codecs,
            size: (audioDash.bandwidth * duration) / (8 * 1024 * 1024),
            mime: audioDash.mimeType,
            url: audioDash.baseUrl,
            backupUrl: audioDash.backupUrl,
            index:audioIndex,
            bandwidth:audioDash.bandwidth
          })
          audioIndex++
        }
        let langIndex = 0
        for (let lang of playerInfo.data.subtitle?.subtitles) {
          res.lang.push({
            lang: lang.ai_status,
            doc: lang.lan_doc,
            url: lang.subtitle_url,
            urlV2: lang.subtitle_url_v2,
            id: lang.id,
            index:langIndex
          })
          langIndex++
        }
        if (playUrlInfo?.data?.dash?.flac) {
          let audioDash = playUrlInfo.data.dash.flac.audio
          res.audios.push({
            codecs: audioDash.codecs,
            size: (audioDash.bandwidth * duration) / (8 * 1024 * 1024),
            mime: audioDash.mimeType,
            url: audioDash.baseUrl,
            backupUrl: audioDash.backupUrl,
            index:audioIndex++
          })
        }
        res.userSelect.audio = res.audios?.[0]
        res.userSelect.video = res.videos?.[0]
        res.userSelect.lang = res.lang?.[0] || null
        videoQualityMap = null
        resolve(res)
      })
    })
    
    return Promise.all(renderMapPromise)
  }
  setProgressMonitor() {
    this.progressMonitorInterval = setInterval(() => {
      this.#progressMonitor()
    }, this.monitorDuration)
  }
  async #progressMonitor() {
    if (![...tasks.value.values()].length) {
      return
    }
    const taskStatus = await window.electron.ipcRenderer.invoke('fs:queryDownloadingStatus')
    for (let i of taskStatus) {
      let t = tasks.value.get(i?.id)
      if (t) {
        t.status = i.status
        t.progress = i.progress
        t.speed = i.speed
      }
    }
  }
  async postTask() {
    let pendingTasks = Array.from(tasks.value.values()).filter((i) => i.status === 'pending')
    if (pendingTasks.length === 0) {
      alert('没有任务可以执行')
      return
    }
    let cookie = localStorage.getItem('user_cookie')
    let savePath = config.value.savePath
    if (!savePath) {
      savePath = await selectDir()
    }
    if (!savePath) {
      return
    }
    let commitedId = []
    for (let task of pendingTasks) {
      
      let postTask = {
        video: (task?.userSelect?.video && task?.userSelect?.downloadVideo) ? { ...task.userSelect.video, backupUrl: [] } : null,
        audio: (task?.userSelect?.audio && task?.userSelect?.downloadAudio) ? { ...task.userSelect.audio, backupUrl: [] } : null,
        cover: task?.userSelect?.downloadCover ? task?.cover : null,
        lang: (task?.userSelect?.lang && task?.userSelect?.downloadLang) ? { ...task.userSelect.lang, backupUrl: [] } : null,
        danmakuXml: task?.userSelect?.danmakuXml,
        danmakuAss: task?.userSelect?.danmakuAss,
        fileName: task?.title,
        savePath,
        cookie,
        id: task?.uuid,
        cid:task?.cid,
        bvid: task?.bvid,
      }
      console.log(postTask)
      let id = await window.electron.ipcRenderer.invoke('fs:addDownloadTask', postTask)
      commitedId.push(id)
      task.status = 'committed'
    }
    return commitedId
  }
}
async function selectDir() {
  const paths = await window.electron.ipcRenderer.invoke('dialog:openDialog', {
    title: '选择目录'
  })
  if (!paths.canceled && paths?.filePaths?.length) {
    let path = paths?.filePaths?.[0]
    store.commit('config', { key: 'savePath', value: path })
    return path
  }
  return null
}
