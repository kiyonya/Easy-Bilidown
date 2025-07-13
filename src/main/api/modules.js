const modules = [
  {
    name: 'qrcodeGenerate',
    module: () => import('./modules/qrcode_generate')
  },
  {
    name: 'qrcodePoll',
    module: () => import('./modules/qrcode_poll')
  },
  {
    name: 'userInfo',
    module: () => import('./modules/user_info')
  },
  {
    name:'videoInfo',
    module:() => import('./modules/video_info')
  },
  {
    name:'getPlayer',
    module:() => import('./modules/get_player')
  },
  {
    name:'getPlayUrl',
    module:() => import('./modules/get_play_url')
  }
];
export default modules;
