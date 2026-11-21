import { dashboardStats } from "../../mocks/dashboard"
import { StatCard } from "./StatCard"
import { SchedulerFeed } from "./SchedulerFeed"
import { IconArrowUpRight, IconMapPin } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import { useHubProgress } from "../../hooks/useHubProgress"

export function OverviewPage() {
  const navigate = useNavigate()
  const progress = useHubProgress()
  const nodes = progress?.nodes_online ?? 0
  const chunks = progress?.projects[0]
  const stats = dashboardStats.map((stat) => {
    if (stat.icon === 'nodes') {
      return { ...stat, value: String(nodes), change: 'workers connected' }
    }
    if (stat.icon === 'tasks') {
      return { ...stat, label: 'Chunks processed', value: `${chunks?.done ?? 0} / ${chunks?.total ?? 0}`, change: `${chunks?.running ?? 0} running` }
    }
    return stat
    })
  
  return (
    <>
      <div className="welcome-row">
        <div>
          <h2>Good morning, Administrator</h2>
          <p>Here's what's happening across your network.</p>
        </div>

        
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel network-panel">
          <div className="panel-heading">
            <div>
              <h2>Network distribution</h2>
              <p>Connected computing nodes across Europe</p>
            </div>

            <button className="text-button">
              View network <IconArrowUpRight size={16} />
            </button>
          </div>

          <div className="map-placeholder">
            <div className="map-overlay">
              <IconMapPin size={18} />
              <span>Interactive network map</span>
            </div>
            <div className="map-stat">
              <strong>{nodes}</strong>
              <span>Connected nodes</span>
            </div>
          </div>
        </section>

        <SchedulerFeed />
      </div>
    </>
  )
}