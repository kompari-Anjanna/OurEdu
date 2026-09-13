import { useEffect, useState } from 'react'
import { useAuth } from '../App'
import { API_BASE_URL } from '../config'

const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology']

type ProfileForm = {
  name: string
  mobile: string
  rollNo: string
  department: string
  branch: string
  image: string
}

const emptyProfile: ProfileForm = {
  name: '', mobile: '', rollNo: '', department: departments[0], branch: '', image: ''
}

export default function Profile() {
  const { user, role } = useAuth()
  const [profile, setProfile] = useState<ProfileForm>({ ...emptyProfile, name: user?.displayName || '' })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API_BASE_URL}/profiles?email=${encodeURIComponent(user.email)}`)
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data) setProfile({
          name: data.name || '', mobile: data.mobile || '', rollNo: data.roll_no || '',
          department: data.department || departments[0], branch: data.branch || '', image: data.profile_image || ''
        })
      })
      .catch(() => {})
  }, [user?.email])

  const update = (field: keyof ProfileForm, value: string) => {
    setProfile(current => ({ ...current, [field]: value }))
    setSaved(false)
    setError('')
  }

  const selectImage = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('image', String(reader.result))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!profile.name.trim() || !user?.email || !role) {
      setError('Name and a signed-in account are required.')
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, email: user.email, uid: user.uid, role })
      })
      if (!response.ok) throw new Error()
      setSaved(true)
      setError('')
    } catch {
      setError('Could not save profile. Make sure the backend and MySQL are running.')
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>👤 Profile</h1>
        <p>View and update your personal college details.</p>
      </div>
      <div className="glass-card" style={{ padding: 24, maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          {profile.image ? (
            <img src={profile.image} alt="Profile" style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 14 }} />
          ) : (
            <div className="avatar" style={{ width: 84, height: 84, fontSize: 24 }}>{profile.name.slice(0, 1).toUpperCase() || '?'}</div>
          )}
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{profile.name || 'Your profile'}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email || 'Demo account'} · {role || 'user'}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div className="input-group" style={{ margin: 0 }}>
            <label>Full name</label>
            <input className="input" value={profile.name} onChange={e => update('name', e.target.value)} />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label>Mobile number</label>
            <input className="input" value={profile.mobile} onChange={e => update('mobile', e.target.value)} />
          </div>
          {role === 'student' && (
            <div className="input-group" style={{ margin: 0 }}>
              <label>Roll number</label>
              <input className="input" value={profile.rollNo} onChange={e => update('rollNo', e.target.value)} />
            </div>
          )}
          <div className="input-group" style={{ margin: 0 }}>
            <label>Department</label>
            <select className="input" value={profile.department} onChange={e => update('department', e.target.value)}>
              {departments.map(department => <option key={department}>{department}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label>Branch / course</label>
            <input className="input" value={profile.branch} onChange={e => update('branch', e.target.value)} />
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label>Profile image</label>
            <input className="input" type="file" accept="image/*" onChange={e => selectImage(e.target.files?.[0])} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 22 }}>
          <button className="btn btn-primary" onClick={save}>Save Profile</button>
          {saved && <span style={{ color: 'var(--brand-secondary)', fontSize: 13 }}>✅ Profile details saved</span>}
          {error && <span style={{ color: 'var(--brand-accent)', fontSize: 13 }}>{error}</span>}
        </div>
      </div>
    </div>
  )
}
