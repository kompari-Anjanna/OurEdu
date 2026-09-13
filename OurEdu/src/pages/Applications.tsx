import { useState } from 'react'

type Application = { id: number; type: 'Bonafide Certificate' | 'ID Card'; status: 'Pending' | 'Approved' | 'Rejected'; date: string; qr?: string }

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([
    { id: 1, type: 'Bonafide Certificate', status: 'Approved', date: '12 Sep 2026' },
    { id: 2, type: 'ID Card', status: 'Pending', date: '13 Sep 2026' },
  ])

  const apply = (type: Application['type']) => {
    setApplications(current => [{ id: Date.now(), type, status: 'Pending', date: new Date().toLocaleDateString('en-IN') }, ...current])
  }

  return (
    <div className="fade-in">
      <div className="page-header"><h1>📄 Applications</h1><p>Request certificates and track student services.</p></div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={() => apply('Bonafide Certificate')}>📜 Request Bonafide Certificate</button>
        <button className="btn btn-secondary" onClick={() => apply('ID Card')}>🪪 Apply for ID Card</button>
      </div>
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Application Status</h3>
        <div className="table-wrap"><table><thead><tr><th>Request</th><th>Applied</th><th>Status</th><th>Digital copy</th></tr></thead><tbody>
          {applications.map(application => <tr key={application.id}><td>{application.type}</td><td>{application.date}</td><td><span className={`badge ${application.status === 'Approved' ? 'badge-green' : application.status === 'Rejected' ? 'badge-red' : 'badge-gold'}`}>{application.status}</span></td><td>{application.status === 'Approved' ? <button className="btn btn-secondary btn-sm" onClick={() => alert(application.type === 'ID Card' ? 'QR-enabled ID card will open here.' : 'Bonafide certificate download will open here.')}>{application.type === 'ID Card' ? 'View QR ID' : 'Download'}</button> : 'Under review'}</td></tr>)}
        </tbody></table></div>
      </div>
    </div>
  )
}
