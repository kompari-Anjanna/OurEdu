import { useState } from 'react'
import { API_BASE_URL } from '../config'

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => { open(): void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  order_id?: string
  name: string
  description: string
  prefill?: { contact?: string; email?: string }
  theme?: { color: string }
  handler: (response: { razorpay_payment_id: string }) => void
}

interface FeeItem {
  id: number
  title: string
  description: string
  amount: number
  dueDate: string
  status: 'Paid' | 'Pending'
}

const mockFees: FeeItem[] = [
  { id: 1, title: 'Tuition Fee',      description: 'Semester 5 — 2024-25', amount: 45000, dueDate: '30 Sep 2024', status: 'Pending' },
  { id: 2, title: 'Hostel Fee',       description: 'October–December',      amount: 18000, dueDate: '15 Sep 2024', status: 'Pending' },
  { id: 3, title: 'Library Fee',      description: 'Annual subscription',   amount: 1500,  dueDate: '31 Oct 2024', status: 'Paid'    },
  { id: 4, title: 'Exam Fee',         description: 'End semester exam',     amount: 3500,  dueDate: '01 Nov 2024', status: 'Pending' },
  { id: 5, title: 'Sports Fee',       description: 'Annual sports levy',    amount: 2000,  dueDate: '31 Aug 2024', status: 'Paid'    },
]

const paymentHistory = [
  { id: 'pay_RzpDemo001', title: 'Library Fee',  amount: 1500,  date: '10 Aug 2024' },
  { id: 'pay_RzpDemo002', title: 'Sports Fee',   amount: 2000,  date: '05 Aug 2024' },
  { id: 'pay_RzpDemo003', title: 'Tuition Fee',  amount: 45000, date: '02 Feb 2024' },
]

export default function Fees() {
  const [fees, setFees]         = useState(mockFees)
  const [paying, setPaying]     = useState<number | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  const totalPending = fees.filter(f => f.status === 'Pending').reduce((s, f) => s + f.amount, 0)
  const totalPaid    = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0)

  const handlePay = async (fee: FeeItem) => {
    setPaying(fee.id)
    try {
      let orderId: string | undefined
      try {
        const res = await fetch(`${API_BASE_URL}/fees/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: fee.amount })
        })
        const data = await res.json()
        orderId = data.id
      } catch {
        // Backend offline — demo mode
      }

      const options: RazorpayOptions = {
        key: 'YOUR_RAZORPAY_KEY',
        amount: fee.amount * 100,
        currency: 'INR',
        name: 'OurEdu College',
        description: fee.title,
        order_id: orderId,
        prefill: { contact: '9999999999' },
        theme: { color: '#6C63FF' },
        handler: (response) => {
          setFees(prev => prev.map(f => f.id === fee.id ? { ...f, status: 'Paid' } : f))
          setSuccessId(response.razorpay_payment_id || 'DEMO_' + Date.now())
          setTimeout(() => setSuccessId(null), 5000)
        }
      }

      if (window.Razorpay) {
        new window.Razorpay(options).open()
      } else {
        // Razorpay script not loaded — simulate
        options.handler({ razorpay_payment_id: 'DEMO_' + Date.now() })
      }
    } finally {
      setPaying(null)
    }
  }

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>💳 Fee Management</h1>
        <p>View and pay your college fees securely</p>
      </div>

      {/* Success Banner */}
      {successId && (
        <div style={{
          background: 'rgba(67,217,173,0.12)', border: '1px solid rgba(67,217,173,0.3)',
          borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 20,
          color: 'var(--brand-secondary)', fontWeight: 500, fontSize: 14,
          animation: 'slideUp 0.3s ease'
        }}>
          ✅ Payment successful! ID: <span style={{ fontFamily: 'monospace' }}>{successId}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '22px 28px', flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>TOTAL PENDING</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--brand-accent)' }}>{fmt(totalPending)}</div>
        </div>
        <div className="glass-card" style={{ padding: '22px 28px', flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>TOTAL PAID</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--brand-secondary)' }}>{fmt(totalPaid)}</div>
        </div>
        <div className="glass-card" style={{ padding: '22px 28px', flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>PENDING ITEMS</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--brand-gold)' }}>
            {fees.filter(f => f.status === 'Pending').length}
          </div>
        </div>
      </div>

      {/* Fee Items */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Due Fees</h3>
        {fees.map(fee => (
          <div key={fee.id} className="fee-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: fee.status === 'Paid' ? 'rgba(67,217,173,0.12)' : 'rgba(255,101,132,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
              }}>
                {fee.status === 'Paid' ? '✅' : '💰'}
              </div>
              <div className="fee-info">
                <h4>{fee.title}</h4>
                <p>{fee.description} · Due: {fee.dueDate}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="fee-amount">
                <div className="amount">{fmt(fee.amount)}</div>
                <span className={`badge ${fee.status === 'Paid' ? 'badge-green' : 'badge-red'}`}>
                  {fee.status}
                </span>
              </div>
              {fee.status === 'Pending' && (
                <button
                  id={`pay-btn-${fee.id}`}
                  className="btn btn-primary"
                  onClick={() => handlePay(fee)}
                  disabled={paying === fee.id}
                >
                  {paying === fee.id ? '⏳' : '💳 Pay Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📜 Payment History</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{p.id}</td>
                  <td style={{ fontWeight: 500 }}>{p.title}</td>
                  <td style={{ color: 'var(--brand-secondary)', fontWeight: 600 }}>{fmt(p.amount)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.date}</td>
                  <td><span className="badge badge-green">✓ Paid</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
