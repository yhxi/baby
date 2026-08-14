const storage = require('../../utils/storage.js')
const app = getApp()

function pad(n) { return ('0' + n).slice(-2) }
function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

Page({
  data: {
    
    appDark: false,stats: {
      feedCount: 0,
      feedAmount: 0,
      breastCount: 0,
      breastMinutes: 0,
      sleepMinutes: 0,
      diaperCount: 0,
      medicineCount: 0
    },
    weekBars: [],
    anniversary: [],
    feedAvgInterval: 0,
    longestSleep: 0,
    careHints: []
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

    // 重要日子倒计时（满月/百天/半岁/周岁）
    const profile = storage.getProfile()
    let anniversary = []
    if (profile && profile.birthDate) {
      const birth = new Date(profile.birthDate)
      const marks = [
        { name: '满月', days: 30 },
        { name: '百天', days: 100 },
        { name: '半岁', days: 182 },
        { name: '周岁', days: 365 }
      ]
      anniversary = marks.map(m => {
        const target = new Date(birth.getTime() + m.days * 86400000)
        const diff = Math.round((target - now) / 86400000)
        return {
          name: m.name,
          text: diff > 0 ? '还有 ' + diff + ' 天' : '已过 ' + Math.abs(diff) + ' 天',
          passed: diff <= 0,
          percent: Math.min(100, Math.max(0, Math.round((1 - Math.abs(diff) / m.days) * 100)))
        }
      })
    }

    // 喂奶间隔 & 最长睡眠
    const feedsToday = today.filter(r => r.type === 'feed' || r.type === 'breast' || r.type === 'pump').sort((a, b) => a.time - b.time)
    let feedAvgInterval = 0
    if (feedsToday.length >= 2) {
      let total = 0
      for (let i = 1; i < feedsToday.length; i++) total += (feedsToday[i].time - feedsToday[i - 1].time)
      feedAvgInterval = Math.round(total / (feedsToday.length - 1) / 60000)
    }
    let longestSleep = 0
    today.filter(r => r.type === 'sleep').forEach(r => { longestSleep = Math.max(longestSleep, r.duration || 0) })

    const careHints = []
    if (!today.length) careHints.push({ icon: '📝', title: '今天还没有照护记录', text: '从一次喂养、尿布或睡眠开始，方便家人交接。' })
    else careHints.push({ icon: '✨', title: `今天已记录 ${today.length} 次照护`, text: '持续记录即可看见自己的节奏，不需要追求“标准答案”。' })
    if (stats.diaperCount === 0) careHints.push({ icon: '👶', title: '尿布尚未记录', text: '若有更换，可一键补记，让照护者掌握完整情况。' })
    if (stats.medicineCount === 0) careHints.push({ icon: '💊', title: '补剂记录为空', text: '如医生已交代补剂，可在待办中设置提醒；未交代时无需自行添加。' })
    this.setData({ stats, weekBars, anniversary, feedAvgInterval, longestSleep, careHints })
  }
})
