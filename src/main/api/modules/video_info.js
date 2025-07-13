
import request from '../utils/request'
export default function videoInfo(query) {
  return request({
    url: 'https://api.bilibili.com/x/web-interface/view',
    method: 'get',
    data:{
        bvid:query?.bvid
    }
  })
}