import { PageHeader } from '../../../components/common/PageHeader'
import { Badge, Button, Card, Progress, Text } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../../store/userStore'
import { useProjectStore } from '../../projects/data/projectStore'

export function DashboardPage() {
  const navigate = useNavigate()
  const store = useUserStore()
  const joinedProjects = useProjectStore((state) => state.projects.filter((project) => store.joinedProjectIds.includes(project.id)))
  const name = store.displayName || store.username
  return (
    <>
      <PageHeader title={`Welcome, ${name}`} description="Your contribution summary is simulated for this demo." />
      <div className="demo-label">Demo data</div>
      <div className="metric-grid">
        <article><span>Active projects</span><strong>{joinedProjects.length}</strong></article>
        <article><span>Completed tasks</span><strong>148</strong></article>
        <article><span>Computing hours</span><strong>32.4</strong></article>
        <article><span>Estimated energy</span><strong>8.7 kWh</strong></article>
      </div>
      <section className="dashboard-section"><div className="section-heading"><div><h2>My projects</h2><p>Work you have chosen to support</p></div><Button variant="subtle" onClick={() => navigate('/my-projects')}>View all</Button></div>
        {joinedProjects.length ? <div className="project-grid">{joinedProjects.map((project) => <Card key={project.id} withBorder><Text fw={700}>{project.name}</Text><Text size="sm" c="dimmed">{project.category}</Text><Progress value={project.progress} mt="md" color="forest" /><Button mt="md" variant="light" onClick={() => navigate(`/projects/${project.id}`)}>View project</Button></Card>)}</div> : <div className="empty-state"><h3>No joined projects</h3><Text c="dimmed">Explore the network and choose a project to support.</Text><Button mt="md" onClick={() => navigate('/projects')}>Discover projects</Button></div>}
      </section>
      <div className="dashboard-bottom">
        <Card withBorder className="computer-summary"><div className="section-heading"><div><h2>My computer</h2><p>{store.deviceType} · {store.contributionEnabled ? 'Connected to demo network' : 'Contribution paused'}</p></div><Badge color={store.contributionEnabled ? 'green' : 'orange'} variant="light">{store.contributionEnabled ? 'Active' : 'Paused'}</Badge></div><Button variant="light" mt="md" onClick={() => navigate('/computer')}>Manage computer</Button></Card>
        <Card withBorder><h2>Recent activity</h2>{[{title:'Demo task completed',detail:'Climate Futures · 12 minutes ago'},{title:'Project joined',detail:'Discover or join work from the project catalog'}].map((item) => <div className="activity-row" key={item.title}><span /><div><strong>{item.title}</strong><p>{item.detail}</p></div></div>)}</Card>
      </div>
    </>
  )
}
