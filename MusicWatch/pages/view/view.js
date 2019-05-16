// pages/view/view.js
const urlRequest = "http://172.20.51.167:3030"   // 请求后台路径
const innerAudioContext = wx.createInnerAudioContext()   // 音频实例化
let sum = Math.floor(Math.random() * 10) //随机数 作于歌曲数组随机抽一个
Page({
  /**
   * 页面的初始数据
   */
  data: {
    animationImg: false,    // 歌曲图片旋转 false不转，true转
    conditionAudio: true,   // 歌曲歌词隐藏/显示  true隐藏，false显示
    condition: false,   // 歌曲图片隐藏/显示  true隐藏，false显示
    iconImg: '/pages/assets/start.png',   //播放开始图标
    audioTime: 0,   //进度条 0-100
    audioSeek: 0,   //歌曲时长 00:00.00
    showTimeMax: '00:00',   //歌曲总时长
    showTimeMin: '00:00',    //记录歌曲播放位置时长
    durationIntval: '',    //定时器
    posters: [],    // 存放后台返回的数据
    poster: [],     //存放歌曲(歌名/歌词/歌名id/歌曲图片)
    songLyric: [],  //存放用正则解析后的歌词
    songLyricDate: [],  //存放用正则解析后的歌词时间
    marginTop: 0,   //文稿滚动距离
    currentIndex: 0   //歌词行数
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.songAjax()
    // 小程序在手机上常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },
  onShow: function () {
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
  onHide: function () {
    console.log("手机熄屏")
  },
  // 请求后台，返回数据，再通过 sum 的随机值 赋值给poster
  songAjax: function () {
    let _this = this;
    wx.request({
      url: urlRequest,
      method: 'GET',
      success(res) {
        _this.parseLyric(res.data[sum].songLyric)
        _this.setData({
          posters: res.data,
          poster: res.data[sum]
        })
      }
    })
  },
  // 点击播放/暂停 图片切换
  songStartStop: function () {
    let poster = this.data.poster
    let icon = this.data.iconImg
    let newIcon = '/pages/assets/stop.png'
    let animationImg = false
    if (icon == '/pages/assets/start.png') {
      this.initialization(poster.songId)
      this.loadaudio()
      innerAudioContext.play()
      animationImg = true
    } else {
      newIcon = '/pages/assets/start.png'
      clearInterval(this.data.durationIntval)
      innerAudioContext.pause()
    }
    this.setData({
      iconImg: newIcon,
      animationImg: animationImg,
      showTimeMin: '00:00'
    })
  },
  // 定时器
  loadaudio() {
    let _this = this
    this.data.durationIntval = setInterval(() => {
      if (_this.data.iconImg == '/pages/assets/stop.png') {
        let seek = _this.data.audioSeek
        let duration = innerAudioContext.duration
        let time = _this.data.audioTime
        time = parseInt(100 * seek / duration)
        //当歌曲在播放时，每隔一秒歌曲播放时间+1，并计算分钟数与秒数
        let min = parseInt((seek + 1) / 60)
        let sec = parseInt((seek + 1) % 60)
        min.toString().length == 1 ? min = `0${min}` : min = `${min}`
        sec.toString().length == 1 ? sec = `0${sec}` : sec = `${sec}`
        // 当 time 达到 100 时，说明进度条也达到 100
        // 自动切换一首歌
        if (time >= 100) {
          _this.songSwitch('+1')
          _this.setData({
            audioSeek: 0,
            audioTime: 0,
            audioDuration: duration,
            showTimeMin: '00:00',
            iconImg: '/pages/assets/stop.png'
          })
          return false
        }
        _this.setData({
          audioSeek: seek + 1,
          audioTime: time,
          audioDuration: duration,
          showTimeMin: `${min}:${sec}`
        })
      }
    }, 1000)
  },

  // 切换歌上下首
  songSwitch: function (e) {
    let _this = this
    let songSwitch = ''
    // 因为在点击事件和 定时器事件里的if(item > 100) 传参进来，判断是从点击事件传入还是定时器事件传入
    e == '+1' ? songSwitch = parseInt(e) : songSwitch = parseInt(e.target.dataset.songswitch)
    sum = sum + songSwitch
    let newPoster = this.data.posters[sum]
    let poster = this.data.posters
    // 判断 sum 值小于 0 的话赋值总歌曲数组最大长度
    if (sum < 0) {
      sum = poster.length - 1
      newPoster = poster[sum]
    }
    // 判断 sum 值大于 总歌曲数组最大长度 的话赋值 0
    if (sum >= poster.length) {
      sum = poster.length - poster.length
      newPoster = poster[sum]
    }
    // 取消 setInterval 设置的定时器
    clearInterval(this.data.durationIntval)
    this.initialization(newPoster.songId)
    innerAudioContext.play()
    this.parseLyric(newPoster.songLyric)
    this.loadaudio()
    this.setData({
      audioSeek: 0,
      audioTime: 0,
      showTimeMin: '00:00',
      poster: newPoster,
      marginTop: 0,
      currentIndex: 0,
      iconImg: '/pages/assets/stop.png'
    })
  },

  // wx.createInnerAudioContext()实例
  // innerAudioContext.src 播放歌曲的url
  // onPlay()/onPause()/onError() 歌曲播放/暂停/失败方法
  // onCanplay() 监听歌曲进入可以播放状态
  initialization: function (songId) {
    let _this = this
    innerAudioContext.src = 'https://music.163.com/song/media/outer/url?id=' + songId + '.mp3'
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onPause(() => {
      console.log('暂停播放')
    })
    // 监听音频播放进度更新事件
    innerAudioContext.onTimeUpdate(() => {
      let currentIndex = _this.data.currentIndex
      let songLyric = _this.data.songLyric
      let songLyricDate = _this.data.songLyricDate
      let audioTime = _this.data.audioTime
      // // 文稿对应行颜色改变
      if (currentIndex != songLyric.length) {
        for (var j = currentIndex; j < songLyric.length; j++) {
          if (currentIndex == songLyric.length - 2) {
            if (parseFloat(innerAudioContext.currentTime) > parseFloat(songLyricDate[songLyric.length - 1])) {
              _this.setData({
                currentIndex: songLyric.length - 1
              })
            }
          } else {
            if (parseFloat(innerAudioContext.currentTime) > parseFloat(songLyricDate[j]) && parseFloat(innerAudioContext.currentTime) < parseFloat(songLyricDate[j + 1])) {
              _this.setData({
                currentIndex: j
              })
            }
          }
        }
      }
      if (currentIndex >= 1) {//超过6行开始滚动
        _this.setData({
          marginTop: (currentIndex - 0) * 35
        })
      }
    });
    // 在歌曲进入可以播放状态时 innerAudioContext.duration 获取歌曲的时长
    // 但获取歌曲时长得在 setTimeout() 里才能获取得到
    innerAudioContext.onCanplay(() => {
      innerAudioContext.duration
      setTimeout(() => {
        let duration = innerAudioContext.duration
        let min = parseInt(duration / 60)
        let sev = parseInt(duration % 60)
        if (sev.toString().length == 1) {
          sev = `0${sev}`
        }
        _this.setData({
          showTimeMax: `0${min}:${sev}`
        })
      }, 1000)
    }),
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  // 拖动歌曲进度条
  sliderChange: function (e) {
    let duration = this.data.audioDuration
    let marginTop = 0
    let currentIndex = 0
    let songLyricDate = this.data.songLyricDate
    // 获取拉动时进度条的值
    let value = e.detail.value
    // 用获取进度条的值与歌曲总时长相乘再除以100
    value = parseInt(value * duration / 100)
    // innerAudioContext.seek 是决定歌曲播放的位置
    innerAudioContext.seek(value)
    // 循环拖动当前时间和歌词时间数组，歌词行数加 1 判断拖动当前歌词到哪句
    songLyricDate.forEach((value1,index,item)=>{
      if(value >= value1){
        currentIndex++
      }
    })
    this.setData({
      audioSeek: value || 0,
      marginTop: currentIndex * 35,
      currentIndex: currentIndex - 1,
    })
  },

  // 切换歌曲图片和歌曲歌词
  showHidden: function () {
    this.setData({
      condition: !this.data.condition,
      conditionAudio: !this.data.conditionAudio
    })
  },

  // 解析lyric歌词 切割每一行的'\n'和提取出歌词里的时间 [00:00.00]
  // 对存放切换后的 lines 使用 forEach()和匹配时间的正则表达式 pattern 删除掉歌词里的时间再赋值给 reslut
  // reslut 作为暂时存放解析歌词后的数组，在 删除掉时间后再使用 forEach() 删除掉 null 值
  // 再把 reslut 赋值给 songLyric
  parseLyric: function (text) {
    let result = []
    let lyricDate = []
    let lines = text.split('\n') //切割每一行
    // //用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]
    let pattern = /\[\d*:\d*((\.|\:)\d*)*\]/g
    //在切换每一行的'\n'后在数组最后一个值是空值，所以在这里删除掉
    lines[lines.length - 1].length === 0 && lines.pop()
    lines.forEach((value, index, item) => {
      let timeValue = value.replace(pattern, '')
      if (!timeValue) {
        item.splice(index, 1)
      }
    })
    lines.forEach((value, index, item) => {
      let i = value.match(pattern)
      let timeValue = value.replace(pattern, '')
      result[index] = timeValue
      i.forEach((value, index, item) => {
        let i = value.slice(1, -1).split(':')
        lyricDate.push(parseInt(i[0], 10) * 60 + parseFloat(i[1]))
      })
    })
    this.setData({
      songLyric: result,
      songLyricDate: lyricDate
    })
    return result
  },
})