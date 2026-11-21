import { dashboardStats } from "../../mocks/dashboard"
import { StatCard } from "./StatCard"
import { SchedulerFeed } from "./SchedulerFeed"
import { IconArrowUpRight, IconMapPin } from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"

export function OverviewPage() {
  const navigate = useNavigate()
  return (
    <>
      <div className="welcome-row">
        <div>
          <h2>Good morning, Administrator</h2>
          <p>Here's what's happening across your network.</p>
        </div>

        <button className="primary-button" onClick={() => navigate('/projects')}>
          + New project
        </button>
      </div>

      <div className="stats-grid">
        {dashboardStats.map((stat) => (
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
              <strong>128</strong>
              <span>Connected nodes</span>
            </div>
          </div>
        </section>

        <SchedulerFeed />
      </div>
    </>
  )
}