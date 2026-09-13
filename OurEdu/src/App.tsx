import { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Fees from './pages/Fees'
import Students from './pages/Students'
import Faculty from './pages/Faculty'
import Profile from './pages/Profile'
import Applications from './pages/Applications'
import StudentHub from './pages/StudentHub'
import StaffWorkspace from './pages/StaffWorkspace'
import Notifications from './pages/Notifications'
import Navbar from './components/Navbar'
import LoadingSpinner from './components/LoadingSpinner'

export type UserRole = 'student' | 'faculty' | 'admin'

interface AuthContextType {
  user: User | null
  role: UserRole | null
  isDemo: boolean
  setUser: (user: User | null) => void
  setRole: (role: UserRole) => void
  setDemoMode: (value: boolean) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isDemo: false,
  setUser: () => {},
  setRole: () => {},
  setDemoMode: () => {},
  logout: () => {}
})

export const useAuth = () => useContext(AuthContext)

function ProtectedLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/students" element={<Students />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/academic" element={<StudentHub />} />
          <Route path="/marks" element={<StaffWorkspace section="marks" />} />
          <Route path="/assignments" element={<StaffWorkspace section="assignments" />} />
          <Route path="/exams" element={<StaffWorkspace section="exams" />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u && !isDemo) setRole(null)
      setLoading(false)
    })
    return unsub
  }, [isDemo])

  const logout = async () => {
    if (auth) await auth.signOut()
    setUser(null)
    setRole(null)
    setIsDemo(false)
  }

  const isAuthenticated = !!user || isDemo

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <AuthContext.Provider value={{ user, role, isDemo, setUser, setRole, setDemoMode: setIsDemo, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/*" element={isAuthenticated ? <ProtectedLayout /> : <Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
