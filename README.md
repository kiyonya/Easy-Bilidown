# EasyBiliDown
![License](https://img.shields.io/badge/License-MIT-green)   ![Require](https://img.shields.io/badge/Require-ffmpeg-blue)

## B站视频下载器

B站视频下载程序，BiliBili视频下载器，支持下载B站视频,弹幕,音频。基于Electron构建
初次使用需要登录才可下载1080P以上清晰度的视频，登录后cookies保存在浏览器localStorage，后续登录会自动调用
需要配置FFmpeg进行视频编解码，可以将ffmpeg.exe放置到/resources/ffmpeg
[下载FFmpeg](https://www.gyan.dev/ffmpeg/builds/ "下载FFmpeg")

> 注意 目前应用处于开发中 功能尚未完全完成 

## 第三方库使用
- 使用[qrcode](https://www.npmjs.com/package/qrcode "qrcode")生成登录二维码  ![License](https://img.shields.io/badge/License-MIT-green) 

- 使用[fluent-ffmpeg](https://www.npmjs.com/package/fluent-ffmpeg "fluent-ffmpeg")简化ffmpeg操作  ![License](https://img.shields.io/badge/License-MIT-green) 

- 使用[axios](https://github.com/axios/axios "axios")进行网络请求  ![License](https://img.shields.io/badge/License-MIT-green) 

## 应用特点
- **一键解析**：支持解析BV号，视频链接
- **全面支持**：支持下载视频，音频，杜比视界，4K视频，Hires音频，XML弹幕，ASS弹幕，SRT字幕，封面图
- **速度下载**：并发下载支持
- **界面简洁**：UI设计简洁，操作简单

## 应用截图
![视频](https://github.com/kiyonya/Easy-Bilidown/blob/master/images/video.png) 
![任务](https://github.com/kiyonya/Easy-Bilidown/blob/master/images/tasks.png) 

## 其他
本项目仅供个人学习研究使用，禁止用于商业及非法用途。 基于 MIT license 许可进行开源。