const storage = require('../../utils/storage.js')
const cloud = require('../../utils/cloudSync.js')

function day(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

Page({
  data: { photos: [], uploading: false, countText: '0 张珍藏', tabs: ['全部', '本月', '里程碑'], tab: '全部' },
  onShow() { this.refresh(); this.pullCloud() },
  refresh() {
    const photos = storage.getPhotos().map(p => Object.assign({}, p, { dateText: day(p.createdAt) }))
    this.setData({ photos, countText: `${photos.length} 张珍藏` })
  },
  onTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }) },
  choosePhotos() {
    if (this.data.uploading) return
    wx.chooseMedia({ count: 9, mediaType: ['image'], sizeType: ['compressed'], success: res => this.saveSelected(res.tempFiles) })
  },
  saveSelected(files) {
    const babyId = storage.getActiveBabyId()
    const jobs = files.map(file => {
      let local = file.tempFilePath
      try { wx.compressImage({ src: local, quality: 70, success: r => { local = r.tempFilePath } }) } catch (_) {}
      const saved = wx.saveFileSync(local)
      const photo = storage.addPhoto({ localPath: saved, status: 'uploading' })
      return cloud.uploadPhoto(babyId, saved, 'image/jpeg').then(r => storage.updatePhoto(photo.id, { remoteId: r.photo.id, status: 'synced' })).catch(() => storage.updatePhoto(photo.id, { status: 'local' }))
    })
    this.setData({ uploading: true }); this.refresh()
    Promise.all(jobs).then(() => { this.setData({ uploading: false }); this.refresh(); wx.showToast({ title: '照片已保存', icon: 'success' }) })
  },
  pullCloud() {
    const babyId = storage.getActiveBabyId()
    cloud.listPhotos(babyId).then(r => {
      const local = storage.getPhotos(babyId)
      r.photos.forEach(remote => {
        if (local.some(p => p.remoteId === remote.id)) return
        storage.addPhoto({ remoteId: remote.id, status: 'cloud', createdAt: remote.createdAt })
      })
      this.refresh()
    }).catch(() => {})
  },
  preview(e) {
    const photo = e.currentTarget.dataset.photo
    if (photo.localPath) return wx.previewImage({ current: photo.localPath, urls: this.data.photos.filter(p => p.localPath).map(p => p.localPath) })
    if (!photo.remoteId) return
    wx.showLoading({ title: '加载照片' })
    cloud.downloadPhoto(photo.remoteId).then(path => { storage.updatePhoto(photo.id, { localPath: path, status: 'synced' }); this.refresh(); wx.previewImage({ current: path, urls: [path] }) }).catch(() => wx.showToast({ title: '照片加载失败', icon: 'none' })).finally(() => wx.hideLoading())
  },
  deletePhoto(e) {
    const photo = e.currentTarget.dataset.photo
    wx.showModal({ title: '移除照片', content: '仅移除本机相册显示，云端原片仍保留。', success: r => { if (r.confirm) { storage.removePhoto(photo.id); this.refresh() } } })
  }
})
