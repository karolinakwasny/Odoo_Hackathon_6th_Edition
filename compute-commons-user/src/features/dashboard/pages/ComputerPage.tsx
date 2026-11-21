import { Badge, Button, Card, Progress, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { PageHeader } from '../../../components/common/PageHeader'
import { useUserStore } from '../../../store/userStore'

export function ComputerPage() {
  const store = useUserStore()
  function toggle() {
    store.setContributionEnabled(!store.contributionEnabled)
    notifications.show({ title: store.contributionEnabled ? 'Contribution paused' : 'Contribution resumed', message: 'Demo contribution status updated.', color: store.contributionEnabled ? 'orange' : 'green' })
  }
  return (
    <>
      <PageHeader title="My computer" description="A simulated representation of your contribution device." action={<Badge color={store.contributionEnabled ? 'green' : 'orange'}>{store.contributionEnabled ? 'Connected demo' : 'Paused'}</Badge>} />
      <div className="demo-label">Simulated device · No hardware is being accessed</div>
      <div className="computer-grid">
        <Card withBorder><div className="computer-status"><div><span>Demo device</span><h2>{store.deviceType}</h2></div><span className={`status-dot ${store.contributionEnabled ? '' : 'paused'}`} /></div><Button color={store.contributionEnabled ? 'orange' : 'green'} variant="light" onClick={toggle}>{store.contributionEnabled ? 'Pause contribution' : 'Resume contribution'}</Button></Card>
        <Card withBorder><Text size="sm" c="dimmed">CPU availability</Text><h2>{store.cpuUsage}%</h2><Text size="sm" c="dimmed">Current utilization</Text><Progress value={store.contributionEnabled ? 32 : 0} color="forest" mt="xs" /></Card>
        <Card withBorder><Text size="sm" c="dimmed">Available resources</Text><h2>8 cores · 16 GB</h2><Text size="sm" c="dimmed">Mock available memory and CPU capacity</Text></Card>
        <Card withBorder><Text size="sm" c="dimmed">Current tasks</Text><h2>{store.contributionEnabled ? 3 : 0}</h2><Text size="sm" c="dimmed">Tasks shown for demonstration only</Text></Card>
      </div>
      <Card withBorder mt="lg"><h3>About computer connection</h3><Text c="dimmed" size="sm">Connecting an actual computer and running real tasks will be supported in a future version. Compute Commons cannot access your hardware from this demo.</Text></Card>
    </>
  )
}
