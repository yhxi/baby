const storage = require('../../utils/storage.js')
const app = getApp()

const META = {
  milestone: { label: '发育里程碑', icon: '🏆', color: '#FFC107', placeholder: '如：第一次独坐', showValue: false, showAccept: false },
  food: { label: '辅食日记', icon: '🍚', color: '#FF9800', placeholder: '如：米粉', showValue: false, showAccept: true },
  temp: { label: '体温记录', icon: '🌡️', color: '#F44336', placeholder: '37.5', showValue: true, valueLabel: '体温(℃)', showAccept: false },
  teeth: { label: '牙齿萌出', icon: '🦷', color: '#00BCD4', placeholder: '如：下中切牙', showValue: false, showAccept: false },
  note: { label: '育儿备忘录', icon: '📝', color: '#9E9E9E', placeholder: '记录宝宝今天的事', showValue: false, showAccept: false },
  milk: { label: '母乳库存', icon: '🥛', color: '#FF9EB5', placeholder: '200', showValue: true, valueLabel: '库存(ml)', showAccept: false }
}

function pad(n) { return ('0' + n).slice(-2) }
function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

Page({
  data: {
    
    appDark: false,category: 'milestone',
    meta: {},
    list: [],
    showForm: false,
    date: '',
    time: '',
    title: '',
    value: '',
    accept: '喜欢',
    note: ''
  },

  onLoad(options) {
    const c = options.category || 'milestone'
    this.setData({ category: c, meta: META[c] }, () => {
      wx.setNavigationBarTitle({ title: META[c].label })
      this.refresh()
    })
  },

  onShow() {
    
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
this.refresh()
  },

  refresh() {
    const list = storage.getAll().filter(r => r.type === 'log' && r.category === this.data.category)
      .sort((a, b) => b.time - a.time)
      .map(r => {
        let sub = ''
        if (r.category === 'temp') sub = (r.value ? r.value + '℃ ' : '') + (r.note || '')
        else if (r.category === 'food') sub = (r.accept ? '接受度:' + r.accept + ' ' : '') + (r.note || '')
        else sub = r.note || ''
        const fever = r.category === 'temp' && Number(r.value) >= 37.3
        return Object.assign({}, r, {
          titleText: r.title,
          subText: sub.trim(),
          dateText: formatDate(r.time),
          fever
        })
      })
    this.setData({ list })
  },

  toggleForm() {
    const now = new Date()
    this.setData({
      showForm: !this.data.showForm,
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      title: '', value: '', accept: '喜欢', note: ''
    })
  },

  onDateChange(e) { this.setData({ date: e.detail.value }) },
  onTimeChange(e) { this.setData({ time: e.detail.value }) },
  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onValueInput(e) { this.setData({ value: e.detail.value }) },
  onNoteInput(e) { this.setData({ note: e.detail.value }) },
  onAcceptChange(e) { this.setData({ accept: e.currentTarget.dataset.v }) },

  onSave() {
    const d = this.data
    const meta = META[d.category]
    if (!d.title && !d.value) {
      wx.showToast({ title: '请填写内容', icon: 'none' })
      return
    }
    const [y, m, day] = d.date.split('-').map(Number)
    const [hh, mm] = d.time.split(':').map(Number)
    const time = new Date(y, m - 1, day, hh, mm).getTime()
    storage.addRecord({
      type: 'log',
      category: d.category,
      time,
      title: d.title || (meta.valueLabel || meta.label),
      value: Number(d.value) || 0,
      accept: d.accept,
      note: d.note,
      displayLabel: meta.label,
      displayIcon: meta.icon,
      displayColor: meta.color
    })
    wx.showToast({ title: '已保存', icon: 'success' })
    this.toggleForm()
    this.refresh()
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.removeRecord(id)
          this.refresh()
        }
      }
    })
  },

  noop() {}
})
