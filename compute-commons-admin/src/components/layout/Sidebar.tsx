import {
  IconLayoutDashboard,
  IconFolders,
  IconMap,
  IconActivity,
  IconSettings,
  IconLeaf,
} from "@tabler/icons-react"
import { NavLink } from "react-router-dom"

const navigation = [
  { label: "Overview", icon: IconLayoutDashboard, to: "/" },
  { label: "Projects", icon: IconFolders, to: "/projects" },
  { label: "Network", icon: IconMap, to: "/network" },
  { label: "Simulation", icon: IconActivity, to: "/simulation" },
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
        {navigation.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={19} stroke={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item">
          <IconSettings size={19} stroke={1.8} />
          Settings
        </button>

        
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