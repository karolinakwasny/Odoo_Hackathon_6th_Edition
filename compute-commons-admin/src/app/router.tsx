import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { OverviewPage } from '../features/overview/OverviewPage'
import { ProjectsPage } from '../features/projects/pages/ProjectsPage'
import { ProjectDetailsPage } from '../features/projects/pages/ProjectDetailsPage'
import { NetworkPage } from '../features/network/NetworkPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/network" element={<NetworkPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
