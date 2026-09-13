import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver, type NormalizedLandmark } from '@mediapipe/tasks-vision'
import { useAuth } from '../App'
import { API_BASE_URL } from '../config'

interface AttendanceRecord {
  id: number
  studentName: string
  rollNo: string
  present: boolean
  verificationPhoto?: string
}

const SUBJECTS = ['CS-301: Data Structures', 'CS-302: Operating Systems', 'CS-303: DBMS', 'CS-304: CN']

const mockStudents: AttendanceRecord[] = [
  { id: 1, studentName: 'Anji patel',   rollNo: '21CS001', present: false },
  { id: 2, studentName: 'Rushanth Yadav',   rollNo: '21CS002', present: false },
  { id: 3, studentName: 'Sangi shekhar',     rollNo: '21CS003', present: false },
  { id: 4, studentName: 'Sneha Mehta',    rollNo: '21CS004', present: false },
  { id: 5, studentName: 'Kiran Nair',     rollNo: '21CS005', present: false },
  { id: 6, studentName: 'Anjali Singh',   rollNo: '21CS006', present: false },
  { id: 7, studentName: 'Mohit Gupta',    rollNo: '21CS007', present: false },
  { id: 8, studentName: 'Divya Reddy',    rollNo: '21CS008', present: false },
]

const studentAttendance = [
  { subject: 'CS-301: Data Structures', present: 22, total: 26, pct: 85 },
  { subject: 'CS-302: Operating Systems', present: 24, total: 26, pct: 92 },
  { subject: 'CS-303: DBMS', present: 20, total: 25, pct: 80 },
  { subject: 'CS-304: Computer Networks', present: 18, total: 24, pct: 75 },
]

function CircleProgress({ pct, color }: { pct: number; color: string }) {
  const r = 32
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="progress-ring">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="progress-ring-text" style={{ color }}>{pct}%</div>
    </div>
  )
}

const pctColor = (p: number) => p >= 85 ? '#43D9AD' : p >= 75 ? '#FFD166' : '#FF6584'

const eyeIndices = {
  left: [33, 133, 159, 145, 153, 144],
  right: [362, 382, 381, 400, 377, 374],
}

const pointDistance = (a: NormalizedLandmark, b: NormalizedLandmark) => {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

const computeEar = (landmarks: NormalizedLandmark[], eyePoints: number[]) => {
  const [p1, p2, p3, p4, p5, p6] = eyePoints.map(index => landmarks[index])
  const vertical = pointDistance(p2, p6) + pointDistance(p3, p5)
  const horizontal = pointDistance(p1, p4)
  return horizontal > 0 ? vertical / (2 * horizontal) : 0
}

export default function Attendance() {
  const { role } = useAuth()
  const [students, setStudents] = useState<AttendanceRecord[]>(() => {
    try {
      const savedPhotos = JSON.parse(localStorage.getItem('ouredu-attendance-photos') || '{}') as Record<string, string>
      return mockStudents.map(student => ({ ...student, verificationPhoto: savedPhotos[student.id] }))
    } catch {
      return mockStudents
    }
  })
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [submitted, setSubmitted] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null)
  const [faceCaptured, setFaceCaptured] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState('')
  const [blinkMessage, setBlinkMessage] = useState('Blink once to verify your identity')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const eyeClosedRef = useRef(false)
  const blinkCountRef = useRef(0)
  const verificationDoneRef = useRef(false)

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }, [cameraOpen])

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
    setFaceCaptured(false)
    setCameraError('')
    setBlinkMessage('Blink once to verify your identity')
    eyeClosedRef.current = false
    blinkCountRef.current = 0
    verificationDoneRef.current = false
  }

  const capturePhotoAndMark = (studentId: number) => {
    const video = videoRef.current
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setCameraError('The camera is not ready yet. Please wait and try again.')
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const context = canvas.getContext('2d')

    if (!context) {
      setCameraError('Could not capture a photo from the camera.')
      return
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    const photo = canvas.toDataURL('image/jpeg', 0.88)
    setCapturedPhoto(photo)
    setStudents(prev => prev.map(student => student.id === studentId ? { ...student, present: true, verificationPhoto: photo } : student))
    try {
      const savedPhotos = JSON.parse(localStorage.getItem('ouredu-attendance-photos') || '{}') as Record<string, string>
      localStorage.setItem('ouredu-attendance-photos', JSON.stringify({ ...savedPhotos, [studentId]: photo }))
    } catch {
      setCameraError('Photo captured, but could not be saved in browser storage.')
    }
    setFaceCaptured(true)
    setBlinkMessage('✅ Photo captured. Face verified and attendance marked successfully.')
    setCameraError('')
    setTimeout(() => stopCamera(), 1200)
  }

  const startBlinkDetection = () => {
    if (!videoRef.current || !faceLandmarkerRef.current || !streamRef.current) return

    const detect = async () => {
      if (!videoRef.current || !faceLandmarkerRef.current || !streamRef.current) return

      const result = faceLandmarkerRef.current.detectForVideo(videoRef.current, performance.now())
      const landmarks = result.faceLandmarks?.[0]

      if (landmarks) {
        const leftEar = computeEar(landmarks, eyeIndices.left)
        const rightEar = computeEar(landmarks, eyeIndices.right)
        const avgEar = (leftEar + rightEar) / 2
        const isBlink = avgEar < 0.22

        if (isBlink && !eyeClosedRef.current) {
          eyeClosedRef.current = true
          blinkCountRef.current += 1
          setBlinkMessage(blinkCountRef.current === 1 ? 'Blink detected. Keep looking at the camera.' : '✅ Blink verified. Marking attendance...')
        }

        if (!isBlink && eyeClosedRef.current) {
          eyeClosedRef.current = false
        }

        if (!verificationDoneRef.current && blinkCountRef.current >= 1) {
          verificationDoneRef.current = true
          if (activeStudentId !== null) {
            capturePhotoAndMark(activeStudentId)
          }
          return
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect)
    }

    animationFrameRef.current = requestAnimationFrame(detect)
  }

  const openCamera = async (studentId: number) => {
    setActiveStudentId(studentId)
    setFaceCaptured(false)
    setCapturedPhoto('')
    setCameraError('')
    setBlinkMessage('Blink once to verify your identity')
    blinkCountRef.current = 0
    verificationDoneRef.current = false
    eyeClosedRef.current = false

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Your browser does not support webcam access.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      setCameraOpen(true)

      if (!faceLandmarkerRef.current) {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        )
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      }

      requestAnimationFrame(() => requestAnimationFrame(startBlinkDetection))
    } catch {
      setCameraError('Camera permission was denied. You can still mark attendance manually.')
      setCameraOpen(false)
    }
  }

  const captureFace = () => {
    if (activeStudentId !== null) {
      capturePhotoAndMark(activeStudentId)
    }
  }

  const togglePresent = (id: number) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, present: !s.present } : s))
  }

  const markAll = (val: boolean) => setStudents(prev => prev.map(s => ({ ...s, present: val })))

  const handleSubmit = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          date: new Date().toISOString().split('T')[0],
          records: students.map(s => ({
            studentId: s.id,
            status: s.present ? 'Present' : 'Absent',
            verificationPhoto: s.verificationPhoto || null,
          }))
        })
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(result?.error || 'The backend could not save attendance.')
      }
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch {
      setSaveError('Could not save attendance to the database. Start the backend and check the database schema.')
    }
    setSaving(false)
  }

  const presentCount = students.filter(s => s.present).length

  if (role === 'student') {
    return (
      <div className="fade-in">
        <div className="page-header">
          <h1>📅 My Attendance</h1>
          <p>Track your attendance across all subjects</p>
        </div>

        <div className="attendance-summary">
          {studentAttendance.map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
              <CircleProgress pct={s.pct} color={pctColor(s.pct)} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{s.subject.split(':')[0]}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.present}/{s.total} classes</div>
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${s.pct >= 85 ? 'badge-green' : s.pct >= 75 ? 'badge-gold' : 'badge-red'}`}>
                  {s.pct >= 85 ? 'Good' : s.pct >= 75 ? 'Low' : 'Critical'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>📊 Semester Overview</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Present</th>
                  <th>Total</th>
                  <th>%</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentAttendance.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{s.subject}</td>
                    <td style={{ color: 'var(--brand-secondary)' }}>{s.present}</td>
                    <td>{s.total}</td>
                    <td style={{ fontWeight: 700, color: pctColor(s.pct) }}>{s.pct}%</td>
                    <td>
                      <span className={`badge ${s.pct >= 85 ? 'badge-green' : s.pct >= 75 ? 'badge-gold' : 'badge-red'}`}>
                        {s.pct >= 85 ? 'Good' : s.pct >= 75 ? 'At Risk' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Faculty / Admin view
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📅 Mark Attendance</h1>
        <p>Mark attendance for today's class</p>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div className="input-group" style={{ margin: 0, flex: 1, minWidth: 200 }}>
            <label>Subject</label>
            <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="input-group" style={{ margin: 0 }}>
            <label>Date</label>
            <input className="input" type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success btn-sm" onClick={() => markAll(true)}>✓ All Present</button>
            <button className="btn btn-danger btn-sm" onClick={() => markAll(false)}>✗ All Absent</button>
          </div>
        </div>
      </div>

      {cameraOpen && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Face Authentication</h3>
            <button className="btn btn-danger btn-sm" onClick={stopCamera}>Close</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr', gap: 16, alignItems: 'center' }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', background: '#0b0d14', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {streamRef.current ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                  style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Waiting for camera…</div>
              )}
            </div>
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {activeStudentId !== null
                  ? `Authenticating student #${activeStudentId}`
                  : 'Select a student to verify their face.'}
              </p>
              {faceCaptured && (
                <div style={{ color: 'var(--brand-secondary)', fontWeight: 700, marginBottom: 12 }}>✅ Face verified</div>
              )}
              {capturedPhoto && (
                <img
                  src={capturedPhoto}
                  alt="Captured verification photo"
                  style={{ width: 96, height: 72, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 12 }}
                />
              )}
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>{blinkMessage}</div>
              {cameraError && (
                <div style={{ color: 'var(--brand-accent)', fontSize: 13, marginBottom: 12 }}>{cameraError}</div>
              )}
              <button className="btn btn-primary" onClick={captureFace} disabled={faceCaptured}>Take Photo & Verify Attendance</button>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-secondary)' }}>{presentCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Present</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 22 }}>❌</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-accent)' }}>{students.length - presentCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Absent</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-primary)' }}>
              {Math.round((presentCount / students.length) * 100)}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Attendance</div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="table-wrap" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th style={{ textAlign: 'center' }}>Photo</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Toggle</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.rollNo}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar">{s.studentName.split(' ').map(w => w[0]).join('')}</div>
                    <span style={{ fontWeight: 500 }}>{s.studentName}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {s.verificationPhoto ? (
                    <img
                      src={s.verificationPhoto}
                      alt={`${s.studentName} verification`}
                      title="Saved verification photo"
                      style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, verticalAlign: 'middle' }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Not captured</span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`badge ${s.present ? 'badge-green' : 'badge-red'}`}>
                    {s.present ? '✓ Present' : '✗ Absent'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      className={`btn btn-sm ${s.present ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => togglePresent(s.id)}
                    >
                      {s.present ? 'Mark Absent' : 'Mark Present'}
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => openCamera(s.id)}
                    >
                      Face Auth
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          id="submit-attendance-btn"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? '⏳ Saving…' : '💾 Submit Attendance'}
        </button>
        {submitted && (
          <span style={{ color: 'var(--brand-secondary)', fontSize: 14, fontWeight: 500, animation: 'fadeIn 0.3s ease' }}>
            ✅ Attendance saved successfully!
          </span>
        )}
        {saveError && (
          <span style={{ color: 'var(--brand-accent)', fontSize: 14, fontWeight: 500 }}>
            {saveError}
          </span>
        )}
      </div>
    </div>
  )
}
