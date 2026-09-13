import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { API_BASE_URL } from '../config'

interface Student {
  id: number
  name: string
  email: string
  phone: string
  department: string
  rollNo: string
  year: number
  attendance: number
  feesStatus: 'Paid' | 'Pending'
}

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology']

const mockStudents: Student[] = [
  { id: 1, name: 'Aditya Kumar',  email: 'aditya@college.edu',  phone: '9876543210', department: 'Computer Science', rollNo: '21CS001', year: 3, attendance: 87, feesStatus: 'Paid'    },
  { id: 2, name: 'Priya Sharma',  email: 'priya@college.edu',   phone: '9876543211', department: 'Electronics',      rollNo: '21EC001', year: 3, attendance: 92, feesStatus: 'Paid'    },
  { id: 3, name: 'Ravi Patel',    email: 'ravi@college.edu',    phone: '9876543212', department: 'Mechanical',       rollNo: '21ME001', year: 3, attendance: 74, feesStatus: 'Pending' },
  { id: 4, name: 'Sneha Mehta',   email: 'sneha@college.edu',   phone: '9876543213', department: 'Civil',            rollNo: '21CV001', year: 2, attendance: 95, feesStatus: 'Paid'    },
  { id: 5, name: 'Kiran Nair',    email: 'kiran@college.edu',   phone: '9876543214', department: 'Computer Science', rollNo: '22CS001', year: 2, attendance: 81, feesStatus: 'Pending' },
  { id: 6, name: 'Anjali Singh',  email: 'anjali@college.edu',  phone: '9876543215', department: 'IT',               rollNo: '21IT001', year: 3, attendance: 88, feesStatus: 'Paid'    },
  { id: 7, name: 'Mohit Gupta',   email: 'mohit@college.edu',   phone: '9876543216', department: 'Computer Science', rollNo: '23CS001', year: 1, attendance: 70, feesStatus: 'Pending' },
  { id: 8, name: 'Divya Reddy',   email: 'divya@college.edu',   phone: '9876543217', department: 'Electronics',      rollNo: '22EC001', year: 2, attendance: 90, feesStatus: 'Paid'    },
]

const emptyForm = { name: '', email: '', phone: '', department: DEPARTMENTS[0], rollNo: '', year: 1 }

export default function Students() {
  const [students, setStudents] = useState(mockStudents)
  const [search, setSearch]     = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(emptyForm)
  const [editId, setEditId]         = useState<number | null>(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/students`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setStudents(data) })
      .catch(() => {}) // Use mock data if backend offline
  }, [])

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                        s.rollNo.toLowerCase().includes(search.toLowerCase())
    const matchDept   = deptFilter === 'All' || s.department === deptFilter
    return matchSearch && matchDept
  })

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (s: Student) => {
    setForm({ name: s.name, email: s.email, phone: s.phone, department: s.department, rollNo: s.rollNo, year: s.year })
    setEditId(s.id)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (editId) {
      setStudents(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s))
      try {
        await fetch(`${API_BASE_URL}/students/${editId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } catch {}
    } else {
      const newStudent: Student = {
        id: Date.now(), ...form, attendance: 0, feesStatus: 'Pending'
      }
      setStudents(prev => [newStudent, ...prev])
      try {
        await fetch(`${API_BASE_URL}/students`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
      } catch {}
    }
    setShowModal(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this student?')) return
    setStudents(prev => prev.filter(s => s.id !== id))
    try {
      await fetch(`${API_BASE_URL}/students/${id}`, { method: 'DELETE' })
    } catch {}
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>👥 Student Directory</h1>
        <p>Manage all enrolled students</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Students', value: students.length, color: 'var(--brand-primary)' },
          { label: 'Fees Paid',  value: students.filter(s => s.feesStatus === 'Paid').length, color: 'var(--brand-secondary)' },
          { label: 'Fees Pending', value: students.filter(s => s.feesStatus === 'Pending').length, color: 'var(--brand-accent)' },
        ].map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px 22px', flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="search-bar">
        <input
          id="student-search"
          className="input"
          placeholder="🔍  Search by name or roll no…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input" style={{ maxWidth: 200 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <button id="add-student-btn" className="btn btn-primary" onClick={openAdd} style={{ marginLeft: 'auto' }}>
          + Add Student
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No</th>
              <th>Department</th>
              <th>Year</th>
              <th>Attendance</th>
              <th>Fees</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No students found</td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar">{s.name.split(' ').map(w => w[0]).join('')}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{s.rollNo}</td>
                <td>{s.department}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-blue">Yr {s.year}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      flex: 1, height: 6, background: 'var(--border-subtle)',
                      borderRadius: 99, overflow: 'hidden', maxWidth: 80
                    }}>
                      <div style={{
                        height: '100%', width: `${s.attendance}%`, borderRadius: 99,
                        background: s.attendance >= 85 ? 'var(--brand-secondary)' : s.attendance >= 75 ? 'var(--brand-gold)' : 'var(--brand-accent)'
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{s.attendance}%</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${s.feesStatus === 'Paid' ? 'badge-green' : 'badge-red'}`}>
                    {s.feesStatus}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Student' : 'Add New Student'} onClose={() => setShowModal(false)}>
          {(['name', 'email', 'phone', 'rollNo'] as const).map(field => (
            <div key={field} className="input-group">
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                className="input"
                placeholder={`Enter ${field}`}
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}
          <div className="input-group">
            <label>Department</label>
            <select className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Year</label>
            <select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}>
              {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button id="save-student-btn" className="btn btn-primary" onClick={handleSave}>
              {editId ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
