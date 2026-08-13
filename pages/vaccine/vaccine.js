const storage = require('../../utils/storage.js')
const vplan = require('../../utils/vaccinePlan.js')
const app = getApp()

function pad(n) { return ('0' + n).slice(-2) }
function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

Page({
  data: {
    
    appDark: false,list: [],
    doneCount: 0,
    total: 0,
    showForm: false,
    current: null,
    date: '',
    time: '',
    batch: '',
    site: '左臂',
    reaction: ''
  },

  onShow() {
    
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
this.refresh()
  },

  refresh() {
    const records = storage.getAll()
    const list = vplan.buildStatus(records)
    const doneCount = list.filter(i => i.done).length
    this.setData({
      list,
      doneCount,
      total: list.length
    })
  },

  onItemTap(e) {
    const key = e.currentTarget.dataset.key
    const item = this.data.list.find(i => i.key === key)
    if (item.done) {
      wx.showModal({
        title: '已接种',
        content: `${item.name}（第${item.dose}剂）已于 ${formatDate(item.doneDate)} 接种。`,
        showCancel: false
      })
      return
    }
    const now = new Date()
    this.setData({
      showForm: true,
      current: item,
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      batch: '',
      site: '左臂',
      reaction: ''
    })
  },

  closeForm() {
    this.setData({ showForm: false, current: null })
  },

  onDateChange(e) { this.setData({ date: e.detail.value }) },
  onTimeChange(e) { this.setData({ time: e.detail.value }) },
  onBatchInput(e) { this.setData({ batch: e.detail.value }) },
  onSiteInput(e) { this.setData({ site: e.detail.value }) },
  onReactionInput(e) { this.setData({ reaction: e.detail.value }) },

  onSave() {
    const d = this.data
    if (!d.current) return
    const [y, m, day] = d.date.split('-').map(Number)
    const [hh, mm] = d.time.split(':').map(Number)
    const time = new Date(y, m - 1, day, hh, mm).getTime()
    storage.addRecord({
      type: 'vaccine',
      time,
      vaccineName: d.current.name,
      dose: d.current.dose,
      batch: d.batch,
      site: d.site,
      reaction: d.reaction
    })
    wx.showToast({ title: '已记录', icon: 'success' })
    this.setData({ showForm: false, current: null })
    this.refresh()
  },

  noop() {}
})
