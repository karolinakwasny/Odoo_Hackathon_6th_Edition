import { IconGridDots, IconUser } from '@tabler/icons-react'
import { NavLink, Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <NavLink to="/projects" className="app-brand">
          <span className="brand-mark">C</span>
          <strong>Compute Commons</strong>
        </NavLink>
        <nav className="top-navigation" aria-label="Main navigation">
          <NavLink to="/projects" className={({ isActive }) => isActive ? 'top-nav active' : 'top-nav'}>
            <IconGridDots size={17} /> Projects
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => isActive ? 'top-nav active' : 'top-nav'}>
            <IconUser size={17} /> Account
          </NavLink>
        </nav>
      </header>
      <main className="app-main"><Outlet /></main>
    </div>
  )
}
