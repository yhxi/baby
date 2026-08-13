const storage = require('../../utils/storage.js')

function pad(n) { return ('0' + n).slice(-2) }

function formatTime(ts) {
  const d = new Date(ts)
  return pad(d.getHours()) + ':' + pad(d.getMinutes())
}

Page({
  data: {
    groups: []
  },

  onShow() {
    this.refresh()
  },

  onPullDownRefresh() {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  refresh() {
    const all = storage.getAll().sort((a, b) => b.time - a.time)
    const map = {}
    all.forEach(r => {
      const d = new Date(r.time)
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      if (!map[key]) map[key] = { date: key, weekday: this.getWeekday(d.getDay()), items: [] }
      const t = storage.RECORD_TYPES[r.type] || { label: r.type, icon: '📌', color: '#999' }
      let desc = ''
      if (r.type === 'feed') desc = `${r.amount || 0} ml`
      else if (r.type === 'breast') desc = `${r.duration || 0} 分钟`
      else if (r.type === 'pump') desc = `${r.amount || 0} ml`
      else if (r.type === 'sleep') desc = `${r.duration || 0} 分钟`
      else if (r.type === 'diaper') desc = r.diaperType === 'poop' ? '大便' : (r.diaperType === 'pee' ? '小便' : '大小便')
      else if (r.type === 'medicine') desc = `${r.name || '补剂'} ${r.amount || ''}`
      if (r.note) desc += (desc ? ' · ' : '') + r.note
      map[key].items.push({
        id: r.id,
        typeLabel: t.label,
        icon: t.icon,
        color: t.color,
        timeText: formatTime(r.time),
        desc
      })
    })
    const groups = Object.keys(map).sort((a, b) => b.localeCompare(a)).map(k => map[k])
    this.setData({ groups })
  },

  getWeekday(d) {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d]
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/record/record?id=${id}` })
  }
})
