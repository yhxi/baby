const wn = require('../../utils/whiteNoise.js')

Page({
  data: {
    appDark: false,
    list: [],
    playing: '',
    volume: 0.6
  },

  onLoad() {
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
    const list = Object.keys(wn.TYPES).map(k => Object.assign({ key: k }, wn.TYPES[k]))
    this.setData({ list })
  },

  onShow() {
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
  },

  onUnload() {
    this.stop()
  },

  onVolume(e) {
    const v = e.detail.value / 100
    this.setData({ volume: v })
    if (this._audio) this._audio.volume = v
  },

  play(e) {
    const type = e.currentTarget.dataset.key
    this.stop()
    const path = wn.ensureFile(type)
    const audio = wx.createInnerAudioContext()
    audio.src = path
    audio.loop = true
    audio.volume = this.data.volume
    audio.onError((err) => {
      wx.showToast({ title: '播放失败', icon: 'none' })
      console.error('noise play error', err)
    })
    audio.play()
    this._audio = audio
    this.setData({ playing: type })
  },

  stop() {
    if (this._audio) {
      this._audio.stop()
      this._audio.destroy()
      this._audio = null
    }
    this.setData({ playing: '' })
  }
})
