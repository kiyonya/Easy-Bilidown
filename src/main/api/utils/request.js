const axios = require('axios')
const defaultHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0",
  Referer: "https://www.bilibili.com/",
};

export default async function request(requestOptions) {
    let {url,cookie,method = 'get',responseType = 'json',timeout = 10000,onProgress = null,data = null} = requestOptions
    if(data){
      let params = ""
      let i = 0
      for(let key in data){
        if(i === 0){
          params += `?${key}=${data[key]}`
        }
        else{
          params += `&${key}=${data[key]}`
        }
        i++
      }
      url += params
    }
    const res = await axios({
        url,
        headers:{
            ...defaultHeaders,
            ...(cookie ? {Cookie:cookie} : {Cookie:''})
        },
        method,
        responseType,
        timeout,
        ...((onProgress && typeof onProgress === 'function') && {onDownloadProgress:onProgress}),
    })
    console.log(url)

      return res
    
}
