import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { OverviewPage } from '../features/network/OverviewPage'
import { ProjectsPage } from '../features/projects/ProjectsPage'
import { ProjectDetailsPage } from '../features/projects/ProjectDetailsPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="owner-shell">
        <header className="owner-header">
          <NavLink to="/" className="owner-brand"><span>CC</span><strong>Compute Commons</strong></NavLink>
          <nav>
            <NavLink to="/">Overview</NavLink>
            <NavLink to="/projects">Projects</NavLink>
          </nav>
          <div className="owner-status"><span />PROJECT OWNER</div>
        </header>
        <main className="owner-main">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
