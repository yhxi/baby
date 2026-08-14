const storage = require('../../utils/storage.js')
const app = getApp()

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

function agoText(ms) {
  if (ms < 0) ms = 0
  const min = Math.floor(ms / 60000)
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h > 0) return `${h}小时${m}分`
  return `${m}分钟`
}

function todayTitle() {
  const d = new Date()
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 · 星期${days[d.getDay()]}`
}

function dateValue(d) {
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`
}

Page({
  data: {
    appDark: false,
    babyName: '宝宝',
    avatar: '',
    babies: [],
    activeBabyId: '',
    ageText: '',
    daysText: '',
    lastFeed: null,
    lastFeedAgoText: '',
    lastSleepAgoText: '暂无睡眠记录',
    todaySleepMinutes: 0,
    todaySleepText: '',
    sleepStatusText: '',
    isSleeping: false,
    coreActions: [
      { key: 'feed', label: '喂奶', hint: '默认 150 ml', icon: '🍼', tint: '#E7F5FF' },
      { key: 'sleep', label: '睡眠', hint: '开始记录', icon: '🌙', tint: '#EEF1FF' },
      { key: 'diaper', label: '尿布', hint: '一键记录', icon: '👶', tint: '#E9FAF4' },
      { key: 'photo', label: '拍照', hint: '保存瞬间', icon: '📷', tint: '#FFF5D9' }
    ],
    spaceActions: [
      { key: 'feed', label: '喂养', icon: '🍼', tone: 'gold', left: 0 },
      { key: 'sleep', label: '睡眠', icon: '🌙', tone: 'violet', left: 16.66 },
      { key: 'health', label: '健康', icon: '♥', tone: 'mint', url: '/pages/insights/insights', left: 33.32 },
      { key: 'photo', label: '成长相册', icon: '📷', tone: 'blue', url: '/pages/album/album', left: 49.98 },
      { key: 'vaccine', label: '疫苗接种', icon: '💉', tone: 'violet', url: '/pages/vaccine/vaccine', left: 66.64 },
      { key: 'report', label: '成长报告', icon: '▮▮▮', tone: 'gold', url: '/pages/report/report', left: 83.3 }
    ],
    workspaceNav: [
      { label: '工作台', icon: '🏠', active: true },
      { label: '宝宝状态', icon: '👶', url: '/pages/growth/growth' },
      { label: '医疗', icon: '🏥', url: '/pages/vaccine/vaccine' },
      { label: '阅读', icon: '📖', url: '/pages/nursery/nursery' },
      { label: '成长', icon: '🌱', url: '/pages/growthChart/growthChart' },
      { label: '百宝箱', icon: '🧰', url: '/pages/hub/hub' }
    ],
    featureMenus: [
      { label: '喂奶', icon: '🍼', tint: '#E8F6FF', type: 'feed' },
      { label: '睡眠', icon: '😴', tint: '#EEF0FF', type: 'sleep' },
      { label: '辅食', icon: '🥣', tint: '#E7FBF1', url: '/pages/log/log?category=food' },
      { label: '日记', icon: '📝', tint: '#FFF5D9', url: '/pages/log/log?category=note' },
      { label: '儿歌', icon: '🎵', tint: '#E7F2FF', url: '/pages/nursery/nursery' },
      { label: '发育', icon: '🧸', tint: '#ECF8FF', url: '/pages/log/log?category=milestone' },
      { label: '疫苗', icon: '💉', tint: '#E9F5FF', url: '/pages/vaccine/vaccine' },
      { label: '相册', icon: '📷', tint: '#FFF4DC', url: '/pages/album/album' }
    ],
    calendarText: todayTitle(),
    ageMonths: '--',
    latestWeight: '--',
    latestHeight: '--',
    todayFeedCount: 0,
    todayFeedTotal: 0,
    todayDiaperCount: 0,
    nextActionText: '记录宝宝的每一个小信号',
    sleepStartedAt: 0,
    todayRecords: [],
    latestPhotos: [],
    showSleepSheet: false,
    sleepActive: false,
    sleepStartDate: '',
    sleepStartTime: '',
    sleepEndDate: '',
    sleepEndTime: '',
    hasProfile: false,
    timerReady: false
  },

  onLoad() {
    const info = wx.getSystemInfoSync()
    const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
    const statusBarHeight = info.statusBarHeight || 20
    const navHeight = menu ? menu.bottom + 8 : statusBarHeight + 52
    this.setData({ statusBarHeight, navHeight })
    this.refresh()
  },

  onShow() {
    
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
this.refresh()
    this.startTimer()
  },

  onHide() {
    this.stopTimer()
  },

  onUnload() {
    this.stopTimer()
  },

  startTimer() {
    this.stopTimer()
    this._timer = setInterval(() => {
      this.updateAgo()
    }, 30000)
    this.updateAgo()
  },

  stopTimer() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },

  // 仅刷新"已过去"文案，不重新拉取列表
  updateAgo() {
    const now = Date.now()
    const lastFeed = this.data.lastFeed
    let lastFeedAgoText = ''
    if (lastFeed && lastFeed.time) {
      lastFeedAgoText = '已过去 ' + agoText(now - lastFeed.time)
    }
    const sleeps = storage.getAll().filter(r => r.type === 'sleep' && r.time).sort((a, b) => a.time - b.time)
    let sleepStatusText = '暂无'
    let lastSleepAgoText = '暂无睡眠记录'
    let isSleeping = false
    const activeSleepStartedAt = wx.getStorageSync('babySleepStartedAt') || 0
    if (activeSleepStartedAt) {
      isSleeping = true
      sleepStatusText = '睡眠中 · 已睡 ' + agoText(now - activeSleepStartedAt)
      lastSleepAgoText = '正在睡眠 · 已睡 ' + agoText(now - activeSleepStartedAt)
    }
    const last = sleeps[sleeps.length - 1]
    if (last && !activeSleepStartedAt) {
      const end = last.time + (last.duration || 0) * 60 * 1000
      if (end > now) {
        isSleeping = true
        sleepStatusText = '睡眠中 · 已睡 ' + agoText(now - last.time)
        lastSleepAgoText = '正在睡眠 · 已睡 ' + agoText(now - last.time)
      } else {
        sleepStatusText = '清醒 · 已醒 ' + agoText(now - end)
        lastSleepAgoText = '距上次醒来 ' + agoText(now - end)
      }
    }
    this.setData({ lastFeedAgoText, sleepStatusText, lastSleepAgoText, isSleeping })
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
    const savedPhotos = storage.getPhotos()
    const demoPhotos = [1, 2, 3, 4].map(i => ({ id: 'home-demo-' + i, localPath: `/assets/demo-album/cartoon-${i}.jpg` }))

    // 上次喂养
    const feeds = storage.getAll().filter(r => (r.type === 'feed' || r.type === 'breast' || r.type === 'pump') && r.time).sort((a, b) => b.time - a.time)
    const lastFeed = feeds[0] ? this.decorate(feeds[0]) : null

    // 今日睡眠
    const sleepList = today.filter(r => r.type === 'sleep')
    let sleepMinutes = 0
    sleepList.forEach(r => {
      sleepMinutes += r.duration || 0
    })

    const growth = storage.getByType('growth')
    const latestGrowth = growth[0] || {}
    const ageMonths = birthDate ? Math.max(0, Math.floor(days / 30)) : '--'
    const todayTasks = today.slice(0, 4).map(r => this.decorate(r))
    const todayFeeds = today.filter(r => r.type === 'feed' || r.type === 'breast' || r.type === 'pump')
    const todayFeedTotal = today.filter(r => r.type === 'feed' || r.type === 'pump').reduce((sum, r) => sum + Number(r.amount || 0), 0)
    const todayDiaperCount = today.filter(r => r.type === 'diaper').length
    const sleepStartedAt = wx.getStorageSync('babySleepStartedAt') || 0
    const nextActionText = sleepStartedAt ? `正在睡眠中 · 已睡 ${agoText(Date.now() - sleepStartedAt)}` : (lastFeed ? `距上次喂养 ${agoText(Date.now() - lastFeed.time)}` : '开始记录今天的第一次照护')
    this.setData({
      hasProfile,
      babyName,
      ageText: humanAge(days),
      daysText: birthDate ? `出生第 ${days} 天` : '未设置出生日期',
      lastFeed,
      todaySleepMinutes: sleepMinutes,
      todaySleepText: formatDuration(sleepMinutes),
      todayRecords: today.map(r => this.decorate(r)),
      todayTasks,
      latestPhotos: (savedPhotos.length ? savedPhotos : demoPhotos).slice(0, 4),
      ageMonths,
      latestWeight: latestGrowth.weight || '--',
      latestHeight: latestGrowth.height || '--',
      todayFeedCount: todayFeeds.length,
      todayFeedTotal,
      todayDiaperCount,
      sleepStartedAt,
      nextActionText,
      avatar: (profile && profile.avatar) || '',
      babies: storage.getProfiles().map(p => ({ id: p.id, name: p.name || '宝宝' })),
      activeBabyId: storage.getActiveBabyId()
    })
    this.updateAgo()
  },

  onBabyTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeBabyId) return
    wx.showModal({
      title: '切换宝宝',
      content: '切换后将显示该宝宝的记录',
      success: (res) => { if (res.confirm) getApp().switchBaby(id) }
    })
  },

  onManageBaby() {
    wx.navigateTo({ url: '/pages/family/family' })
  },

  onAvatarTap() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: res => {
        try {
          const savedPath = wx.saveFileSync(res.tempFiles[0].tempFilePath)
          const profile = storage.getProfile()
          storage.updateProfile(storage.getActiveBabyId(), { avatar: savedPath })
          if (profile) getApp().globalData.baby = Object.assign({}, profile, { avatar: savedPath })
          this.setData({ avatar: savedPath })
          wx.showToast({ title: '头像已更新', icon: 'success' })
        } catch (_) { wx.showToast({ title: '头像保存失败', icon: 'none' }) }
      }
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
      desc,
      art: r.type === 'feed' || r.type === 'breast' || r.type === 'pump' ? '🍼' : r.type === 'sleep' ? '😴' : r.type === 'diaper' ? '👶' : r.type === 'medicine' ? '💊' : r.type === 'growth' ? '📏' : r.type === 'vaccine' ? '💉' : r.category === 'food' ? '🥣' : '🪐'
    })
  },

  onQuickTap(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/record/record?type=${type}`
    })
  },

  onCoreAction(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'feed') return this.onQuickTap({ currentTarget: { dataset: { type: 'feed' } } })
    if (key === 'photo') return wx.navigateTo({ url: '/pages/album/album' })
    if (key === 'diaper') {
      storage.addRecord({ type: 'diaper', diaperType: 'pee', time: Date.now() })
      wx.showToast({ title: '已记录小便', icon: 'success' }); return this.refresh()
    }
    this.openSleepSheet()
  },

  openSleepSheet() {
    const now = new Date()
    const started = wx.getStorageSync('babySleepStartedAt') || 0
    const start = started ? new Date(started) : new Date(now.getTime() - 60 * 60 * 1000)
    this.setData({ showSleepSheet: true, sleepActive: !!started, sleepStartDate: dateValue(start), sleepStartTime: formatTime(start), sleepEndDate: dateValue(now), sleepEndTime: formatTime(now) })
  },
  closeSleepSheet() { this.setData({ showSleepSheet: false }) },
  onSleepStartDate(e) { this.setData({ sleepStartDate: e.detail.value }) },
  onSleepStartTime(e) { this.setData({ sleepStartTime: e.detail.value }) },
  onSleepEndDate(e) { this.setData({ sleepEndDate: e.detail.value }) },
  onSleepEndTime(e) { this.setData({ sleepEndTime: e.detail.value }) },
  beginSleep() {
    wx.setStorageSync('babySleepStartedAt', Date.now())
    this.setData({ showSleepSheet: false }); this.refresh()
    wx.showToast({ title: '已开始睡眠计时', icon: 'success' })
  },
  finishSleep() {
    const started = wx.getStorageSync('babySleepStartedAt') || 0
    if (!started) return wx.showToast({ title: '请使用补录睡眠', icon: 'none' })
    const duration = Math.max(1, Math.round((Date.now() - started) / 60000))
    storage.addRecord({ type: 'sleep', time: started, duration })
    wx.removeStorageSync('babySleepStartedAt')
    this.setData({ showSleepSheet: false }); this.refresh()
    wx.showToast({ title: `睡眠已记录 ${formatDuration(duration)}`, icon: 'success' })
  },
  saveManualSleep() {
    const start = new Date(`${this.data.sleepStartDate}T${this.data.sleepStartTime}:00`).getTime()
    const end = new Date(`${this.data.sleepEndDate}T${this.data.sleepEndTime}:00`).getTime()
    if (!start || !end || end <= start) return wx.showToast({ title: '结束时间要晚于开始时间', icon: 'none' })
    const duration = Math.round((end - start) / 60000)
    storage.addRecord({ type: 'sleep', time: start, duration })
    this.setData({ showSleepSheet: false }); this.refresh()
    wx.showToast({ title: `已补录 ${formatDuration(duration)}`, icon: 'success' })
  },

  onSpaceAction(e) {
    const item = e.currentTarget.dataset.item
    if (item.url) return wx.navigateTo({ url: item.url })
    this.onCoreAction({ currentTarget: { dataset: { key: item.key } } })
  },

  onWorkspaceTap(e) {
    const url = e.currentTarget.dataset.url
    if (url) wx.navigateTo({ url })
  },

  onFeatureTap(e) {
    const { type, url } = e.currentTarget.dataset
    if (type) return this.onQuickTap({ currentTarget: { dataset: { type } } })
    if (url) wx.navigateTo({ url })
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
