import { AppLayout } from "./components/layout/AppLayout"
import { OverviewPage } from "./features/overview/OverviewPage"

export default function App() {
  return (
    <AppLayout>
      <OverviewPage />
    </AppLayout>
  )
}