const storage = require('../../utils/storage.js')

function pad(n) { return ('0' + n).slice(-2) }
function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

Page({
  data: {
    stats: {
      feedCount: 0,
      feedAmount: 0,
      breastCount: 0,
      breastMinutes: 0,
      sleepMinutes: 0,
      diaperCount: 0,
      medicineCount: 0
    },
    weekBars: []
  },

  onShow() {
    this.refresh()
  },

  onPullDownRefresh() {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  refresh() {
    const all = storage.getAll()
    const now = new Date()
    const todayKey = dateKey(now)

    const today = all.filter(r => dateKey(new Date(r.time)) === todayKey)
    const stats = {
      feedCount: 0,
      feedAmount: 0,
      breastCount: 0,
      breastMinutes: 0,
      sleepMinutes: 0,
      diaperCount: 0,
      medicineCount: 0
    }
    today.forEach(r => {
      if (r.type === 'feed') { stats.feedCount++; stats.feedAmount += (r.amount || 0) }
      else if (r.type === 'breast') { stats.breastCount++; stats.breastMinutes += (r.duration || 0) }
      else if (r.type === 'pump') { stats.feedCount++; stats.feedAmount += (r.amount || 0) }
      else if (r.type === 'sleep') { stats.sleepMinutes += (r.duration || 0) }
      else if (r.type === 'diaper') { stats.diaperCount++ }
      else if (r.type === 'medicine') { stats.medicineCount++ }
    })

    // 近7天睡眠趋势
    const weekBars = []
    let maxVal = 1
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = dateKey(d)
      const daySleep = all.filter(r => dateKey(new Date(r.time)) === key && r.type === 'sleep')
        .reduce((s, r) => s + (r.duration || 0), 0)
      maxVal = Math.max(maxVal, daySleep)
      weekBars.push({
        day: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
        minutes: daySleep,
        height: daySleep
      })
    }
    weekBars.forEach(b => {
      b.height = Math.round((b.minutes / maxVal) * 100) || 2
    })

    this.setData({ stats, weekBars })
  }
})
