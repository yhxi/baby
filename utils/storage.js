/**
 * 本地存储工具：记录宝宝养育数据
 * 数据类型：feed(喂养) / sleep(睡眠) / diaper(尿布) / medicine(补剂药品) / pump(泵奶)
 */

const STORAGE_KEY = 'babyRecords'
const PROFILE_KEY = 'babyProfile'

// 记录类型配置
const RECORD_TYPES = {
  feed: {
    key: 'feed',
    label: '喂养',
    icon: '🍼',
    color: '#FF7B7B',
    light: '#FFF0F0',
    unit: 'ml'
  },
  breast: {
    key: 'breast',
    label: '亲喂',
    icon: '🤱',
    color: '#FF9EB5',
    light: '#FFF0F4',
    unit: 'min'
  },
  pump: {
    key: 'pump',
    label: '泵奶',
    icon: '💧',
    color: '#FF9EB5',
    light: '#FFF0F4',
    unit: 'ml'
  },
  sleep: {
    key: 'sleep',
    label: '睡眠',
    icon: '😴',
    color: '#9BB5FF',
    light: '#F0F4FF',
    unit: 'min'
  },
  diaper: {
    key: 'diaper',
    label: '尿布',
    icon: '👶',
    color: '#7EDDD6',
    light: '#E8FAF8',
    unit: ''
  },
  medicine: {
    key: 'medicine',
    label: '补剂药品',
    icon: '💊',
    color: '#B8A1E6',
    light: '#F5F0FF',
    unit: 'ml'
  }
}

function getAll() {
  return wx.getStorageSync(STORAGE_KEY) || []
}

function saveAll(list) {
  wx.setStorageSync(STORAGE_KEY, list)
}

function addRecord(record) {
  const list = getAll()
  const item = Object.assign({
    id: 'r_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    createdAt: Date.now()
  }, record)
  list.push(item)
  saveAll(list)
  return item
}

function removeRecord(id) {
  const list = getAll().filter(r => r.id !== id)
  saveAll(list)
  return list
}

function getByDate(dateStr) {
  return getAll().filter(r => {
    const d = new Date(r.time)
    const y = d.getFullYear()
    const m = ('0' + (d.getMonth() + 1)).slice(-2)
    const day = ('0' + d.getDate()).slice(-2)
    return `${y}-${m}-${day}` === dateStr
  })
}

function getToday() {
  const now = new Date()
  const y = now.getFullYear()
  const m = ('0' + (now.getMonth() + 1)).slice(-2)
  const day = ('0' + now.getDate()).slice(-2)
  return getByDate(`${y}-${m}-${day}`)
}

function getProfile() {
  return wx.getStorageSync(PROFILE_KEY) || null
}

function saveProfile(profile) {
  wx.setStorageSync(PROFILE_KEY, profile)
  return profile
}

module.exports = {
  RECORD_TYPES,
  getAll,
  saveAll,
  addRecord,
  removeRecord,
  getByDate,
  getToday,
  getProfile,
  saveProfile
}
