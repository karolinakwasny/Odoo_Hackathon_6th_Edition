import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { OnboardingPage } from '../features/onboarding/pages/OnboardingPage'
import { ProjectsPage } from '../features/projects/pages/ProjectsPage'
import { ProfilePage } from '../features/profile/pages/ProfilePage'
import { useUserStore } from '../store/userStore'
import { OnboardingShell } from '../features/onboarding/components/OnboardingShell'
import { ProjectDetailsPage } from '../features/projects/pages/ProjectDetailsPage'
import { MyProjectsPage } from '../features/projects/pages/MyProjectsPage'
import { ComputerPage } from '../features/dashboard/pages/ComputerPage'
import { SettingsPage } from '../features/profile/pages/SettingsPage'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const onboardingCompleted = useUserStore((state) => state.onboardingCompleted)
  return onboardingCompleted ? children : <Navigate to="/" replace />
}

function HomeRoute() {
  const onboardingCompleted = useUserStore((state) => state.onboardingCompleted)
  return onboardingCompleted ? <Navigate to="/projects" replace /> : <OnboardingPage />
}

function OnboardingRoute() {
  const onboardingCompleted = useUserStore((state) => state.onboardingCompleted)
  return onboardingCompleted ? <Navigate to="/projects" replace /> : <OnboardingShell />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route path="/onboarding/:step" element={<OnboardingRoute />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectDetailsPage /></ProtectedRoute>} />
          <Route path="/my-projects" element={<ProtectedRoute><MyProjectsPage /></ProtectedRoute>} />
          <Route path="/computer" element={<ProtectedRoute><ComputerPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
