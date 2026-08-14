const storage = require('../../utils/storage.js')
const cloud = require('../../utils/cloudSync.js')

function day(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

Page({
  data: { photos: [], displayPhotos: [], uploading: false, countText: '0 张珍藏', tabs: ['全部', '本月', '里程碑'], tab: '全部', demoPhotos: [
    { id: 'demo-1', localPath: '/assets/demo-album/cartoon-1.jpg', dateText: '示例照片', demo: true },
    { id: 'demo-2', localPath: '/assets/demo-album/cartoon-2.jpg', dateText: '示例照片', demo: true },
    { id: 'demo-3', localPath: '/assets/demo-album/cartoon-3.jpg', dateText: '示例照片', demo: true },
    { id: 'demo-4', localPath: '/assets/demo-album/cartoon-4.jpg', dateText: '示例照片', demo: true }
  ] },
  onShow() { this.refresh(); this.pullCloud() },
  refresh() {
    const photos = storage.getPhotos().map(p => Object.assign({}, p, { dateText: day(p.createdAt) }))
    this.setData({ photos, displayPhotos: photos.length ? photos : this.data.demoPhotos, countText: photos.length ? `${photos.length} 张珍藏` : '4 张示例珍藏' })
  },
  onTab(e) { this.setData({ tab: e.currentTarget.dataset.tab }) },
  choosePhotos() {
    if (this.data.uploading) return
    wx.chooseImage({ count: 9, sizeType: ['compressed'], sourceType: ['album', 'camera'], success: res => this.saveSelected(res.tempFilePaths) })
  },
  async saveSelected(files) {
    const babyId = storage.getActiveBabyId()
    this.setData({ uploading: true })
    try {
      for (const source of files) {
        const compressed = await new Promise((resolve, reject) => wx.compressImage({ src: source, quality: 55, success: r => resolve(r.tempFilePath), fail: reject }))
        const saved = wx.saveFileSync(compressed)
        const photo = storage.addPhoto({ localPath: saved, status: 'uploading' })
        this.refresh()
        try {
          const result = await cloud.uploadPhoto(babyId, saved, 'image/jpeg')
          storage.updatePhoto(photo.id, { remoteId: result.photo.id, status: 'synced' })
        } catch (_) {
          // 私密云端临时不可用时，照片仍然保留在本机相册。
          storage.updatePhoto(photo.id, { status: 'local' })
        }
      }
      wx.showToast({ title: '照片已保存', icon: 'success' })
    } catch (_) {
      wx.showToast({ title: '照片处理失败，请换一张重试', icon: 'none' })
    } finally {
      this.setData({ uploading: false }); this.refresh()
    }
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
    if (photo.localPath) return wx.previewImage({ current: photo.localPath, urls: this.data.displayPhotos.filter(p => p.localPath).map(p => p.localPath) })
    if (!photo.remoteId) return
    wx.showLoading({ title: '加载照片' })
    cloud.downloadPhoto(photo.remoteId).then(path => { storage.updatePhoto(photo.id, { localPath: path, status: 'synced' }); this.refresh(); wx.previewImage({ current: path, urls: [path] }) }).catch(() => wx.showToast({ title: '照片加载失败', icon: 'none' })).finally(() => wx.hideLoading())
  },
  deletePhoto(e) {
    const photo = e.currentTarget.dataset.photo
    if (photo.demo) return wx.showToast({ title: '上传真实照片后，示例会自动隐藏', icon: 'none' })
    wx.showModal({ title: '移除照片', content: '仅移除本机相册显示，云端原片仍保留。', success: r => { if (r.confirm) { storage.removePhoto(photo.id); this.refresh() } } })
  }
})
