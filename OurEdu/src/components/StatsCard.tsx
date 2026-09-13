interface StatsCardProps {
  icon: string
  label: string
  value: string | number
  sub?: string
  color?: 'purple' | 'green' | 'red' | 'gold'
}

const colorMap = {
  purple: 'rgba(108,99,255,0.15)',
  green:  'rgba(67,217,173,0.15)',
  red:    'rgba(255,101,132,0.15)',
  gold:   'rgba(255,209,102,0.15)',
}
const textColorMap = {
  purple: '#6C63FF',
  green:  '#43D9AD',
  red:    '#FF6584',
  gold:   '#FFD166',
}

export default function StatsCard({ icon, label, value, sub, color = 'purple' }: StatsCardProps) {
  return (
    <div className="glass-card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: colorMap[color],
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: textColorMap[color], letterSpacing: '-1px', marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: sub ? 2 : 0 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}
