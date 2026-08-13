const storage = require('../../utils/storage.js')
const gs = require('../../utils/growthStandard.js')
const app = getApp()

function pad(n) { return ('0' + n).slice(-2) }

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

Page({
  data: {
    
    appDark: false,profile: null,
    records: [],
    showForm: false,
    date: '',
    time: '',
    height: '',
    weight: '',
    headCircumference: '',
    note: ''
  },

  onShow() {
    
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
this.refresh()
  },

  refresh() {
    const profile = storage.getProfile() || { name: '宝宝', gender: 'unknown' }
    const records = storage.getByType('growth').map(r => {
      const months = gs.getAgeInMonths(profile.birthDate, r.time)
      let evalText = ''
      if (r.height) {
        const ref = gs.getReference(profile.gender, 'height', months)
        const ev = gs.evaluate(r.height, ref)
        evalText += `身高${ev.label}`
      }
      if (r.weight) {
        const ref = gs.getReference(profile.gender, 'weight', months)
        const ev = gs.evaluate(r.weight, ref)
        evalText += (evalText ? ' · ' : '') + `体重${ev.label}`
      }
      return Object.assign({}, r, {
        dateText: formatDate(r.time),
        months: months.toFixed(1),
        evalText
      })
    })
    this.setData({ profile, records })
  },

  toggleForm() {
    const now = new Date()
    this.setData({
      showForm: !this.data.showForm,
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      height: '',
      weight: '',
      headCircumference: '',
      note: ''
    })
  },

  onDateChange(e) { this.setData({ date: e.detail.value }) },
  onTimeChange(e) { this.setData({ time: e.detail.value }) },
  onHeightInput(e) { this.setData({ height: e.detail.value }) },
  onWeightInput(e) { this.setData({ weight: e.detail.value }) },
  onHeadInput(e) { this.setData({ headCircumference: e.detail.value }) },
  onNoteInput(e) { this.setData({ note: e.detail.value }) },

  onSave() {
    const d = this.data
    if (!d.height && !d.weight && !d.headCircumference) {
      wx.showToast({ title: '请至少填一项', icon: 'none' })
      return
    }
    const [y, m, day] = d.date.split('-').map(Number)
    const [hh, mm] = d.time.split(':').map(Number)
    const time = new Date(y, m - 1, day, hh, mm).getTime()
    storage.addRecord({
      type: 'growth',
      time,
      height: Number(d.height) || 0,
      weight: Number(d.weight) || 0,
      headCircumference: Number(d.headCircumference) || 0,
      note: d.note
    })
    wx.showToast({ title: '已保存', icon: 'success' })
    this.toggleForm()
    this.refresh()
  },

  onChartTap() {
    wx.navigateTo({ url: '/pages/growthChart/growthChart' })
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条生长记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.removeRecord(id)
          this.refresh()
        }
      }
    })
  }
})
