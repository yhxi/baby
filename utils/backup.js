/**
 * 数据备份与恢复
 * - 本地：导出完整数据包为 JSON 文件，恢复时从聊天文件选择导入
 * - 云端：微信云开发数据库（需用户在「家庭」填入云环境 ID 并开通云开发）
 */

const storage = require('./storage.js')

function exportToFile() {
  const pkg = storage.exportPackage()
  const json = JSON.stringify(pkg)
  const fs = wx.getFileSystemManager()
  const path = `${wx.env.USER_DATA_PATH}/baby-backup-${Date.now()}.json`
  fs.writeFileSync(path, json, 'utf8')
  return path
}

function importFromString(json) {
  let pkg
  try {
    pkg = JSON.parse(json)
  } catch (e) {
    return false
  }
  return storage.importPackage(pkg)
}

// ---------- 云端（微信云开发） ----------
function ensureCloud() {
  if (typeof wx === 'undefined' || !wx.cloud) return null
  const env = storage.getCloudEnv()
  if (!env) return null
  try {
    wx.cloud.init({ env, traceUser: true })
    return wx.cloud
  } catch (e) {
    return null
  }
}

function cloudBackup() {
  const cloud = ensureCloud()
  if (!cloud) return Promise.reject(new Error('NO_CLOUD'))
  const db = cloud.database()
  const pkg = storage.exportPackage()
  return db.collection('baby_backup').doc('main').set({
    data: Object.assign({ _id: 'main', updatedAt: Date.now() }, pkg)
  })
}

function cloudRestore() {
  const cloud = ensureCloud()
  if (!cloud) return Promise.reject(new Error('NO_CLOUD'))
  const db = cloud.database()
  return db.collection('baby_backup').doc('main').get().then((res) => {
    const d = res.data || {}
    delete d._id
    delete d._openid
    delete d.updatedAt
    const ok = storage.importPackage(d)
    return ok
  })
}

module.exports = {
  exportToFile,
  importFromString,
  cloudBackup,
  cloudRestore,
  ensureCloud
}
