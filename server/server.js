'use strict'

// No third-party runtime dependencies: Node 22's built-in SQLite keeps the
// initial VPS deployment compact and makes backups a single database file.
const http = require('node:http')
const https = require('node:https')
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { DatabaseSync } = require('node:sqlite')

function readEnv(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
readEnv(path.join(__dirname, '.env'))

const port = Number(process.env.PORT || 8888)
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data')
fs.mkdirSync(dataDir, { recursive: true })
const db = new DatabaseSync(path.join(dataDir, 'baby-care.sqlite'))
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, openid TEXT UNIQUE NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS babies (
    id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, profile_json TEXT NOT NULL, updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY, baby_id TEXT NOT NULL, payload_json TEXT NOT NULL, updated_at INTEGER NOT NULL, deleted_at INTEGER
  );
  CREATE INDEX IF NOT EXISTS records_baby_updated ON records(baby_id, updated_at);
`)

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}
function parseJson(req) {
  return new Promise((resolve, reject) => {
    let text = ''
    req.on('data', part => { text += part; if (text.length > 1024 * 1024) req.destroy() })
    req.on('end', () => { try { resolve(text ? JSON.parse(text) : {}) } catch { reject(new Error('Invalid JSON')) } })
    req.on('error', reject)
  })
}
function tokenFor(userId) {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + 30 * 86400000 })).toString('base64url')
  const secret = process.env.JWT_SECRET || ''
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}
function userFrom(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  const [payload, sig] = token.split('.')
  if (!payload || !sig || !process.env.JWT_SECRET) return null
  const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(payload).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try { const d = JSON.parse(Buffer.from(payload, 'base64url')); return d.exp > Date.now() ? d.sub : null } catch { return null }
}
function ownsBaby(userId, babyId) {
  return !!db.prepare('SELECT 1 FROM babies WHERE id = ? AND owner_id = ?').get(babyId, userId)
}
function requestJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      let text = ''
      response.on('data', part => { text += part })
      response.on('end', () => { try { resolve(JSON.parse(text)) } catch { reject(new Error('Invalid upstream response')) } })
    }).on('error', reject)
  })
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, { ok: true, service: 'baby-care-api', time: Date.now() })
  if (!url.pathname.startsWith('/api/v1/')) return send(res, 404, { error: 'Not found' })
  if (req.method === 'POST' && url.pathname === '/api/v1/auth/wechat-login') {
    if (!process.env.WECHAT_APP_SECRET || !process.env.JWT_SECRET) return send(res, 503, { error: 'Login is not configured yet' })
    try {
      const body = await parseJson(req)
      if (!body.code || typeof body.code !== 'string') return send(res, 400, { error: 'Missing login code' })
      const endpoint = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(process.env.WECHAT_APP_ID)}&secret=${encodeURIComponent(process.env.WECHAT_APP_SECRET)}&js_code=${encodeURIComponent(body.code)}&grant_type=authorization_code`
      const session = await requestJson(endpoint)
      if (!session.openid) return send(res, 401, { error: 'WeChat login failed', code: session.errcode })
      let user = db.prepare('SELECT id FROM users WHERE openid = ?').get(session.openid)
      if (!user) {
        user = { id: crypto.randomUUID() }
        db.prepare('INSERT INTO users (id, openid, created_at) VALUES (?, ?, ?)').run(user.id, session.openid, Date.now())
      }
      return send(res, 200, { token: tokenFor(user.id), expiresIn: 30 * 86400 })
    } catch { return send(res, 502, { error: 'WeChat login service is unavailable' }) }
  }
  const userId = userFrom(req)
  if (!userId) return send(res, 401, { error: 'Unauthorized' })
  if (req.method === 'GET' && url.pathname === '/api/v1/babies') {
    const babies = db.prepare('SELECT profile_json FROM babies WHERE owner_id = ? ORDER BY updated_at DESC').all(userId).map(x => JSON.parse(x.profile_json))
    return send(res, 200, { babies })
  }
  if (req.method === 'POST' && url.pathname === '/api/v1/babies') {
    const baby = await parseJson(req); const id = baby.id || crypto.randomUUID(); const now = Date.now()
    baby.id = id; db.prepare('INSERT INTO babies (id, owner_id, profile_json, updated_at) VALUES (?, ?, ?, ?)').run(id, userId, JSON.stringify(baby), now)
    return send(res, 201, { baby })
  }
  const babyMatch = url.pathname.match(/^\/api\/v1\/babies\/([^/]+)$/)
  if (babyMatch && req.method === 'PUT') {
    const id = decodeURIComponent(babyMatch[1]); const baby = await parseJson(req); const now = Date.now()
    baby.id = id
    const existing = db.prepare('SELECT owner_id FROM babies WHERE id = ?').get(id)
    if (existing && existing.owner_id !== userId) return send(res, 403, { error: 'Forbidden' })
    db.prepare('INSERT INTO babies (id, owner_id, profile_json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET profile_json=excluded.profile_json, updated_at=excluded.updated_at').run(id, userId, JSON.stringify(baby), now)
    return send(res, 200, { baby })
  }
  const match = url.pathname.match(/^\/api\/v1\/babies\/([^/]+)\/sync$/)
  if (match && req.method === 'POST') {
    const babyId = decodeURIComponent(match[1]); if (!ownsBaby(userId, babyId)) return send(res, 403, { error: 'Forbidden' })
    const body = await parseJson(req); const now = Date.now()
    const save = db.prepare('INSERT INTO records (id, baby_id, payload_json, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload_json=excluded.payload_json, updated_at=excluded.updated_at, deleted_at=excluded.deleted_at')
    for (const record of body.changes || []) {
      if (!record.id) continue
      save.run(record.id, babyId, JSON.stringify(record), Number(record.updatedAt || now), record.deletedAt || null)
    }
    const after = Number(body.after || 0)
    const records = db.prepare('SELECT payload_json, deleted_at FROM records WHERE baby_id = ? AND updated_at > ?').all(babyId, after).map(r => Object.assign(JSON.parse(r.payload_json), r.deleted_at ? { deletedAt: r.deleted_at } : {}))
    return send(res, 200, { serverTime: now, records })
  }
  return send(res, 404, { error: 'Not found' })
}).listen(port, '127.0.0.1', () => console.log(`Baby Care API listening on 127.0.0.1:${port}`))
