const storage = require('../../utils/storage.js')
const app = getApp()

function pad(n) { return ('0' + n).slice(-2) }

Page({
  data: {
    
    appDark: false,isEdit: false,
    recordId: '',
    type: 'feed',
    typeConfig: {},
    types: [
      { key: 'breast', label: '亲喂', icon: '🤱' },
      { key: 'feed', label: '奶瓶', icon: '🍼' },
      { key: 'pump', label: '泵奶', icon: '💧' },
      { key: 'sleep', label: '睡眠', icon: '😴' },
      { key: 'diaper', label: '尿布', icon: '👶' },
      { key: 'medicine', label: '补剂药品', icon: '💊' }
    ],
    date: '',
    time: '',
    amount: '150',
    amountOptions: [30, 60, 90, 120, 150, 180, 210, 240],
    duration: '',
    durationHours: '0',
    durationMinutes: '0',
    diaperType: 'pee',
    medicineName: '',
    note: '',
    now: Date.now()
  },

  onLoad(options) {
    
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
const types = this.data.types
    if (options.id) {
      // 编辑
      const all = storage.getAllRaw()
      const rec = all.find(r => r.id === options.id)
      if (rec) {
        const d = new Date(rec.time)
        this.setData({
          isEdit: true,
          recordId: rec.id,
          type: rec.type,
          typeConfig: storage.RECORD_TYPES[rec.type] || {},
          date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
          time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
          amount: rec.amount != null ? String(rec.amount) : '',
          durationMinutes: rec.duration != null ? String(rec.duration) : '0',
          diaperType: rec.diaperType || 'pee',
          medicineName: rec.name || '',
          note: rec.note || ''
        })
        wx.setNavigationBarTitle({ title: '编辑记录' })
      }
    } else if (options.type) {
      this.setData({
        type: options.type,
        typeConfig: storage.RECORD_TYPES[options.type] || {}
      })
    }

    // 默认时间
    if (!this.data.date) {
      const now = new Date()
      this.setData({
        date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
      })
    }
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      type,
      typeConfig: storage.RECORD_TYPES[type] || {},
      amount: (type === 'feed' || type === 'pump') && !this.data.amount ? '150' : this.data.amount
    })
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value })
  },

  onAmountInput(e) {
    this.setData({ amount: e.detail.value })
  },

  onAmountPick(e) {
    this.setData({ amount: String(e.currentTarget.dataset.amount) })
  },

  onDurationInput(e) {
    this.setData({ durationMinutes: e.detail.value })
  },

  onDiaperChange(e) {
    this.setData({ diaperType: e.currentTarget.dataset.value })
  },

  onMedicineInput(e) {
    this.setData({ medicineName: e.detail.value })
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value })
  },

  buildRecord() {
    const d = this.data
    const [y, m, day] = d.date.split('-').map(Number)
    const [hh, mm] = d.time.split(':').map(Number)
    const time = new Date(y, m - 1, day, hh, mm).getTime()

    const rec = {
      type: d.type,
      time
    }
    if (d.type === 'feed' || d.type === 'pump' || d.type === 'medicine') {
      rec.amount = Number(d.amount) || 0
    }
    if (d.type === 'breast' || d.type === 'sleep') {
      rec.duration = Number(d.durationMinutes) || 0
    }
    if (d.type === 'diaper') {
      rec.diaperType = d.diaperType
    }
    if (d.type === 'medicine') {
      rec.name = d.medicineName
    }
    if (d.note) rec.note = d.note
    return rec
  },

  onSave() {
    const rec = this.buildRecord()
    if (this.data.isEdit) {
      const all = storage.getAllRaw()
      const idx = all.findIndex(r => r.id === this.data.recordId)
      if (idx >= 0) {
        all[idx] = Object.assign({}, all[idx], rec)
        storage.saveAll(all)
      }
    } else {
      storage.addRecord(rec)
    }
    wx.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      wx.navigateBack()
    }, 600)
  },

  onDelete() {
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.removeRecord(this.data.recordId)
          wx.navigateBack()
        }
      }
    })
  }
})
