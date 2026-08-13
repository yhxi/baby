/**
 * 白噪音工具：在小程序运行时本地合成 WAV 音频（白/粉/棕噪音），无需任何网络资源。
 * 生成后写入 wx.env.USER_DATA_PATH，返回本地文件路径，供 innerAudioContext 循环播放。
 */

const DURATION = 30          // 秒
const SAMPLE_RATE = 22050
const TYPES = {
  white: { label: '白噪音', emoji: '🌊', desc: '均匀的沙沙声，最适合助眠' },
  pink: { label: '粉噪音', emoji: '🌧️', desc: '更柔和，像细雨或海风' },
  brown: { label: '棕噪音', emoji: '🏞️', desc: '低沉厚重，像远处的瀑布' }
}

function filePathFor(type) {
  return `${wx.env.USER_DATA_PATH}/wn_${type}.wav`
}

function generateSamples(type) {
  const n = SAMPLE_RATE * DURATION
  const data = new Float32Array(n)
  if (type === 'white') {
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + w * 0.0555179
      b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.96900 * b2 + w * 0.1538520
      b3 = 0.86650 * b3 + w * 0.3104856
      b4 = 0.55000 * b4 + w * 0.5329522
      b5 = -0.7616 * b5 - w * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
      b6 = w * 0.115926
    }
  } else { // brown
    let last = 0
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) * 0.995
      data[i] = last * 3.5
    }
  }
  // 归一化到 [-1,1]
  let peak = 0
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(data[i]))
  if (peak > 0) {
    const g = 0.95 / peak
    for (let i = 0; i < n; i++) data[i] *= g
  }
  return data
}

function buildWav(samples) {
  const numSamples = samples.length
  const bytesPerSample = 2
  const blockAlign = bytesPerSample // mono
  const byteRate = SAMPLE_RATE * blockAlign
  const dataSize = numSamples * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)
  let off = 0
  function str(s) { for (let i = 0; i < s.length; i++) view.setUint8(off++, s.charCodeAt(i)) }
  function u32(v) { view.setUint32(off, v, true); off += 4 }
  function u16(v) { view.setUint16(off, v, true); off += 2 }
  str('RIFF'); u32(36 + dataSize); str('WAVE')
  str('fmt '); u32(16); u16(1); u16(1); u32(SAMPLE_RATE); u32(byteRate); u16(blockAlign); u16(16)
  str('data'); u32(dataSize)
  for (let i = 0; i < numSamples; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    off += 2
  }
  return buffer
}

// 生成（若已存在则直接返回路径）
function ensureFile(type) {
  const fs = wx.getFileSystemManager()
  const path = filePathFor(type)
  try {
    fs.accessSync(path)
    return path
  } catch (e) {
    const samples = generateSamples(type)
    const wav = buildWav(samples)
    fs.writeFileSync(path, wav)
    return path
  }
}

module.exports = { TYPES, ensureFile, filePathFor }
