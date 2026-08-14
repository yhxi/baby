const storage = require('./utils/storage.js')
const cloudSync = require('./utils/cloudSync.js')

App({
  globalData: {
    baby: { name: '宝宝', birthDate: '', gender: 'unknown' },
    theme: 'light',
    activeBabyId: null
  },

  onLaunch() {
    const profile = storage.getActiveProfile()
    if (profile) this.globalData.baby = profile
    this.globalData.activeBabyId = storage.getActiveBabyId()
    this.globalData.theme = storage.getTheme()
    // Sync is non-blocking: the local-first UI is never held up by the network.
    cloudSync.sync().catch(() => {})
  },

  onShow() { cloudSync.sync().catch(() => {}) },

  // 切换宝宝：更新全局状态并重启到首页，确保所有页面用新数据刷新
  switchBaby(id) {
    if (!storage.setActiveBaby(id)) return
    this.globalData.activeBabyId = id
    const profile = storage.getActiveProfile()
    if (profile) this.globalData.baby = profile
    wx.reLaunch({ url: '/pages/index/index' })
  },

  // 切换主题，返回当前是否深色
  toggleTheme() {
    const next = this.globalData.theme === 'dark' ? 'light' : 'dark'
    this.globalData.theme = next
    storage.setTheme(next)
    if (next === 'dark') {
      wx.setBackgroundColor({ backgroundColor: '#1a1a1a', backgroundColorTop: '#1a1a1a', backgroundColorBottom: '#1a1a1a' })
      wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#1a1a1a' })
    } else {
      wx.setBackgroundColor({ backgroundColor: '#EAF7FF', backgroundColorTop: '#EAF7FF', backgroundColorBottom: '#EAF7FF' })
      wx.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#167FDB' })
    }
    return next
  }
})
