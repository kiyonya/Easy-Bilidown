import { EventEmitter } from 'events'
import axios from 'axios'
import fs, { write } from 'fs'
import path from 'path'
import FFmpegProcessor from './ffmpeg'
import SRTProcessor from './srt'
import DanmakuProcessor from './danmaku'
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  Referer: 'https://www.bilibili.com/'
}
export class BiliConceDownloader extends EventEmitter {
  constructor(concurrency = 10) {
    super()
    this.concurrency = concurrency
    this.tasks = new Map()
    this.activeTasks = 0
    this.speedInterval = null
    this.speedUpdateInterval = 1000
    this.startSpeedMonitor()
  }

  addTask({
    video,
    audio,
    cover,
    danmakuXml,
    danmakuAss,
    lang,
    fileName,
    savePath,
    cookie,
    id,
    cid,
    bvid
  } = task) {

    const task = {
      video,
      audio,
      cover,
      danmakuXml,
      danmakuAss,
      lang,
      cid,
      bvid,
      fileName: fileName
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
        .replace(/\s+/g, ' ')
        .trim(),
      savePath: path.resolve(savePath),
      cookie,
      status: 'commited',
      progress: 0,
      totalSize: 0,
      downloadedSize: 0,
      speed: 0,
      lastUpdateTime: Date.now(),
      lastDownloadedSize: 0,
      id: id,
      startTime: null,
      endTime: null,
      streams: new Map(),
      writers: new Map()
    }
    if (!video && !audio && !cover && !lang && !danmakuXml && !danmakuAss) {
      task.status = 'completed'
    }
    this.tasks.set(id, task)
    this.runTask()
    return id
  }

  runTask() {
    if (this.activeTasks >= this.concurrency) {
      return
    }
    const nextTask = [...this.tasks.values()].find((task) => task.status === 'commited')
    if (nextTask) {
      this.activeTasks++
      nextTask.status = 'downloading'
      nextTask.startTime = Date.now()
      this.processTask(nextTask)
    }
  }
  async processTask(task) {
    try {
      const { video, audio, cover, danmakuXml, danmakuAss, lang, savePath, fileName, id, cookie } = task
      if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true })
      }
      const downloadPromises = []
      if (video) {
        downloadPromises.push(
          this.downloadFile({ url: video.url, savePath, fileName: `${fileName}_video_track`, id, cookie, mime: 'video/mp4', type: 'video' }, task))
      }
      if (audio) {
        downloadPromises.push(
          this.downloadFile(
            {
              url: audio.url,
              savePath,
              fileName: `${fileName}_audio_track`,
              id,
              cookie,
              mime: audio?.codecs === 'fLaC' ? 'audio/flac' : 'audio/mp4',
              type: 'audio'
            },
            task
          )
        )
      }
      if (cover) {
        downloadPromises.push(
          this.downloadFile(
            {
              url: cover,
              savePath,
              fileName,
              id,
              cookie,
              mime: 'image/jpg',
              type: 'image'
            },
            task
          )
        )
      }
      if (lang) {
        downloadPromises.push(new SRTProcessor(lang?.url, path.join(savePath, `${fileName}_${lang?.doc}.srt`)).setup())
      }
      if (danmakuAss) {
        downloadPromises.push(new DanmakuProcessor(task?.cid, {}).toAss(path.join(savePath, `${fileName}.ass`)))
      }
      if (danmakuXml) {
        downloadPromises.push(new DanmakuProcessor(task?.cid, {}).toXml(path.join(savePath, `${fileName}.xml`)))
      }
      let fin = await Promise.all(downloadPromises)
      task.status = 'merging'
      if (fin.length > 0 && fin.some((i) => i.type === 'video') && fin.some((i) => i.type === 'video')) {
        let videoPath = fin.filter((i) => i.type === 'video')?.[0]?.path
        let audioPath = fin.filter((i) => i.type === 'audio')?.[0]?.path
        let ff = {
          videoPath,
          audioPath,
          saveFile: path.join(task?.savePath, `${fileName}-${video?.name}.mp4`)
        }
        await FFmpegProcessor.mergeVideoAudio(ff, true)
      } else {
        for (let file of fin) {
          if (file?.type === 'audio' || file?.type === 'video') {
            let filePath = file?.path
            fs.renameSync(filePath, filePath.replace('_audio_track', '').replace('_video_track', ''))
          }
        }
      }
      task.status = 'completed'
      task.endTime = Date.now()
    } catch (error) {
      console.error(error)
      task.status = 'failed'
      task.error = error.message
    } finally {
      this.activeTasks--
      this.runTask()
    }
  }

  async downloadFile(options, task) {
    return new Promise(async (resolve, reject) => {
      try {
        const { url, savePath, fileName, id, cookie, mime, type } = options;
        const ext = this.getFileExtension(mime);
        const tempFilePath = path.join(savePath, `${fileName}.${ext}`);

        const response = await axios({
          url,
          method: 'get',
          responseType: 'stream',
          headers: {
            ...headers,
            ...(cookie ? { Cookie: cookie } : {})
          }
        });

        if (!task.downloadStats) {
          task.downloadStats = new Map();
        }

        const downloadStat = {
          totalSize: parseInt(response.headers['content-length'], 10) || 0,
          downloadedSize: 0,
          lastDownloadedSize: 0,
          lastUpdateTime: Date.now(),
          speed: 0
        };
        task.downloadStats.set(type, downloadStat);

        // 更新总大小
        task.totalSize = Array.from(task.downloadStats.values())
          .reduce((sum, stat) => sum + stat.totalSize, 0);

        const writer = fs.createWriteStream(tempFilePath);
        task.writers.set(type, writer);
        task.streams.set(type, response.data);

        response.data.on('data', (chunk) => {
          const size = chunk.length;
          downloadStat.downloadedSize += size;

          // 更新总下载量
          task.downloadedSize = Array.from(task.downloadStats.values())
            .reduce((sum, stat) => sum + stat.downloadedSize, 0);
          if (task.totalSize > 0) {
            task.progress = Math.min(100, (task.downloadedSize / task.totalSize) * 100);
          }
        });

        writer.on('finish', () => {
          writer.close();
          resolve({
            type,
            path: tempFilePath
          });
        });

        writer.on('error', (err) => {
          writer.close();
          reject(err);
        });

        response.data.pipe(writer);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }

  getFileExtension(mime) {
    if (mime.startsWith('video/')) {
      return 'mp4'
    } else if (mime === 'audio/flac') {
      return 'flac'
    } else if (mime === 'image/jpg') {
      return 'jpg'
    }
    return 'mp3'
  }

  startSpeedMonitor() {
    this.speedInterval = setInterval(() => {
      for (const task of this.tasks.values()) {
        if (task.status === 'downloading' && task.downloadStats) {
          let totalSpeed = 0;
          const now = Date.now();
          for (const [type, stat] of task.downloadStats) {
            const timeDiff = (now - stat.lastUpdateTime) / 1000;
            const downloadedDiff = stat.downloadedSize - stat.lastDownloadedSize;

            if (timeDiff > 0) {
              stat.speed = downloadedDiff / timeDiff;
              totalSpeed += stat.speed;
            }
            stat.lastUpdateTime = now;
            stat.lastDownloadedSize = stat.downloadedSize;
          }

          task.speed = totalSpeed;
        }
      }
    }, this.speedUpdateInterval);
  }

  stopSpeedMonitor() {
    if (this.speedInterval) {
      clearInterval(this.speedInterval)
      this.speedInterval = null
    }
  }

  getAllTasks() {
    let tasks = Array.from(this.tasks.values()).map((i) => ({
      status: i.status,
      progress: i.progress,
      totalSize: i.totalSize,
      downloadedSize: i.downloadedSize,
      speed: i.speed,
      id: i.id
    }))
    return tasks
  }

  destroy() {
    this.stopSpeedMonitor()
    for (const task of this.tasks.values()) {
      if (task.status === 'downloading' || task.status === 'paused') {
        this.cancelTask(task.id)
      }
    }
    this.tasks.clear()
  }
}
export class FileDownloader {
  constructor() { }
  static downloadFile(options) {
    return new Promise((resovle, reject) => {
      const { url, filePath, cookie } = options
      const writer = fs.createWriteStream(filePath)
      axios({
        url,
        method: 'get',
        responseType: 'stream',
        headers: {
          ...headers,
          ...(cookie ? { Cookie: cookie } : {})
        }
      })
        .then((response) => {
          response.data.pipe(writer)
          writer.on('finish', () => {
            writer.close()
            resovle(filePath)
          })
        })
        .catch((err) => {
          reject(err)
        })
      resovle()
    })
  }
}
