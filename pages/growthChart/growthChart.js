const storage = require('../../utils/storage.js')
const gs = require('../../utils/growthStandard.js')
const app = getApp()

const METRICS = [
  { key: 'height', label: '身高', unit: 'cm' },
  { key: 'weight', label: '体重', unit: 'kg' },
  { key: 'headCircumference', label: '头围', unit: 'cm' }
]

Page({
  data: {
    
    appDark: false,metrics: METRICS,
    metric: 'height',
    profile: null,
    latest: null,
    latestLabel: '',
    latestUnit: '',
    latestEval: null
  },

  onLoad() {
    this.setData({ profile: storage.getProfile() || { gender: 'unknown', name: '宝宝' } })
  },

  onShow() {
    
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
this.refresh()
  },

  onReady() {
    this.draw()
  },

  refresh() {
    const profile = storage.getProfile() || { gender: 'unknown', name: '宝宝' }
    this.setData({ profile })
    this.updateLatest()
    this.draw()
  },

  updateLatest() {
    const records = storage.getByType('growth')
    const key = this.data.metric
    const metricMeta = METRICS.find(m => m.key === key) || { label: '', unit: '' }
    const latest = records.find(r => r[key] > 0)
    let latestEval = null
    if (latest) {
      const months = gs.getAgeInMonths(this.data.profile.birthDate, latest.time)
      const ref = gs.getReference(this.data.profile.gender, key, months)
      latestEval = gs.evaluate(latest[key], ref)
      latestEval.months = months.toFixed(1)
    }
    this.setData({
      latest,
      latestEval,
      latestLabel: metricMeta.label,
      latestUnit: metricMeta.unit
    })
  },

  onMetricChange(e) {
    const metric = e.currentTarget.dataset.key
    this.setData({ metric }, () => {
      this.updateLatest()
      this.draw()
    })
  },

  draw() {
    const query = wx.createSelectorQuery().in(this)
    query.select('#growthCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0] || !res[0].node) return
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      const width = res[0].width
      const height = res[0].height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)

      ctx.clearRect(0, 0, width, height)

      const padding = { top: 30, right: 30, bottom: 40, left: 44 }
      const chartW = width - padding.left - padding.right
      const chartH = height - padding.top - padding.bottom

      const gender = this.data.profile.gender
      const metric = this.data.metric
      const curve = gs.getCurveData(gender, metric)
      const fixedRecords = storage.getByType('growth')
        .filter(r => r[metric] > 0)
        .sort((a, b) => a.time - b.time)
        .map(r => ({
          months: gs.getAgeInMonths(this.data.profile.birthDate, r.time),
          value: r[metric]
        }))

      // 计算 min/max
      let minVal = curve[0].p3
      let maxVal = curve[curve.length - 1].p97
      fixedRecords.forEach(r => {
        minVal = Math.min(minVal, r.value)
        maxVal = Math.max(maxVal, r.value)
      })
      const valRange = maxVal - minVal || 1
      minVal -= valRange * 0.1
      maxVal += valRange * 0.1

      const xFor = (m) => padding.left + (m / 24) * chartW
      const yFor = (v) => padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH

      // 网格
      ctx.strokeStyle = '#f0e6e2'
      ctx.lineWidth = 1
      for (let m = 0; m <= 24; m += 6) {
        const x = xFor(m)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, padding.top + chartH)
        ctx.stroke()
      }
      for (let i = 0; i <= 4; i++) {
        const v = minVal + (maxVal - minVal) * (i / 4)
        const y = yFor(v)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(padding.left + chartW, y)
        ctx.stroke()
      }

      // X 轴标签
      ctx.fillStyle = '#999'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      for (let m = 0; m <= 24; m += 6) {
        ctx.fillText(m + '月', xFor(m), padding.top + chartH + 18)
      }

      // Y 轴标签
      ctx.textAlign = 'right'
      for (let i = 0; i <= 4; i++) {
        const v = minVal + (maxVal - minVal) * (i / 4)
        ctx.fillText(v.toFixed(1), padding.left - 6, yFor(v) + 3)
      }

      // 绘制参考线 P3 P50 P97
      const drawLine = (field, color) => {
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        curve.forEach((p, i) => {
          const x = xFor(p.m)
          const y = yFor(p[field])
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
      }
      drawLine('p3', '#FF5252')
      drawLine('p50', '#66BB6A')
      drawLine('p97', '#42A5F5')

      // 宝宝数据点
      if (fixedRecords.length) {
        ctx.fillStyle = '#FF7B7B'
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        fixedRecords.forEach(r => {
          const x = xFor(r.months)
          const y = yFor(r.value)
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        })
        // 连线
        ctx.strokeStyle = '#FF7B7B'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        fixedRecords.forEach((r, i) => {
          const x = xFor(r.months)
          const y = yFor(r.value)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()
        ctx.setLineDash([])
      }

      // 图例
      const legends = [
        { label: 'P3（下沿）', color: '#FF5252' },
        { label: 'P50（中位）', color: '#66BB6A' },
        { label: 'P97（上沿）', color: '#42A5F5' },
        { label: '宝宝', color: '#FF7B7B' }
      ]
      ctx.textAlign = 'left'
      legends.forEach((l, i) => {
        const x = padding.left + i * 70
        const y = 18
        ctx.fillStyle = l.color
        ctx.fillRect(x, y - 6, 10, 10)
        ctx.fillStyle = '#666'
        ctx.fillText(l.label, x + 14, y + 3)
      })
    })
  }
})
