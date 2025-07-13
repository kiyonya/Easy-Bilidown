import fs from 'fs';
import path from 'path';
export default class SRTProcessor {
    constructor(strUrl, srtFile) {
        this.strUrl = 'https:' + strUrl
        this.srtFile = srtFile,
            this.headers = {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
    }
    async setup(){
        const json = await this.downloadJson()
        const srt = this.processJsonToSrt(json)
        fs.writeFileSync(this.srtFile,srt,'utf-8')
        return {type:'srt', path: this.srtFile}
    }
    downloadJson() {
        return new Promise((resolve, reject) => {
            fetch(this.strUrl, {
                headers: this.headers,
                method: 'get',
            })
            .then(response => {
                if (!response.ok) {
                    reject(new Error(`HTTP error! status: ${response.status}`));
                }
                return response.json();
            })
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
        });
    }
    processJsonToSrt(json){
        let body = json?.body
        let strIndex = 1
        let srt = ''
        for(let text of body){
            let startTime = this.#formatSecondsToTime(text?.from)
            let endTime = this.#formatSecondsToTime(text?.to)
            let srtText = `${strIndex}\n${startTime} --> ${endTime}\n${text?.content}\n\n`
            srt += srtText
            strIndex++
        }
        return srt
    }
    #formatSecondsToTime(seconds) {
    const sec = parseFloat(seconds);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSeconds = Math.floor(sec % 60);
    const milliseconds = Math.round((sec % 1) * 1000);
    const pad = (num, size) => num.toString().padStart(size, '0');
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(remainingSeconds, 2)},${pad(milliseconds, 3)}`;
}
}