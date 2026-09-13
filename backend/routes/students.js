const express = require('express')
const router  = express.Router()
const db      = require('../db')

// GET /students — list all students
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students ORDER BY id DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /students/:id — get single student
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Student not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /students — add new student
router.post('/', async (req, res) => {
  const { name, email, phone, department, rollNo, year } = req.body
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' })
  try {
    const [result] = await db.query(
      'INSERT INTO students (name, email, phone, department, roll_no, year) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, department || null, rollNo || null, year || 1]
    )
    res.status(201).json({ id: result.insertId, message: 'Student added successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /students/:id — update student
router.put('/:id', async (req, res) => {
  const { name, email, phone, department, rollNo, year } = req.body
  try {
    await db.query(
      'UPDATE students SET name=?, email=?, phone=?, department=?, roll_no=?, year=? WHERE id=?',
      [name, email, phone, department, rollNo, year, req.params.id]
    )
    res.json({ message: 'Student updated successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /students/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM students WHERE id = ?', [req.params.id])
    res.json({ message: 'Student deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
