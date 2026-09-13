const express = require('express')
const router = express.Router()
const db = require('../db')

router.get('/', async (req, res) => {
  const { email } = req.query
  if (!email) return res.status(400).json({ error: 'email is required' })
  try {
    const [rows] = await db.query(
      `SELECT u.*, d.name AS department
       FROM users u LEFT JOIN departments d ON d.id = u.department_id
       WHERE u.email = ?`,
      [email]
    )
    res.json(rows[0] || null)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { uid, email, name, role, mobile, rollNo, branch, department, image } = req.body
  if (!email || !name || !role) return res.status(400).json({ error: 'email, name, and role are required' })
  try {
    const [departments] = await db.query('SELECT id FROM departments WHERE name = ?', [department || ''])
    const departmentId = departments[0]?.id || null
    await db.query(
      `INSERT INTO users (firebase_uid, email, name, role, mobile, roll_no, branch, department_id, profile_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE firebase_uid=VALUES(firebase_uid), name=VALUES(name), role=VALUES(role),
       mobile=VALUES(mobile), roll_no=VALUES(roll_no), branch=VALUES(branch),
       department_id=VALUES(department_id), profile_image=VALUES(profile_image)`,
      [uid || null, email, name, role, mobile || null, rollNo || null, branch || null, departmentId, image || null]
    )
    res.status(200).json({ message: 'Profile saved successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router