import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { WelcomePage } from '../features/onboarding/WelcomePage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { ProjectsPage } from '../features/projects/ProjectsPage'
import { AccountPage } from '../features/account/AccountPage'
import { AppShell } from '../components/AppShell'
import { useUserStore } from '../store/userStore'

function Protected({ children }: { children: ReactNode }) {
  const completed = useUserStore((state) => state.onboardingCompleted)
  return completed ? children : <Navigate to="/" replace />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route element={<Protected><AppShell /></Protected>}>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
