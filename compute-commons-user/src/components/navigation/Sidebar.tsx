import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Overview', to: '/dashboard' },
  { label: 'Discover Projects', to: '/projects' },
  { label: 'My Projects', to: '/my-projects' },
  { label: 'My Computer', to: '/computer' },
  { label: 'Profile', to: '/profile' },
  { label: 'Settings', to: '/settings' },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">C</span>
        <strong>Compute Commons</strong>
      </div>
      <nav aria-label="Primary navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
