const express = require('express')
const cors    = require('cors')
const jwt     = require('jsonwebtoken')
require('dotenv').config()

const studentsRouter   = require('./routes/students')
const attendanceRouter = require('./routes/attendance')
const feesRouter       = require('./routes/fees')
const profilesRouter   = require('./routes/profiles')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ── JWT Auth Middleware ────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers['authorization']
  if (!header) return res.status(401).json({ error: 'No token provided' })
  const token = header.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// ── Health Check ───────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'OurEdu Backend API is running 🎓', version: '1.0.0' })
})

// ── Routes ─────────────────────────────────────────────────
// Public routes
app.use('/students',   studentsRouter)
app.use('/attendance', attendanceRouter)
app.use('/fees',       feesRouter)
app.use('/profiles',   profilesRouter)

// ── JWT Token Endpoint (used by frontend after Firebase auth) ──
app.post('/auth/token', (req, res) => {
  const { uid, phone, role } = req.body
  if (!uid || !role) return res.status(400).json({ error: 'uid and role are required' })
  const token = jwt.sign({ uid, phone, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
  res.json({ token })
})

// ── 404 Handler ────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))

// ── Error Handler ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error', details: err.message })
})

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ OurEdu backend running on http://localhost:${PORT}`)
})
