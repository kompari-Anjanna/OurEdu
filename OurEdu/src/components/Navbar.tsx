import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, UserRole } from '../App'

interface NavItem {
  to: string
  icon: string
  label: string
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { to: '/dashboard',  icon: '⊞',  label: 'Dashboard',  roles: ['student', 'admin'] },
  { to: '/dashboard',  icon: '⌂',  label: 'Home',       roles: ['faculty'] },
  { to: '/attendance', icon: '📅', label: 'Attendance',  roles: ['student', 'faculty', 'admin'] },
  { to: '/fees',       icon: '💳', label: 'Fees',        roles: ['student', 'admin'] },
  { to: '/applications', icon: '📄', label: 'Applications', roles: ['student'] },
  { to: '/academic',   icon: '🗓', label: 'Timetable',   roles: ['student'] },
  { to: '/academic',   icon: '📝', label: 'Exams & Results', roles: ['student'] },
  { to: '/academic',   icon: '📚', label: 'Assignments', roles: ['student'] },
  { to: '/students',   icon: '👥', label: 'Students',    roles: ['faculty', 'admin'] },
  { to: '/faculty',    icon: '🎓', label: 'Faculty',     roles: ['admin'] },
  { to: '/marks',      icon: '📊', label: 'Marks',       roles: ['faculty'] },
  { to: '/assignments', icon: '📚', label: 'Assignments', roles: ['faculty'] },
  { to: '/exams',      icon: '📝', label: 'Exams',       roles: ['faculty'] },
  { to: '/notifications', icon: '🔔', label: 'Notifications', roles: ['faculty'] },
  { to: '/profile',    icon: '👤', label: 'Profile',     roles: ['student', 'faculty', 'admin'] },
]

export default function Navbar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.phoneNumber
    ? user.phoneNumber.slice(-4)
    : (user?.email?.slice(0, 2).toUpperCase() ?? 'U')

  const visibleItems = navItems.filter(item => role && item.roles.includes(role))

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img className="sidebar-logo-image" src="/ouredu-logo.svg" alt="OurEdu" />
      </div>

      {/* Nav Section */}
      <span className="sidebar-section-label">Navigation</span>
      {visibleItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.phoneNumber ?? user?.email ?? 'Demo User'}</div>
            <div className="sidebar-user-role">{role ?? 'Guest'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>↩</span> Sign Out
        </button>
        <div className="developer-credit">Developed by Anji Patel</div>
      </div>
    </nav>
  )
}
