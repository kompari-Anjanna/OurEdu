import type { ReactNode } from 'react'

const timetable = [
  ['Monday', 'Data Structures', '09:00 - 10:00'], ['Tuesday', 'Operating Systems', '10:00 - 11:00'],
  ['Wednesday', 'DBMS', '11:00 - 12:00'], ['Thursday', 'Computer Networks', '09:00 - 10:00'],
]
const exams = [
  { subject: 'Data Structures', date: '20 Sep 2026', result: '88 / 100' },
  { subject: 'Operating Systems', date: '23 Sep 2026', result: 'Pending' },
]
const assignments = [
  { subject: 'DBMS', title: 'Normalization case study', deadline: '18 Sep 2026' },
  { subject: 'Computer Networks', title: 'Routing protocols report', deadline: '25 Sep 2026' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <div className="glass-card" style={{ padding: 24, marginBottom: 18 }}><h3 style={{ marginBottom: 16 }}>{title}</h3>{children}</div>
}

export default function StudentHub() {
  return <div className="fade-in">
    <div className="page-header"><h1>📚 Academic Hub</h1><p>Timetable changes, exams, results and assignment deadlines.</p></div>
    <Section title="🗓 Timetable Changes"><div className="table-wrap"><table><thead><tr><th>Day</th><th>Subject</th><th>Time slot</th></tr></thead><tbody>{timetable.map(row => <tr key={row[0]}>{row.map(cell => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></Section>
    <Section title="📝 Exam Schedules & Results"><div className="table-wrap"><table><thead><tr><th>Subject</th><th>Exam date</th><th>Result</th></tr></thead><tbody>{exams.map(exam => <tr key={exam.subject}><td>{exam.subject}</td><td>{exam.date}</td><td><span className={`badge ${exam.result === 'Pending' ? 'badge-gold' : 'badge-green'}`}>{exam.result}</span></td></tr>)}</tbody></table></div></Section>
    <Section title="⏰ Assignment Deadlines"><div className="table-wrap"><table><thead><tr><th>Subject</th><th>Assignment</th><th>Deadline</th></tr></thead><tbody>{assignments.map(assignment => <tr key={assignment.title}><td>{assignment.subject}</td><td>{assignment.title}</td><td>{assignment.deadline}</td></tr>)}</tbody></table></div></Section>
  </div>
}
