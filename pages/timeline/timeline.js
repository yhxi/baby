const storage = require('../../utils/storage.js')
const app = getApp()

function pad(n) { return ('0' + n).slice(-2) }

function formatTime(ts) {
  const d = new Date(ts)
  return pad(d.getHours()) + ':' + pad(d.getMinutes())
}

Page({
  data: {
    
    appDark: false,groups: []
  },

  onShow() {
    
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
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
      let t = storage.RECORD_TYPES[r.type] || { label: r.type, icon: '📌', color: '#999' }
      let desc = ''
      if (r.type === 'feed') desc = `${r.amount || 0} ml`
      else if (r.type === 'breast') desc = `${r.duration || 0} 分钟`
      else if (r.type === 'pump') desc = `${r.amount || 0} ml`
      else if (r.type === 'sleep') desc = `${r.duration || 0} 分钟`
      else if (r.type === 'diaper') desc = r.diaperType === 'poop' ? '大便' : (r.diaperType === 'pee' ? '小便' : '大小便')
      else if (r.type === 'medicine') desc = `${r.name || '补剂'} ${r.amount || ''}`
      else if (r.type === 'growth') desc = `${r.height ? '身高' + r.height + 'cm ' : ''}${r.weight ? '体重' + r.weight + 'kg ' : ''}${r.headCircumference ? '头围' + r.headCircumference + 'cm' : ''}`.trim() || '生长记录'
      else if (r.type === 'vaccine') desc = `${r.vaccineName} 第${r.dose}剂`
      else if (r.type === 'log') {
        t = { label: r.displayLabel || '记录', icon: r.displayIcon || '📝', color: r.displayColor || '#9E9E9E' }
        desc = [r.title, r.value ? r.value + '℃' : '', r.accept ? '接受:' + r.accept : '', r.note].filter(Boolean).join(' · ')
      }
      if (r.note && r.type !== 'log') desc += (desc ? ' · ' : '') + r.note
      map[key].items.push({
        id: r.id,
        type: r.type,
        category: r.category || '',
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
    const ds = e.currentTarget.dataset
    const id = ds.id
    const type = ds.type
    if (type === 'growth') { wx.navigateTo({ url: '/pages/growth/growth' }); return }
    if (type === 'vaccine') { wx.navigateTo({ url: '/pages/vaccine/vaccine' }); return }
    if (type === 'log') { wx.navigateTo({ url: '/pages/log/log?category=' + (ds.category || 'milestone') }); return }
    wx.navigateTo({ url: `/pages/record/record?id=${id}` })
  }
})
