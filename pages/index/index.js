const storage = require('../../utils/storage.js')

function formatDuration(min) {
  if (!min) return '0分钟'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0) return `${h}小时${m > 0 ? m + '分' : ''}`
  return `${m}分钟`
}

function formatTime(ts) {
  const d = new Date(ts)
  return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2)
}

function getDaysSince(birthDate) {
  if (!birthDate) return 0
  const b = new Date(birthDate)
  const now = new Date()
  return Math.floor((now - b) / (24 * 3600 * 1000))
}

function humanAge(days) {
  if (days < 0) return '未出生'
  if (days === 0) return '今天出生'
  if (days < 30) return `${days}天`
  const months = Math.floor(days / 30)
  const rest = days % 30
  if (months < 12) return `${months}个月${rest > 0 ? rest + '天' : ''}`
  const years = Math.floor(months / 12)
  const restM = months % 12
  return `${years}岁${restM > 0 ? restM + '个月' : ''}`
}

Page({
  data: {
    babyName: '宝宝',
    ageText: '',
    daysText: '',
    lastFeed: null,
    todaySleepMinutes: 0,
    todaySleepText: '',
    quickActions: [
      { type: 'breast', label: '亲喂', icon: '🤱', color: '#FF9EB5' },
      { type: 'feed', label: '奶瓶', icon: '🍼', color: '#FF7B7B' },
      { type: 'pump', label: '泵奶', icon: '💧', color: '#FF9EB5' },
      { type: 'sleep', label: '睡眠', icon: '😴', color: '#9BB5FF' },
      { type: 'diaper', label: '尿布', icon: '👶', color: '#7EDDD6' },
      { type: 'medicine', label: '补剂药品', icon: '💊', color: '#B8A1E6' }
    ],
    todayRecords: [],
    hasProfile: false
  },

  onLoad() {
    this.refresh()
  },

  onShow() {
    this.refresh()
  },

  onPullDownRefresh() {
    this.refresh()
    wx.stopPullDownRefresh()
  },

  refresh() {
    const profile = storage.getProfile()
    const hasProfile = !!profile
    const babyName = profile ? profile.name : '宝宝'
    const birthDate = profile ? profile.birthDate : ''
    const days = getDaysSince(birthDate)

    const today = storage.getToday().sort((a, b) => b.time - a.time)

    // 上次喂养
    const feeds = storage.getAll().filter(r => (r.type === 'feed' || r.type === 'breast' || r.type === 'pump') && r.time).sort((a, b) => b.time - a.time)
    const lastFeed = feeds[0] ? this.decorate(feeds[0]) : null

    // 今日睡眠
    const sleepList = today.filter(r => r.type === 'sleep')
    let sleepMinutes = 0
    sleepList.forEach(r => {
      sleepMinutes += r.duration || 0
    })

    this.setData({
      hasProfile,
      babyName,
      ageText: humanAge(days),
      daysText: birthDate ? `出生第 ${days} 天` : '未设置出生日期',
      lastFeed,
      todaySleepMinutes: sleepMinutes,
      todaySleepText: formatDuration(sleepMinutes),
      todayRecords: today.map(r => this.decorate(r))
    })
  },

  decorate(r) {
    const t = storage.RECORD_TYPES[r.type] || { label: r.type, icon: '📌', color: '#999' }
    let desc = ''
    if (r.type === 'feed') desc = `${r.amount || 0} ml`
    else if (r.type === 'breast') desc = `${r.duration || 0} 分钟`
    else if (r.type === 'pump') desc = `${r.amount || 0} ml`
    else if (r.type === 'sleep') desc = formatDuration(r.duration)
    else if (r.type === 'diaper') desc = r.diaperType === 'poop' ? '大便' : (r.diaperType === 'pee' ? '小便' : '大小便')
    else if (r.type === 'medicine') desc = `${r.name || '补剂'} ${r.amount || ''}`
    if (r.note) desc += (desc ? ' · ' : '') + r.note
    return Object.assign({}, r, {
      typeLabel: t.label,
      icon: t.icon,
      color: t.color,
      timeText: formatTime(r.time),
      desc
    })
  },

  onQuickTap(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/record/record?type=${type}`
    })
  },

  onRecordTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/record/record?id=${id}`
    })
  },

  onAddTap() {
    wx.navigateTo({
      url: '/pages/record/record'
    })
  }
})
