/**
 * 国家免疫规划疫苗程序（简化版，0-6岁）
 * ageMonth: 建议接种月龄（出生为 0）
 * dose: 剂次序号
 */

const PLAN = [
  { name: '乙肝疫苗', dose: 1, ageMonth: 0, note: '出生时' },
  { name: '卡介苗', dose: 1, ageMonth: 0, note: '出生时' },
  { name: '乙肝疫苗', dose: 2, ageMonth: 1, note: '1月龄' },
  { name: '脊灰灭活疫苗', dose: 1, ageMonth: 2, note: '2月龄' },
  { name: '脊灰灭活疫苗', dose: 2, ageMonth: 3, note: '3月龄' },
  { name: '百白破疫苗', dose: 1, ageMonth: 3, note: '3月龄' },
  { name: '脊灰减毒活疫苗', dose: 3, ageMonth: 4, note: '4月龄' },
  { name: '百白破疫苗', dose: 2, ageMonth: 4, note: '4月龄' },
  { name: '百白破疫苗', dose: 3, ageMonth: 5, note: '5月龄' },
  { name: '乙肝疫苗', dose: 3, ageMonth: 6, note: '6月龄' },
  { name: 'A群流脑多糖疫苗', dose: 1, ageMonth: 6, note: '6月龄' },
  { name: '麻腮风疫苗', dose: 1, ageMonth: 8, note: '8月龄' },
  { name: '乙脑减毒活疫苗', dose: 1, ageMonth: 8, note: '8月龄' },
  { name: 'A群流脑多糖疫苗', dose: 2, ageMonth: 9, note: '9月龄' },
  { name: '百白破疫苗', dose: 4, ageMonth: 18, note: '18月龄' },
  { name: '麻腮风疫苗', dose: 2, ageMonth: 18, note: '18月龄' },
  { name: '甲肝减毒活疫苗', dose: 1, ageMonth: 18, note: '18月龄' },
  { name: '乙脑减毒活疫苗', dose: 2, ageMonth: 24, note: '2岁' },
  { name: 'A+C群流脑多糖疫苗', dose: 1, ageMonth: 36, note: '3岁' },
  { name: '脊灰减毒活疫苗', dose: 4, ageMonth: 48, note: '4岁' },
  { name: '白破疫苗', dose: 1, ageMonth: 72, note: '6岁' },
  { name: 'A+C群流脑多糖疫苗', dose: 2, ageMonth: 72, note: '6岁' }
]

function getAll() {
  return PLAN
}

function keyFor(item) {
  return `${item.name}#${item.dose}`
}

function buildStatus(records) {
  const doneKeys = {}
  records.forEach(r => {
    if (r.type === 'vaccine' && r.vaccineName && r.dose) {
      doneKeys[`${r.vaccineName}#${r.dose}`] = r
    }
  })
  return PLAN.map(p => {
    const k = keyFor(p)
    const record = doneKeys[k] || null
    return Object.assign({}, p, {
      key: k,
      done: !!record,
      doneDate: record ? record.time : 0
    })
  })
}

module.exports = {
  getAll,
  buildStatus,
  keyFor
}
