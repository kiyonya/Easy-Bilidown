import request from '../utils/request'
export default async (query)=> {
  const res = await request({
    url: 'https://passport.bilibili.com/x/passport-login/web/qrcode/poll',
    method: 'get',
    data:{
        qrcode_key:query?.qrkey
    }
  })
  if(res.data?.data?.code === 0){
    res.data.data.cookie = res.headers['set-cookie'].join(";")
  }
  return res
}
