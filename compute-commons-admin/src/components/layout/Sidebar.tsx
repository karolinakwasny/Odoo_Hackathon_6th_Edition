import {
  IconLayoutDashboard,
  IconFolders,
  IconMap,
  IconActivity,
  IconSettings,
  IconLeaf,
} from "@tabler/icons-react"

const navigation = [
  { label: "Overview", icon: IconLayoutDashboard, active: true },
  { label: "Projects", icon: IconFolders },
  { label: "Network", icon: IconMap },
  { label: "Simulation", icon: IconActivity },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <IconLeaf size={23} />
        </div>
        <div>
          <strong>Compute Commons</strong>
          <span>Distributed computing</span>
        </div>
      </div>

      <div className="nav-label">WORKSPACE</div>

      <nav>
        {navigation.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            className={`nav-item ${active ? "active" : ""}`}
          >
            <Icon size={19} stroke={1.8} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item">
          <IconSettings size={19} stroke={1.8} />
          Settings
        </button>

        <div className="environment-card">
          <IconLeaf size={20} />
          <strong>Computing for a better future</strong>
          <span>Shared resources. Smarter energy.</span>
        </div>

        <div className="profile">
          <div className="avatar">AD</div>
          <div>
            <strong>Administrator</strong>
            <span>Network manager</span>
          </div>
        </div>
      </div>
    </aside>
  )
}