import { IconBell, IconChevronDown } from "@tabler/icons-react"
import { useLocation } from "react-router-dom"

export function Header() {
  const { pathname } = useLocation()
  const page = pathname.startsWith('/projects') ? 'Projects' : pathname.startsWith('/network') ? 'Network' : pathname.startsWith('/simulation') ? 'Simulation' : 'Overview'
  const descriptions: Record<string, string> = {
    Overview: 'Monitor your distributed computing network.',
    Projects: 'Plan and monitor distributed research workloads.',
    Network: 'Explore the distributed computing network.',
    Simulation: 'Model network and renewable energy scenarios.',
  }
  return (
    <header className="header">
      <div>
        <span className="breadcrumb">Workspace / {page}</span>
        <h1>{page}</h1>
        <p>{descriptions[page]}</p>
      </div>

      <div className="header-actions">
        <div className="simulation-status">
          <span className="pulse-dot" />
          Simulation running
        </div>

        <button className="icon-button" aria-label="Notifications">
          <IconBell size={20} />
          <span className="notification-dot" />
        </button>

        <button className="date-button">
          Today <IconChevronDown size={15} />
        </button>
      </div>
    </header>
  )
}