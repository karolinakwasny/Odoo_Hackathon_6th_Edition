import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

interface Props {
  children: ReactNode
}

export function AppLayout({ children }: Props) {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  )
}