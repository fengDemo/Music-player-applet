# Music-player-applet

一个小白的个人学习项目，不足的地方请指出，好指教大佬们。

该项目使用了 微信web开发者工具 + Node.js + mysql 实现。

node.js 使用了 Express + mysql + body-parser ，使用 Express 快速搭建服务，mysql用于连接数据库，body-parser用于处理JSON, Raw, Text 和 URL 编码的数据。

数据库的数据是使用了 https://binaryify.github.io/NeteaseCloudMusicApi/#/ 这里边的数据，然后再存入自己的数据库。

页面的效果渲染则是通过微信web开发者工具实现，使用了官方的 wx.createInnerAudioContext() 作于音频的播放，歌曲的进度条使用了滑动选择器 slider，使用 可滑动区域组件 scroll-view 作于歌词的滚动。
### 目录结构
- MusicSever     
  + app.js      //
  + mysql.js    // 做连接 MySQL 数据库
  + package.json
  + package-lock.json
- MusicWatch
  + pages     // 页面和图片
  + app.js
  + app.json
  + app.wxss
  + project.config.json
  + sitemap.json
