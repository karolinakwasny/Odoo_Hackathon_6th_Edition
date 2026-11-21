import { Outlet } from 'react-router-dom'
import { Sidebar } from '../navigation/Sidebar'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
