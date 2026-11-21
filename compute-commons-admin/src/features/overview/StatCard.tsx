import {
  IconCpu,
  IconListCheck,
  IconLeaf,
  IconBolt,
} from "@tabler/icons-react"

const icons = {
  nodes: IconCpu,
  tasks: IconListCheck,
  energy: IconLeaf,
  power: IconBolt,
}

interface Props {
  label: string
  value: string
  change: string
  icon: keyof typeof icons
  color: string
}

export function StatCard({
  label,
  value,
  change,
  icon,
  color,
}: Props) {
  const Icon = icons[icon]

  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={20} stroke={1.8} />
        </div>
      </div>

      <strong className="stat-value">{value}</strong>
      <span className="stat-change">{change}</span>
    </div>
  )
}