import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'My Projects', to: '/my-projects' },
  { label: 'Discover Projects', to: '/projects' },
  { label: 'My Computer', to: '/computer' },
  { label: 'Profile', to: '/profile' },
  { label: 'Settings', to: '/settings' },
]

export function Sidebar() {
  return (
    <>
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
        <div className="sidebar-profile">
          <span>CC</span>
          <div><strong>Contributor</strong><small>Local profile</small></div>
        </div>
      </aside>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
          >
            {item.label === 'Discover Projects' ? 'Projects' : item.label === 'My Computer' ? 'Computer' : item.label === 'My Projects' ? 'My work' : item.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
