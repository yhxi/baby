/**
 * WHO 儿童生长标准参考数据（近似值，0-24个月）
 * 提供 P3 / P50 / P97 三个百分位，按性别区分
 * 单位：身高 cm、体重 kg、头围 cm
 */

const DATA = {
  boy: {
    height: [
      { m: 0, p3: 46.3, p50: 49.9, p97: 53.4 },
      { m: 1, p3: 50.7, p50: 54.7, p97: 58.6 },
      { m: 2, p3: 54.4, p50: 58.4, p97: 62.4 },
      { m: 3, p3: 57.3, p50: 61.4, p97: 65.5 },
      { m: 4, p3: 59.7, p50: 63.9, p97: 68.0 },
      { m: 5, p3: 61.7, p50: 65.9, p97: 70.1 },
      { m: 6, p3: 63.4, p50: 68.0, p97: 72.6 },
      { m: 7, p3: 65.1, p50: 69.8, p97: 74.5 },
      { m: 8, p3: 66.5, p50: 71.3, p97: 76.2 },
      { m: 9, p3: 68.0, p50: 73.2, p97: 78.4 },
      { m: 10, p3: 69.4, p50: 74.7, p97: 80.0 },
      { m: 11, p3: 70.7, p50: 76.1, p97: 81.5 },
      { m: 12, p3: 72.0, p50: 77.5, p97: 83.1 },
      { m: 15, p3: 75.2, p50: 81.0, p97: 86.8 },
      { m: 18, p3: 78.0, p50: 84.0, p97: 90.0 },
      { m: 21, p3: 80.5, p50: 86.8, p97: 93.1 },
      { m: 24, p3: 82.8, p50: 89.2, p97: 95.7 }
    ],
    weight: [
      { m: 0, p3: 2.5, p50: 3.3, p97: 4.3 },
      { m: 1, p3: 3.4, p50: 4.5, p97: 5.7 },
      { m: 2, p3: 4.3, p50: 5.6, p97: 7.1 },
      { m: 3, p3: 5.0, p50: 6.4, p97: 8.0 },
      { m: 4, p3: 5.6, p50: 7.0, p97: 8.7 },
      { m: 5, p3: 6.0, p50: 7.5, p97: 9.3 },
      { m: 6, p3: 6.4, p50: 8.0, p97: 9.9 },
      { m: 7, p3: 6.7, p50: 8.3, p97: 10.3 },
      { m: 8, p3: 7.0, p50: 8.6, p97: 10.7 },
      { m: 9, p3: 7.2, p50: 8.9, p97: 11.0 },
      { m: 10, p3: 7.5, p50: 9.2, p97: 11.4 },
      { m: 11, p3: 7.7, p50: 9.4, p97: 11.7 },
      { m: 12, p3: 7.9, p50: 9.6, p97: 12.0 },
      { m: 15, p3: 8.4, p50: 10.3, p97: 12.9 },
      { m: 18, p3: 8.9, p50: 11.0, p97: 13.9 },
      { m: 21, p3: 9.3, p50: 11.5, p97: 14.7 },
      { m: 24, p3: 9.7, p50: 12.1, p97: 15.5 }
    ],
    headCircumference: [
      { m: 0, p3: 32.1, p50: 34.5, p97: 36.9 },
      { m: 1, p3: 34.5, p50: 37.0, p97: 39.5 },
      { m: 2, p3: 36.0, p50: 38.5, p97: 41.0 },
      { m: 3, p3: 37.2, p50: 39.8, p97: 42.4 },
      { m: 6, p3: 39.7, p50: 42.3, p97: 44.9 },
      { m: 9, p3: 41.2, p50: 43.8, p97: 46.4 },
      { m: 12, p3: 42.2, p50: 44.8, p97: 47.4 },
      { m: 18, p3: 43.4, p50: 46.0, p97: 48.6 },
      { m: 24, p3: 44.2, p50: 46.8, p97: 49.4 }
    ]
  },
  girl: {
    height: [
      { m: 0, p3: 45.6, p50: 49.1, p97: 52.7 },
      { m: 1, p3: 49.8, p50: 53.7, p97: 57.6 },
      { m: 2, p3: 53.2, p50: 57.1, p97: 61.1 },
      { m: 3, p3: 56.0, p50: 59.8, p97: 63.8 },
      { m: 4, p3: 58.0, p50: 62.1, p97: 66.2 },
      { m: 5, p3: 60.0, p50: 64.0, p97: 68.0 },
      { m: 6, p3: 62.0, p50: 66.0, p97: 70.0 },
      { m: 7, p3: 63.5, p50: 67.7, p97: 71.8 },
      { m: 8, p3: 65.0, p50: 69.2, p97: 73.4 },
      { m: 9, p3: 66.4, p50: 70.7, p97: 75.0 },
      { m: 10, p3: 67.7, p50: 72.0, p97: 76.4 },
      { m: 11, p3: 69.0, p50: 73.3, p97: 77.7 },
      { m: 12, p3: 70.2, p50: 74.5, p97: 79.0 },
      { m: 15, p3: 73.3, p50: 77.8, p97: 82.5 },
      { m: 18, p3: 76.0, p50: 80.7, p97: 85.6 },
      { m: 21, p3: 78.3, p50: 83.2, p97: 88.4 },
      { m: 24, p3: 80.5, p50: 85.7, p97: 91.0 }
    ],
    weight: [
      { m: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
      { m: 1, p3: 3.2, p50: 4.2, p97: 5.5 },
      { m: 2, p3: 4.0, p50: 5.1, p97: 6.6 },
      { m: 3, p3: 4.6, p50: 5.8, p97: 7.4 },
      { m: 4, p3: 5.1, p50: 6.4, p97: 8.1 },
      { m: 5, p3: 5.5, p50: 6.9, p97: 8.7 },
      { m: 6, p3: 5.9, p50: 7.3, p97: 9.2 },
      { m: 7, p3: 6.2, p50: 7.6, p97: 9.6 },
      { m: 8, p3: 6.4, p50: 7.9, p97: 9.9 },
      { m: 9, p3: 6.6, p50: 8.2, p97: 10.2 },
      { m: 10, p3: 6.8, p50: 8.5, p97: 10.6 },
      { m: 11, p3: 7.0, p50: 8.7, p97: 10.9 },
      { m: 12, p3: 7.2, p50: 8.9, p97: 11.2 },
      { m: 15, p3: 7.7, p50: 9.6, p97: 12.1 },
      { m: 18, p3: 8.2, p50: 10.2, p97: 13.0 },
      { m: 21, p3: 8.6, p50: 10.7, p97: 13.8 },
      { m: 24, p3: 9.0, p50: 11.2, p97: 14.6 }
    ],
    headCircumference: [
      { m: 0, p3: 31.7, p50: 33.9, p97: 36.1 },
      { m: 1, p3: 33.9, p50: 36.2, p97: 38.5 },
      { m: 2, p3: 35.4, p50: 37.7, p97: 40.0 },
      { m: 3, p3: 36.6, p50: 38.9, p97: 41.3 },
      { m: 6, p3: 38.8, p50: 41.2, p97: 43.6 },
      { m: 9, p3: 40.2, p50: 42.6, p97: 45.0 },
      { m: 12, p3: 41.2, p50: 43.5, p97: 45.8 },
      { m: 18, p3: 42.2, p50: 44.5, p97: 46.8 },
      { m: 24, p3: 42.8, p50: 45.1, p97: 47.4 }
    ]
  }
}

function getAgeInMonths(birthDateStr, nowTime) {
  if (!birthDateStr) return 0
  const birth = new Date(birthDateStr)
  const now = nowTime ? new Date(nowTime) : new Date()
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months -= 1
  return Math.max(0, months)
}

// 线性插值
function interpolate(arr, months) {
  if (months <= arr[0].m) return arr[0]
  if (months >= arr[arr.length - 1].m) return arr[arr.length - 1]
  for (let i = 0; i < arr.length - 1; i++) {
    const a = arr[i], b = arr[i + 1]
    if (months >= a.m && months <= b.m) {
      const ratio = (months - a.m) / (b.m - a.m)
      return {
        m: months,
        p3: a.p3 + (b.p3 - a.p3) * ratio,
        p50: a.p50 + (b.p50 - a.p50) * ratio,
        p97: a.p97 + (b.p97 - a.p97) * ratio
      }
    }
  }
  return arr[arr.length - 1]
}

// 获取某性别、某月龄、某指标的参考值
function getReference(gender, metric, months) {
  const g = (gender === 'girl' || gender === '女') ? 'girl' : 'boy'
  return interpolate(DATA[g][metric], months)
}

// 评估单个值处于什么位置：下沿(<P3)、中下(P3-P50)、中上(P50-P97)、上沿(>P97)
function evaluate(value, ref) {
  if (value < ref.p3) return { level: 'low', label: '下沿（<P3）', color: '#FF5252' }
  if (value < ref.p50) return { level: 'mid-low', label: '中下（P3-P50）', color: '#FFB347' }
  if (value <= ref.p97) return { level: 'mid-high', label: '中上（P50-P97）', color: '#66BB6A' }
  return { level: 'high', label: '上沿（>P97）', color: '#42A5F5' }
}

// 生成 0-24 个月的参考曲线数据（用于 canvas 绘制）
function getCurveData(gender, metric) {
  const g = (gender === 'girl' || gender === '女') ? 'girl' : 'boy'
  const arr = DATA[g][metric]
  const out = []
  for (let m = 0; m <= 24; m++) {
    out.push(interpolate(arr, m))
  }
  return out
}

module.exports = {
  getAgeInMonths,
  getReference,
  evaluate,
  getCurveData
}
