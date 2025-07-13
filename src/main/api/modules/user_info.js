import request from '../utils/request'
export default (query)=> {
  return request({
    url: 'https://api.bilibili.com/x/web-interface/nav',
    method: 'get',
    cookie:query?.cookie
  })
}