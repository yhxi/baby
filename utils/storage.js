/**
 * 本地存储工具：记录宝宝养育数据（支持多宝宝）
 * 数据类型：feed(喂养) / sleep(睡眠) / diaper(尿布) / medicine(补剂药品) / pump(泵奶) / growth(生长) / vaccine(疫苗) / log(通用生活记录)
 *
 * 存储结构：
 *   babyProfiles   : 宝宝档案数组，每项 { id, name, birthDate, gender, avatar }
 *   activeBabyId   : 当前选中的宝宝 id
 *   babyRecords    : 全部记录数组，每条记录带 babyId
 *   nurseryFavs    : 儿歌收藏 id 数组
 *   theme          : 'light' | 'dark'
 *   cloudEnv       : 云开发环境 id（可空）
 */

const STORAGE_KEY = 'babyRecords'
const PROFILES_KEY = 'babyProfiles'
const ACTIVE_KEY = 'activeBabyId'
const FAVS_KEY = 'nurseryFavs'
const THEME_KEY = 'theme'
const CLOUD_ENV_KEY = 'cloudEnv'
const PHOTOS_KEY = 'babyPhotos'

function uid(prefix) {
  return prefix + Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36)
}

// ---------- 多宝宝档案与迁移 ----------
function migrate() {
  let profiles = wx.getStorageSync(PROFILES_KEY)
  if (Array.isArray(profiles) && profiles.length) return
  profiles = []
  const oldProfile = wx.getStorageSync('babyProfile')
  const oldRecords = wx.getStorageSync('babyRecords') || []
  let id = uid('b_')
  if (oldProfile) {
    id = oldProfile.id || id
    profiles.push(Object.assign({ id, name: '宝宝', birthDate: '', gender: 'unknown' }, oldProfile))
    wx.removeStorageSync('babyProfile')
  } else {
    profiles.push({ id, name: '宝宝', birthDate: '', gender: 'unknown' })
  }
  wx.setStorageSync(PROFILES_KEY, profiles)
  wx.setStorageSync(ACTIVE_KEY, id)
  // 给旧记录补上 babyId
  if (Array.isArray(oldRecords) && oldRecords.length) {
    const tagged = oldRecords.map(r => (r.babyId ? r : Object.assign({}, r, { babyId: id })))
    wx.setStorageSync(STORAGE_KEY, tagged)
  }
}

function getProfiles() {
  migrate()
  return wx.getStorageSync(PROFILES_KEY) || []
}

function getActiveBabyId() {
  migrate()
  const profiles = wx.getStorageSync(PROFILES_KEY) || []
  if (!profiles.length) return null
  let active = wx.getStorageSync(ACTIVE_KEY)
  if (!active || !profiles.some(p => p.id === active)) {
    active = profiles[0].id
    wx.setStorageSync(ACTIVE_KEY, active)
  }
  return active
}

function getActiveProfile() {
  const id = getActiveBabyId()
  const profiles = getProfiles()
  return profiles.find(p => p.id === id) || null
}

function setActiveBaby(id) {
  const profiles = getProfiles()
  if (profiles.some(p => p.id === id)) {
    wx.setStorageSync(ACTIVE_KEY, id)
    return true
  }
  return false
}

function addProfile(profile) {
  const profiles = getProfiles()
  const item = Object.assign({
    id: uid('b_'),
    name: '宝宝',
    birthDate: '',
    gender: 'unknown'
  }, profile)
  profiles.push(item)
  wx.setStorageSync(PROFILES_KEY, profiles)
  return item
}

function updateProfile(id, updates) {
  const profiles = getProfiles()
  const idx = profiles.findIndex(p => p.id === id)
  if (idx >= 0) {
    profiles[idx] = Object.assign({}, profiles[idx], updates)
    wx.setStorageSync(PROFILES_KEY, profiles)
    return profiles[idx]
  }
  return null
}

function removeProfile(id) {
  let profiles = getProfiles()
  profiles = profiles.filter(p => p.id !== id)
  if (!profiles.length) {
    profiles = [{ id: uid('b_'), name: '宝宝', birthDate: '', gender: 'unknown' }]
  }
  wx.setStorageSync(PROFILES_KEY, profiles)
  if (wx.getStorageSync(ACTIVE_KEY) === id) {
    wx.setStorageSync(ACTIVE_KEY, profiles[0].id)
  }
  // 删除该宝宝的所有记录
  const records = (wx.getStorageSync(STORAGE_KEY) || []).filter(r => r.babyId !== id)
  wx.setStorageSync(STORAGE_KEY, records)
  return profiles
}

// ---------- 记录（按当前宝宝隔离） ----------
function getAllRaw() {
  return wx.getStorageSync(STORAGE_KEY) || []
}

function getAll() {
  const id = getActiveBabyId()
  return getAllRaw().filter(r => r.babyId === id)
}

function saveAll(list) {
  wx.setStorageSync(STORAGE_KEY, list)
}

function addRecord(record) {
  const list = getAllRaw()
  const item = Object.assign({
    id: uid('r_'),
    babyId: getActiveBabyId(),
    createdAt: Date.now()
  }, record)
  list.push(item)
  saveAll(list)
  return item
}

function removeRecord(id) {
  const list = getAllRaw().filter(r => r.id !== id)
  saveAll(list)
  return list
}

function updateRecord(id, updates) {
  const list = getAllRaw()
  const idx = list.findIndex(r => r.id === id)
  if (idx >= 0) {
    list[idx] = Object.assign({}, list[idx], updates, { updatedAt: Date.now() })
    saveAll(list)
    return list[idx]
  }
  return null
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

function getByType(type) {
  return getAll().filter(r => r.type === type).sort((a, b) => b.time - a.time)
}

// ---------- 档案（兼容旧调用） ----------
function getProfile() {
  return getActiveProfile()
}

function saveProfile(profile) {
  const id = getActiveBabyId()
  return updateProfile(id, profile)
}

// ---------- 儿歌收藏 ----------
function getFavs() {
  return wx.getStorageSync(FAVS_KEY) || []
}

function toggleFav(id) {
  const favs = getFavs()
  const i = favs.indexOf(id)
  if (i >= 0) favs.splice(i, 1)
  else favs.push(id)
  wx.setStorageSync(FAVS_KEY, favs)
  return favs
}

// ---------- 主题 ----------
function getTheme() {
  return wx.getStorageSync(THEME_KEY) || 'light'
}

function setTheme(mode) {
  wx.setStorageSync(THEME_KEY, mode === 'dark' ? 'dark' : 'light')
}

// ---------- 云环境 ----------
function getCloudEnv() {
  return wx.getStorageSync(CLOUD_ENV_KEY) || ''
}

function setCloudEnv(env) {
  wx.setStorageSync(CLOUD_ENV_KEY, env || '')
}

// ---------- 成长相册（本地优先，云端 id 由相册页回填） ----------
function getPhotos(babyId) {
  const id = babyId || getActiveBabyId()
  return (wx.getStorageSync(PHOTOS_KEY) || []).filter(p => p.babyId === id).sort((a, b) => b.createdAt - a.createdAt)
}

function savePhotos(list) {
  wx.setStorageSync(PHOTOS_KEY, list)
}

function addPhoto(photo) {
  const all = wx.getStorageSync(PHOTOS_KEY) || []
  const item = Object.assign({ id: uid('p_'), babyId: getActiveBabyId(), createdAt: Date.now(), status: 'local' }, photo)
  all.push(item); savePhotos(all); return item
}

function updatePhoto(id, updates) {
  const all = wx.getStorageSync(PHOTOS_KEY) || []; const index = all.findIndex(p => p.id === id)
  if (index >= 0) { all[index] = Object.assign({}, all[index], updates); savePhotos(all); return all[index] }
  return null
}

function removePhoto(id) {
  const all = (wx.getStorageSync(PHOTOS_KEY) || []).filter(p => p.id !== id); savePhotos(all); return all
}

// ---------- 导出完整数据包 ----------
function exportPackage() {
  return {
    app: 'baby-care',
    version: 2,
    exportedAt: Date.now(),
    profiles: getProfiles(),
    activeBabyId: getActiveBabyId(),
    records: getAllRaw(),
    favs: getFavs(),
    theme: getTheme(),
    cloudEnv: getCloudEnv()
    ,photos: wx.getStorageSync(PHOTOS_KEY) || []
  }
}

function importPackage(pkg) {
  if (!pkg || !Array.isArray(pkg.profiles)) return false
  wx.setStorageSync(PROFILES_KEY, pkg.profiles)
  if (pkg.activeBabyId) wx.setStorageSync(ACTIVE_KEY, pkg.activeBabyId)
  if (Array.isArray(pkg.records)) wx.setStorageSync(STORAGE_KEY, pkg.records)
  if (Array.isArray(pkg.favs)) wx.setStorageSync(FAVS_KEY, pkg.favs)
  if (pkg.theme) wx.setStorageSync(THEME_KEY, pkg.theme)
  if (pkg.cloudEnv) wx.setStorageSync(CLOUD_ENV_KEY, pkg.cloudEnv)
  if (Array.isArray(pkg.photos)) wx.setStorageSync(PHOTOS_KEY, pkg.photos)
  return true
}

const RECORD_TYPES = {
  feed: { key: 'feed', label: '喂养', icon: '🍼', color: '#FF7B7B', light: '#FFF0F0', unit: 'ml' },
  breast: { key: 'breast', label: '亲喂', icon: '🤱', color: '#FF9EB5', light: '#FFF0F4', unit: 'min' },
  pump: { key: 'pump', label: '泵奶', icon: '💧', color: '#FF9EB5', light: '#FFF0F4', unit: 'ml' },
  sleep: { key: 'sleep', label: '睡眠', icon: '😴', color: '#9BB5FF', light: '#F0F4FF', unit: 'min' },
  diaper: { key: 'diaper', label: '尿布', icon: '👶', color: '#7EDDD6', light: '#E8FAF8', unit: '' },
  medicine: { key: 'medicine', label: '补剂药品', icon: '💊', color: '#B8A1E6', light: '#F5F0FF', unit: 'ml' },
  growth: { key: 'growth', label: '生长记录', icon: '📏', color: '#FFC107', light: '#FFF8E1', unit: '' },
  vaccine: { key: 'vaccine', label: '疫苗', icon: '💉', color: '#4CAF50', light: '#E8F5E9', unit: '' },
  log: { key: 'log', label: '记录', icon: '📝', color: '#9E9E9E', light: '#F5F5F5', unit: '' }
}

module.exports = {
  RECORD_TYPES,
  // 多宝宝
  getProfiles,
  getActiveBabyId,
  getActiveProfile,
  setActiveBaby,
  addProfile,
  updateProfile,
  removeProfile,
  // 记录
  getAll,
  getAllRaw,
  saveAll,
  addRecord,
  removeRecord,
  getByDate,
  getToday,
  getByType,
  updateRecord,
  // 档案（兼容）
  getProfile,
  saveProfile,
  // 收藏
  getFavs,
  toggleFav,
  // 主题
  getTheme,
  setTheme,
  // 云
  getCloudEnv,
  setCloudEnv,
  // 相册
  getPhotos,
  addPhoto,
  updatePhoto,
  removePhoto,
  // 备份
  exportPackage,
  importPackage
}
