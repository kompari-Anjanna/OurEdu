import { useState } from 'react'

const content = {
  marks: { title: '📊 Marks', description: 'Enter and review student marks.', columns: ['Student', 'Subject', 'Marks', 'Status'], rows: [['Anji Patel', 'Data Structures', '88 / 100', 'Published'], ['Rushanth Yadav', 'Operating Systems', 'Pending', 'Draft']] },
  assignments: { title: '📚 Assignments', description: 'Publish assignments and monitor deadlines.', columns: ['Subject', 'Assignment', 'Deadline', 'Submissions'], rows: [['DBMS', 'Normalization case study', '18 Sep 2026', '24 / 40'], ['Networks', 'Routing protocols report', '25 Sep 2026', '12 / 40']] },
  exams: { title: '📝 Exams', description: 'Manage exam schedules and results.', columns: ['Subject', 'Department', 'Date', 'Time'], rows: [['Data Structures', 'Computer Science', '20 Sep 2026', '09:00'], ['Operating Systems', 'Computer Science', '23 Sep 2026', '10:00']] },
} as const

export default function StaffWorkspace({ section }: { section: keyof typeof content }) {
  const page = content[section]
  const [notice, setNotice] = useState('')
  return <div className="fade-in">
    <div className="page-header"><h1>{page.title}</h1><p>{page.description}</p></div>
    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}><button className="btn btn-primary btn-sm" onClick={() => setNotice(`${page.title.slice(2)} action is ready.`)}>+ Add new</button>{notice && <span style={{ color: 'var(--brand-secondary)', fontSize: 13, alignSelf: 'center' }}>✅ {notice}</span>}</div>
    <div className="glass-card" style={{ padding: 24 }}><div className="table-wrap"><table><thead><tr>{page.columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{page.rows.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></div>
  </div>
}
