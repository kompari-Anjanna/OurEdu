import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth, UserRole } from '../App'

const ROLES: { id: UserRole; label: string; icon: string }[] = [
  { id: 'student', label: 'Student',  icon: '📚' },
  { id: 'faculty', label: 'Faculty',  icon: '👨‍🏫' },
  { id: 'admin',   label: 'Admin',    icon: '⚙️' },
]

export default function Login() {
  const { setRole, setUser, setDemoMode } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loginWithEmail = async () => {
    if (!email.trim()) { setError('Please enter your email'); return }
    if (!password.trim()) { setError('Please enter your password'); return }

    setError('')
    setLoading(true)

    try {
      if (!auth) {
        throw new Error('Firebase is not configured. Please use the Demo Account to continue.')
      }

      const result = await signInWithEmailAndPassword(auth, email.trim(), password)
      setUser(result.user)
      setRole(selectedRole)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Demo login — bypasses Firebase for development
  const demoLogin = () => {
    const demoUser = {
      uid: 'demo-user',
      phoneNumber: null,
      email: 'demo@ouredu.com',
      displayName: selectedRole,
    } as unknown as import('firebase/auth').User

    setUser(demoUser)
    setRole(selectedRole)
    setDemoMode(true)
  }

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-bg">
        <div className="login-bg-blob blob-1" />
        <div className="login-bg-blob blob-2" />
        <div className="login-bg-blob blob-3" />
      </div>

      <div className="login-card fade-in">
        {/* Logo */}
        <div className="login-logo">
          <img className="login-logo-image" src="/ouredu-logo.svg" alt="OurEdu College Portal" />
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your college portal</p>

        {/* Role Selector */}
        <div className="role-tabs">
          {ROLES.map(r => (
            <button
              key={r.id}
              className={`role-tab${selectedRole === r.id ? ' active' : ''}`}
              onClick={() => setSelectedRole(r.id)}
            >
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        <>
          <div className="input-group">
            <label htmlFor="email-input">Email</label>
            <div className="input-prefix">
              <input
                id="email-input"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loginWithEmail()}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginTop: 16 }}>
            <label htmlFor="password-input">Password</label>
            <div className="input-prefix">
              <input
                id="password-input"
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loginWithEmail()}
              />
            </div>
          </div>

          {error && <p style={{ color: 'var(--brand-accent)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            id="login-btn"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
            onClick={loginWithEmail}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Login →'}
          </button>

          <div className="login-divider">or</div>
          <button className="demo-btn" onClick={demoLogin}>
            🚀 Continue with Demo Account
          </button>
        </>
      </div>
    </div>
  )
}

