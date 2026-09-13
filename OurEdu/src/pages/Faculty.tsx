import { useState } from 'react'
import Modal from '../components/Modal'

interface FacultyMember {
  id: number
  name: string
  email: string
  phone: string
  department: string
  designation: string
  subjects: string[]
  experience: number
}

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology']
const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer']

const mockFaculty: FacultyMember[] = [
  { id: 1, name: 'Dr. Ramesh Kumar',    email: 'ramesh@college.edu',  phone: '9876501001', department: 'Computer Science', designation: 'Professor',            subjects: ['Data Structures', 'Algorithms'], experience: 18 },
  { id: 2, name: 'Dr. Sunita Joshi',    email: 'sunita@college.edu',  phone: '9876501002', department: 'Electronics',      designation: 'Associate Professor',  subjects: ['Digital Circuits', 'VLSI'],      experience: 12 },
  { id: 3, name: 'Prof. Anil Verma',    email: 'anil@college.edu',    phone: '9876501003', department: 'Mechanical',       designation: 'Professor',            subjects: ['Thermodynamics', 'Fluid Mech'], experience: 22 },
  { id: 4, name: 'Ms. Kavitha Rao',     email: 'kavitha@college.edu', phone: '9876501004', department: 'Computer Science', designation: 'Assistant Professor',  subjects: ['OS', 'DBMS'],                   experience: 6  },
  { id: 5, name: 'Dr. Suresh Nair',     email: 'suresh@college.edu',  phone: '9876501005', department: 'Civil',           designation: 'Associate Professor',  subjects: ['Structural Analysis'],          experience: 14 },
  { id: 6, name: 'Ms. Pooja Desai',     email: 'pooja@college.edu',   phone: '9876501006', department: 'IT',              designation: 'Lecturer',             subjects: ['Web Tech', 'Python'],           experience: 3  },
]

const designationColor: Record<string, string> = {
  'Professor':            'badge-purple',
  'Associate Professor':  'badge-blue',
  'Assistant Professor':  'badge-gold',
  'Lecturer':             'badge-green',
}

const emptyForm = { name: '', email: '', phone: '', department: DEPARTMENTS[0], designation: DESIGNATIONS[0], experience: 1 }

export default function Faculty() {
  const [faculty, setFaculty] = useState(mockFaculty)
  const [search, setSearch]   = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [showModal, setShowModal]   = useState(false)
  const [form, setForm]             = useState(emptyForm)
  const [editId, setEditId]         = useState<number | null>(null)

  const filtered = faculty.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                        f.email.toLowerCase().includes(search.toLowerCase())
    const matchDept   = deptFilter === 'All' || f.department === deptFilter
    return matchSearch && matchDept
  })

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (f: FacultyMember) => {
    setForm({ name: f.name, email: f.email, phone: f.phone, department: f.department, designation: f.designation, experience: f.experience })
    setEditId(f.id)
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (editId) {
      setFaculty(prev => prev.map(f => f.id === editId ? { ...f, ...form } : f))
    } else {
      setFaculty(prev => [{ id: Date.now(), ...form, subjects: [] }, ...prev])
    }
    setShowModal(false)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🎓 Faculty Directory</h1>
        <p>View and manage all faculty members</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
        {DESIGNATIONS.map(d => (
          <div key={d} className="glass-card" style={{ padding: '14px 18px', flex: 1, minWidth: 140 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--brand-primary)' }}>
              {faculty.filter(f => f.designation === d).length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{d}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          id="faculty-search"
          className="input"
          placeholder="🔍  Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input" style={{ maxWidth: 200 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <button id="add-faculty-btn" className="btn btn-primary" onClick={openAdd} style={{ marginLeft: 'auto' }}>
          + Add Faculty
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(f => (
          <div key={f.id} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div className="avatar" style={{ width: 48, height: 48, fontSize: 18 }}>
                {f.name.split(' ').filter(w => w.match(/[A-Z]/)).map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{f.email}</div>
                <span className={`badge ${designationColor[f.designation] ?? 'badge-blue'}`}>
                  {f.designation}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>Department</span>
                <span style={{ fontWeight: 500 }}>{f.department}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>Experience</span>
                <span style={{ fontWeight: 500 }}>{f.experience} years</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>Subjects</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {f.subjects.map(s => (
                    <span key={s} className="badge badge-blue" style={{ fontSize: 11 }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(f)}>Edit</button>
              <a href={`mailto:${f.email}`} className="btn btn-secondary btn-sm">✉ Email</a>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editId ? 'Edit Faculty' : 'Add Faculty Member'} onClose={() => setShowModal(false)}>
          {(['name', 'email', 'phone'] as const).map(field => (
            <div key={field} className="input-group">
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className="input" placeholder={`Enter ${field}`} value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <div className="input-group">
            <label>Department</label>
            <select className="input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Designation</label>
            <select className="input" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}>
              {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label>Years of Experience</label>
            <input className="input" type="number" min={0} value={form.experience}
              onChange={e => setForm(f => ({ ...f, experience: +e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button id="save-faculty-btn" className="btn btn-primary" onClick={handleSave}>
              {editId ? 'Update' : 'Add Faculty'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
