import request from '../utils/request'
export default (query)=>{
  return request({
    url: 'https://api.bilibili.com/x/player/playurl',
    method: 'get',
    cookie:query?.cookie,
    data:{
        cid:query?.cid,
        bvid:query?.bvid,
        fourk:1,
        fnver:0,
        fnval:4048
    }
  })
}