const notifications = [
  { title: 'Exam schedule published', detail: 'Mid-semester exams begin on 20 Sep 2026.', time: 'Today', kind: 'Important' },
  { title: 'Assignment deadline reminder', detail: 'DBMS normalization case study is due on 18 Sep.', time: 'Yesterday', kind: 'Reminder' },
  { title: 'Timetable updated', detail: 'Thursday Computer Networks class moved to 09:00.', time: '2 days ago', kind: 'Update' },
]

export default function Notifications() {
  return <div className="fade-in"><div className="page-header"><h1>🔔 Notifications</h1><p>Stay updated with college announcements and changes.</p></div><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{notifications.map(notification => <div key={notification.title} className="glass-card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}><div><h3 style={{ fontSize: 15, marginBottom: 5 }}>{notification.title}</h3><p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{notification.detail}</p></div><div style={{ textAlign: 'right', flexShrink: 0 }}><span className="badge badge-blue">{notification.kind}</span><div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 6 }}>{notification.time}</div></div></div>)}</div></div>
}
