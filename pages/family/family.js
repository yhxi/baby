const storage = require('../../utils/storage.js')
const app = getApp()

Page({
  data: {
    name: '',
    birthDate: '',
    gender: 'unknown',
    recordCount: 0,
    ageText: ''
  },

  onShow() {
    const profile = storage.getProfile()
    const count = storage.getAll().length
    let ageText = '未设置'
    if (profile && profile.birthDate) {
      const days = Math.floor((new Date() - new Date(profile.birthDate)) / (24 * 3600 * 1000))
      if (days < 30) ageText = `${days} 天`
      else {
        const m = Math.floor(days / 30)
        ageText = m < 12 ? `${m} 个月` : `${Math.floor(m / 12)} 岁 ${m % 12} 个月`
      }
    }
    this.setData({
      name: profile ? profile.name : '',
      birthDate: profile ? profile.birthDate : '',
      gender: profile ? profile.gender : 'unknown',
      recordCount: count,
      ageText
    })
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onDateChange(e) {
    this.setData({ birthDate: e.detail.value })
  },

  onGenderChange(e) {
    this.setData({ gender: e.currentTarget.dataset.value })
  },

  onSaveProfile() {
    const profile = {
      name: this.data.name || '宝宝',
      birthDate: this.data.birthDate,
      gender: this.data.gender
    }
    storage.saveProfile(profile)
    app.globalData.baby = profile
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  // 简单的本地数据导出（复制为文本）
  onExport() {
    const all = storage.getAll()
    const text = JSON.stringify({ profile: storage.getProfile(), records: all }, null, 2)
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'none' })
    })
  },

  onClear() {
    wx.showModal({
      title: '清空数据',
      content: '将删除所有养育记录，此操作不可恢复。确定继续吗？',
      success: (res) => {
        if (res.confirm) {
          storage.saveAll([])
          this.setData({ recordCount: 0 })
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
})
