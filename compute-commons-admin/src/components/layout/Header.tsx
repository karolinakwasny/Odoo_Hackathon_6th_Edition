import { IconBell, IconChevronDown } from "@tabler/icons-react"

export function Header() {
  return (
    <header className="header">
      <div>
        <span className="breadcrumb">Workspace / Overview</span>
        <h1>Network overview</h1>
        <p>Monitor your distributed computing network.</p>
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