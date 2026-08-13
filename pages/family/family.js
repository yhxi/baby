const storage = require('../../utils/storage.js')
const backup = require('../../utils/backup.js')
const app = getApp()

function ageTextOf(birthDate) {
  if (!birthDate) return '未设置'
  const days = Math.floor((new Date() - new Date(birthDate)) / (24 * 3600 * 1000))
  if (days < 0) return '未出生'
  if (days < 30) return `${days} 天`
  const m = Math.floor(days / 30)
  return m < 12 ? `${m} 个月` : `${Math.floor(m / 12)} 岁 ${m % 12} 个月`
}

Page({
  data: {
    appDark: false,
    name: '',
    birthDate: '',
    gender: 'unknown',
    ageText: '',
    recordCount: 0,
    babies: [],
    activeBabyId: '',
    // 宝宝表单
    showBabyForm: false,
    editingBabyId: '',
    babyFormName: '',
    babyFormDate: '',
    babyFormGender: 'unknown',
    // 云
    cloudEnv: '',
    showCloudForm: false
  },

  onShow() {
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
    this.refresh()
  },

  refresh() {
    const profile = storage.getActiveProfile() || { name: '宝宝', birthDate: '', gender: 'unknown' }
    const babies = storage.getProfiles().map(p => ({
      id: p.id,
      name: p.name || '宝宝',
      gender: p.gender,
      ageText: ageTextOf(p.birthDate),
      active: p.id === storage.getActiveBabyId()
    }))
    this.setData({
      name: profile.name || '',
      birthDate: profile.birthDate || '',
      gender: profile.gender || 'unknown',
      ageText: ageTextOf(profile.birthDate),
      recordCount: storage.getAll().length,
      babies,
      activeBabyId: storage.getActiveBabyId(),
      cloudEnv: storage.getCloudEnv()
    })
  },

  // ---------- 当前宝宝档案 ----------
  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onDateChange(e) { this.setData({ birthDate: e.detail.value }) },
  onGenderChange(e) { this.setData({ gender: e.currentTarget.dataset.value }) },

  onSaveProfile() {
    storage.updateProfile(this.data.activeBabyId, {
      name: this.data.name || '宝宝',
      birthDate: this.data.birthDate,
      gender: this.data.gender
    })
    const p = storage.getActiveProfile()
    if (p) app.globalData.baby = p
    this.refresh()
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  // ---------- 多宝宝管理 ----------
  onBabyTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeBabyId) return
    wx.showModal({
      title: '切换宝宝',
      content: '切换后将显示该宝宝的记录',
      success: (res) => { if (res.confirm) app.switchBaby(id) }
    })
  },

  openBabyForm() {
    this.setData({
      showBabyForm: true,
      editingBabyId: '',
      babyFormName: '',
      babyFormDate: '',
      babyFormGender: 'unknown'
    })
  },

  openEditBaby(e) {
    const id = e.currentTarget.dataset.id
    const b = this.data.babies.find(x => x.id === id)
    if (!b) return
    const prof = storage.getProfiles().find(p => p.id === id)
    this.setData({
      showBabyForm: true,
      editingBabyId: id,
      babyFormName: prof.name || '',
      babyFormDate: prof.birthDate || '',
      babyFormGender: prof.gender || 'unknown'
    })
  },

  onBabyName(e) { this.setData({ babyFormName: e.detail.value }) },
  onBabyDate(e) { this.setData({ babyFormDate: e.detail.value }) },
  onBabyGender(e) { this.setData({ babyFormGender: e.currentTarget.dataset.value }) },

  saveBabyForm() {
    const d = this.data
    const payload = {
      name: d.babyFormName || '宝宝',
      birthDate: d.babyFormDate,
      gender: d.babyFormGender
    }
    if (d.editingBabyId) {
      storage.updateProfile(d.editingBabyId, payload)
    } else {
      storage.addProfile(payload)
    }
    this.setData({ showBabyForm: false })
    this.refresh()
    wx.showToast({ title: '已保存', icon: 'success' })
  },

  closeBabyForm() { this.setData({ showBabyForm: false }) },

  deleteBaby(e) {
    const id = e.currentTarget.dataset.id
    if (this.data.babies.length <= 1) {
      wx.showToast({ title: '至少保留一个宝宝', icon: 'none' })
      return
    }
    wx.showModal({
      title: '删除宝宝',
      content: '将同时删除该宝宝的全部记录，不可恢复',
      success: (res) => {
        if (res.confirm) {
          storage.removeProfile(id)
          this.refresh()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  // ---------- 主题 ----------
  onToggleTheme(e) {
    const next = app.toggleTheme()
    this.setData({ appDark: next === 'dark' })
  },

  // ---------- 备份 ----------
  onExportFile() {
    try {
      const path = backup.exportToFile()
      wx.shareFileMessage({
        filePath: path,
        fileName: '宝宝养育数据备份.json',
        success: () => {},
        fail: () => {
          // 降级：复制到剪贴板
          const fs = wx.getFileSystemManager()
          const json = fs.readFileSync(path, 'utf8')
          wx.setClipboardData({ data: json, success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'none' }) })
        }
      })
    } catch (err) {
      wx.showToast({ title: '导出失败', icon: 'none' })
    }
  },

  onImportFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: (res) => {
        const f = res.tempFiles[0]
        const fs = wx.getFileSystemManager()
        fs.readFile({
          filePath: f.path,
          encoding: 'utf8',
          success: (r) => {
            const ok = backup.importFromString(r.data)
            if (ok) {
              this.refresh()
              wx.showToast({ title: '恢复成功', icon: 'success' })
            } else {
              wx.showToast({ title: '文件格式错误', icon: 'none' })
            }
          },
          fail: () => wx.showToast({ title: '读取失败', icon: 'none' })
        })
      }
    })
  },

  onCloudBackup() {
    backup.cloudBackup().then(() => {
      wx.showToast({ title: '云端备份成功', icon: 'success' })
    }).catch(() => {
      wx.showToast({ title: '请先填写云环境ID并开通云开发', icon: 'none' })
    })
  },

  onCloudRestore() {
    backup.cloudRestore().then((ok) => {
      if (ok) {
        this.refresh()
        wx.showToast({ title: '云端恢复成功', icon: 'success' })
      } else {
        wx.showToast({ title: '恢复失败', icon: 'none' })
      }
    }).catch(() => {
      wx.showToast({ title: '请先填写云环境ID并开通云开发', icon: 'none' })
    })
  },

  openCloudForm() {
    this.setData({ showCloudForm: true, cloudEnv: storage.getCloudEnv() })
  },
  onCloudEnvInput(e) { this.setData({ cloudEnv: e.detail.value }) },
  saveCloudEnv() {
    storage.setCloudEnv(this.data.cloudEnv.trim())
    this.setData({ showCloudForm: false })
    wx.showToast({ title: '已保存', icon: 'success' })
  },
  closeCloudForm() { this.setData({ showCloudForm: false }) },

  noop() {},

  onClear() {
    wx.showModal({
      title: '清空数据',
      content: '将删除当前宝宝的全部养育记录，此操作不可恢复。确定继续吗？',
      success: (res) => {
        if (res.confirm) {
          const list = storage.getAllRaw().filter(r => r.babyId !== this.data.activeBabyId)
          storage.saveAll(list)
          this.refresh()
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
})
