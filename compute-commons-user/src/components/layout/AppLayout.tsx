import { Outlet } from 'react-router-dom'
import { Sidebar } from '../navigation/Sidebar'

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
