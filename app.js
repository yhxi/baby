App({
  globalData: {
    baby: {
      name: '宝宝',
      birthDate: '',
      gender: 'unknown'
    }
  },
  onLaunch() {
    const baby = wx.getStorageSync('babyProfile')
    if (baby) {
      this.globalData.baby = baby
    }
  }
})
