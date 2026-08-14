const storage = require('./storage.js')

// The app remains fully usable offline. This module is deliberately small and
// failure-tolerant: a failed network call only leaves the local queue intact.
const API = 'https://baby.20350720.xyz:8888/api/v1'
const TOKEN_KEY = 'babyApiToken'
const SYNC_KEY = 'babyApiSyncTimes'

function request(path, method, data, token) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: API + path,
      method,
      data,
      timeout: 15000,
      header: Object.assign({ 'content-type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
      success: res => res.statusCode >= 200 && res.statusCode < 300 ? resolve(res.data) : reject(new Error((res.data && res.data.error) || '网络请求失败')),
      fail: reject
    })
  })
}

function login() {
  const saved = wx.getStorageSync(TOKEN_KEY)
  if (saved) return Promise.resolve(saved)
  return new Promise((resolve, reject) => wx.login({ success: r => r.code ? resolve(r.code) : reject(new Error('微信登录失败')), fail: reject }))
    .then(code => request('/auth/wechat-login', 'POST', { code }))
    .then(res => { wx.setStorageSync(TOKEN_KEY, res.token); return res.token })
}

function mergeRemote(records) {
  const all = storage.getAllRaw()
  const byId = {}; all.forEach(r => { byId[r.id] = r })
  ;(records || []).forEach(remote => {
    if (remote.deletedAt) { delete byId[remote.id]; return }
    const local = byId[remote.id]
    if (!local || Number(remote.updatedAt || remote.createdAt || 0) >= Number(local.updatedAt || local.createdAt || 0)) byId[remote.id] = remote
  })
  storage.saveAll(Object.keys(byId).map(id => byId[id]))
}

function sync() {
  return login().then(token => {
    const profiles = storage.getProfiles()
    const all = storage.getAllRaw()
    const stamps = wx.getStorageSync(SYNC_KEY) || {}
    return profiles.reduce((chain, profile) => chain.then(() => request('/babies/' + encodeURIComponent(profile.id), 'PUT', profile, token)
      .then(() => request('/babies/' + encodeURIComponent(profile.id) + '/sync', 'POST', {
        after: stamps[profile.id] || 0,
        changes: all.filter(r => r.babyId === profile.id)
      }, token))
      .then(result => { mergeRemote(result.records); stamps[profile.id] = result.serverTime; wx.setStorageSync(SYNC_KEY, stamps) })), Promise.resolve())
  })
}

function listPhotos(babyId) {
  return login().then(token => request('/babies/' + encodeURIComponent(babyId) + '/photos', 'GET', null, token))
}

function uploadPhoto(babyId, filePath, mimeType) {
  return login().then(token => {
    const data = wx.getFileSystemManager().readFileSync(filePath, 'base64')
    return request('/babies/' + encodeURIComponent(babyId) + '/photos', 'POST', {
      data,
      mimeType: mimeType || 'image/jpeg'
    }, token)
  })
}

function downloadPhoto(photoId) {
  return login().then(token => new Promise((resolve, reject) => {
    wx.downloadFile({
      url: API + '/photos/' + encodeURIComponent(photoId),
      header: { Authorization: 'Bearer ' + token },
      success: res => res.statusCode === 200 ? resolve(res.tempFilePath) : reject(new Error('图片下载失败')),
      fail: reject
    })
  }))
}

module.exports = { sync, listPhotos, uploadPhoto, downloadPhoto }
