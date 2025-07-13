import QRCode from 'qrcode'
import request from '../utils/request'
export default async (query)=> {
  const res = await request({
    url: 'https://passport.bilibili.com/x/passport-login/web/qrcode/generate',
    method: 'get'
  })
  if(res.status === 200 && query?.dataURL){
    let url = res.data?.data?.url
    const dataURL = await QRCode.toDataURL(url)
    res.data.dataURL = dataURL
  }
  return res
}
