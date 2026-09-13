import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import StatsCard from '../components/StatsCard'
import { API_BASE_URL } from '../config'

const studentStats = [
  { icon: '📅', label: 'Attendance',    value: '87%',  sub: 'This semester',    color: 'green'  as const },
  { icon: '💳', label: 'Fees Due',      value: '₹0',   sub: 'All paid',         color: 'purple' as const },
  { icon: '📚', label: 'Subjects',      value: '6',    sub: 'Enrolled',         color: 'gold'   as const },
  { icon: '🏆', label: 'CGPA',          value: '8.4',  sub: 'Current semester', color: 'green'  as const },
]

const facultyStats = [
  { icon: '👥', label: 'Students',      value: '128',  sub: 'Across classes',   color: 'purple' as const },
  { icon: '📅', label: 'Classes Today', value: '4',    sub: 'Scheduled',        color: 'green'  as const },
  { icon: '📝', label: 'Pending Tasks', value: '3',    sub: 'Grading',          color: 'gold'   as const },
  { icon: '⭐', label: 'Avg Rating',    value: '4.8',  sub: 'By students',      color: 'green'  as const },
]

const adminStats = [
  { icon: '👥', label: 'Total Students', value: '1,240', sub: 'Enrolled',        color: 'purple' as const },
  { icon: '🎓', label: 'Faculty',        value: '68',    sub: 'Active',          color: 'green'  as const },
  { icon: '💰', label: 'Fees Collected', value: '₹42L',  sub: 'This semester',   color: 'gold'   as const },
  { icon: '⚠️', label: 'Alerts',         value: '5',     sub: 'Need attention',  color: 'red'    as const },
]

const recentActivity = [
  { icon: '📅', text: 'Attendance marked for CS-301',       time: '10 min ago' },
  { icon: '💳', text: 'Fee payment received from Ravi K.',  time: '1 hr ago'   },
  { icon: '👤', text: 'New student enrolled: Priya S.',     time: '3 hr ago'   },
  { icon: '📢', text: 'Notice: Exam schedule published',    time: 'Yesterday'  },
]

const upcomingEvents = [
  { date: '15 Sep', event: 'Mid-semester Exams begin',   color: '#FF6584' },
  { date: '18 Sep', event: 'Last date for fee payment',  color: '#FFD166' },
  { date: '22 Sep', event: 'Faculty Development Program', color: '#43D9AD' },
  { date: '01 Oct', event: 'College Annual Day',          color: '#6C63FF' },
]

export default function Dashboard() {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [profileName, setProfileName] = useState('')

  useEffect(() => {
    if (!user?.email) return
    fetch(`${API_BASE_URL}/profiles?email=${encodeURIComponent(user.email)}`)
      .then(response => response.ok ? response.json() : null)
      .then(profile => {
        if (profile?.name) setProfileName(profile.name)
      })
      .catch(() => {})
  }, [user?.email])

  const stats = role === 'admin' ? adminStats : role === 'faculty' ? facultyStats : studentStats
  const userName = profileName || user?.displayName || user?.phoneNumber || 'User'

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <h2>{greet()}, {userName} 👋</h2>
        <p>Here's what's happening at your college today.</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {role === 'faculty' && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/attendance')}>
              📅 Mark Attendance
            </button>
          )}
          {(role === 'student' || role === 'admin') && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/fees')}>
              💳 View Fees
            </button>
          )}
          {role === 'admin' && (
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/students')}>
              👥 Manage Students
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>

      {/* Two-column section */}
      <div className="dashboard-sections">
        {/* Recent Activity */}
        <div className="glass-card section-card">
          <h3>🔔 Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--bg-glass)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                }}>{item.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.text}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-card section-card">
          <h3>📆 Upcoming Events</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingEvents.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, flexShrink: 0, textAlign: 'center',
                  background: 'var(--bg-glass)', borderRadius: 10, padding: '6px 4px',
                  borderLeft: `3px solid ${ev.color}`
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1 }}>
                    {ev.date.split(' ')[1]}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: ev.color }}>
                    {ev.date.split(' ')[0]}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{ev.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
