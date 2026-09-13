const express  = require('express')
const router   = express.Router()
const db       = require('../db')
const Razorpay = require('razorpay')
const crypto   = require('crypto')
require('dotenv').config()

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     || 'rzp_test_YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
})

// GET /fees/:studentId — get fee records
router.get('/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM fees WHERE student_id = ? ORDER BY id DESC',
      [req.params.studentId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /fees/create-order — create Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount, studentId, feeType } = req.body
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' })

  try {
    const order = await razorpay.orders.create({
      amount:   Math.round(amount) * 100,    // paise
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
      notes:    { studentId, feeType },
    })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /fees/verify-payment — verify Razorpay signature + update DB
router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, feeId, amount } = req.body

  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (generated !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' })
  }

  try {
    // Update fee status
    if (feeId) {
      await db.query('UPDATE fees SET status=?, payment_id=? WHERE id=?',
        ['Paid', razorpay_payment_id, feeId])
    }
    // Log payment
    await db.query(
      'INSERT INTO payment_logs (student_id, payment_id, order_id, amount, status) VALUES (?, ?, ?, ?, ?)',
      [studentId, razorpay_payment_id, razorpay_order_id, amount, 'success']
    )
    res.json({ success: true, payment_id: razorpay_payment_id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /fees/history/:studentId — payment history
router.get('/history/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM payment_logs WHERE student_id = ? ORDER BY created_at DESC',
      [req.params.studentId]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
