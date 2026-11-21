import { Badge, Button, Card, Progress, Text } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { PageHeader } from '../../../components/common/PageHeader'
import { useUserStore } from '../../../store/userStore'
import { useNavigate } from 'react-router-dom'

export function ComputerPage() {
  const store = useUserStore()
  const navigate = useNavigate()
  const activeProjectIds = store.activeProjectIds
  function toggle() {
    if (store.joinedProjectIds.length === 0) {
      navigate('/projects')
      return
    }
    if (activeProjectIds.length > 0) {
      activeProjectIds.forEach((projectId) => store.stopContribution(projectId))
      notifications.show({ title: 'Contributions stopped', message: 'All selected project contributions are stopped.', color: 'orange' })
    } else {
      navigate('/my-projects')
    }
  }
  return (
    <>
      <PageHeader title="My computer" description="A simulated representation of your contribution device." action={<Badge color={store.contributionEnabled ? 'green' : 'orange'}>{store.contributionEnabled ? 'Contribution active' : 'Stopped'}</Badge>} />
      <div className="demo-label">Simulated device · No hardware is being accessed</div>
      <div className="computer-grid">
        <Card withBorder><div className="computer-status"><div><span>Demo device</span><h2>{store.deviceType}</h2></div><span className={`status-dot ${activeProjectIds.length > 0 ? '' : 'paused'}`} /></div><Button color={activeProjectIds.length > 0 ? 'orange' : 'green'} variant="light" onClick={toggle}>{activeProjectIds.length > 0 ? 'Stop all contributions' : store.joinedProjectIds.length > 0 ? 'Choose a project' : 'Find a project'}</Button></Card>
        <Card withBorder><Text size="sm" c="dimmed">CPU availability</Text><h2>{store.cpuUsage}%</h2><Text size="sm" c="dimmed">Current utilization</Text><Progress value={store.contributionEnabled ? 32 : 0} color="forest" mt="xs" /></Card>
        <Card withBorder><Text size="sm" c="dimmed">Available resources</Text><h2>8 cores · 16 GB</h2><Text size="sm" c="dimmed">Mock available memory and CPU capacity</Text></Card>
        <Card withBorder><Text size="sm" c="dimmed">Active projects</Text><h2>{activeProjectIds.length}</h2><Text size="sm" c="dimmed">Project selections shown for demonstration only</Text></Card>
      </div>
      <Card withBorder mt="lg"><h3>About computer connection</h3><Text c="dimmed" size="sm">Connecting an actual computer and running real tasks will be supported in a future version. Compute Commons cannot access your hardware from this demo.</Text></Card>
    </>
  )
}
