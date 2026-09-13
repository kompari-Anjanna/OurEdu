const express = require('express')
const router  = express.Router()
const db      = require('../db')

// GET /attendance/:studentId — get attendance for a student
router.get('/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC',
      [req.params.studentId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Could not load attendance:', err)
    res.status(500).json({ error: err.message || 'Database connection failed. Make sure MySQL is running on localhost:3306.' })
  }
})

// POST /attendance — mark single attendance
router.post('/', async (req, res) => {
  const { studentId, date, status, verificationPhoto } = req.body
  if (!studentId || !date || !status) {
    return res.status(400).json({ error: 'studentId, date, and status are required' })
  }
  try {
    const [result] = await db.query(
      'INSERT INTO attendance (student_id, date, status, verification_photo) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=?, verification_photo=?',
      [studentId, date, status, verificationPhoto || null, status, verificationPhoto || null]
    )
    res.status(201).json({ id: result.insertId, message: 'Attendance marked' })
  } catch (err) {
    console.error('Could not save attendance:', err)
    res.status(500).json({ error: err.message || 'Database connection failed. Make sure MySQL is running on localhost:3306.' })
  }
})

// POST /attendance/bulk — mark attendance for entire class
router.post('/bulk', async (req, res) => {
  const { subject, date, records } = req.body
  // records: [{ studentId, status }]
  if (!Array.isArray(records) || !date) {
    return res.status(400).json({ error: 'date and records[] are required' })
  }
  try {
    const values = records.map(r => [r.studentId, date, subject, r.status, r.verificationPhoto || null])
    await db.query(
      'INSERT INTO attendance (student_id, date, subject, status, verification_photo) VALUES ? ON DUPLICATE KEY UPDATE status=VALUES(status), verification_photo=VALUES(verification_photo)',
      [values]
    )
    res.json({ message: `Attendance saved for ${records.length} students` })
  } catch (err) {
    console.error('Could not save bulk attendance:', err)
    res.status(500).json({ error: err.message || 'Database connection failed. Make sure MySQL is running on localhost:3306.' })
  }
})

// GET /attendance/summary/:studentId — percentage per subject
router.get('/summary/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT subject,
         SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) AS present_count,
         COUNT(*) AS total_count,
         ROUND(SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) AS percentage
       FROM attendance
       WHERE student_id = ?
       GROUP BY subject`,
      [req.params.studentId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Could not load attendance summary:', err)
    res.status(500).json({ error: err.message || 'Database connection failed. Make sure MySQL is running on localhost:3306.' })
  }
})

module.exports = router
