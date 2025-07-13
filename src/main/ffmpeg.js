
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import { app } from 'electron'
function getFFmpegPath(){
  if(!app.isPackaged){
    return path.join(__dirname, '../../resources', '/ffmpeg', 'ffmpeg.exe')
  }
  else{
    return path.join(process.resourcesPath,'app.asap.unpacked','ffmpeg','ffmpeg.exe')
  }
}

export default class FFmpegProcessor {
  constructor() {}
  static ffmpegPath = getFFmpegPath()
  static mergeVideoAudio({ videoPath, audioPath, saveFile } = ffmpegCommand,deleteTemp = true) {
    console.log(FFmpegProcessor.ffmpegPath)
    return new Promise((resolve, reject) => {
      ffmpeg()
        .setFfmpegPath(FFmpegProcessor.ffmpegPath)
        .input(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',
          '-c:a copy',
          '-strict experimental',
          '-map 0:v:0',
          '-map 1:a:0',
          '-shortest'
        ])
        .save(saveFile)
        .on('end', ()=>{
          if(fs.existsSync(videoPath) && deleteTemp) {
            fs.unlinkSync(videoPath)
          }
          if(fs.existsSync(audioPath) && deleteTemp) {
            fs.unlinkSync(audioPath)
          }
          resolve(saveFile)
        })
        .on('error', (e) => console.log(e))
    })
  }
}