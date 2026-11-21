import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/my-projects': 'My Projects',
  '/computer': 'My Computer',
  '/profile': 'Profile',
  '/settings': 'Settings',
}

export function Header() {
  const title = titles[useLocation().pathname] ?? 'Compute Commons'
  return (
    <header className="app-header">
      <div>
        <span>Compute Commons</span>
        <h1>{title}</h1>
      </div>
    </header>
  )
}
