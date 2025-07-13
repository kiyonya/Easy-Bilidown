import request from '../utils/request'
export default (query)=>{
  return request({
    url: 'https://api.bilibili.com/x/player/wbi/v2',
    method: 'get',
    cookie:query?.cookie,
    data:{
        cid:query?.cid,
        aid:query?.aid
    }
  })
}