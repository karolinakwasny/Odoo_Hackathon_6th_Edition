import { Button, Card, Progress, Text } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { PageHeader } from '../../../components/common/PageHeader'
import { useProjectStore } from '../data/projectStore'
import { useUserStore } from '../../../store/userStore'

export function MyProjectsPage() {
  const navigate = useNavigate()
  const joinedIds = useUserStore((state) => state.joinedProjectIds)
  const leaveProject = useUserStore((state) => state.leaveProject)
  const projects = useProjectStore((state) => state.projects.filter((project) => joinedIds.includes(project.id)))
  function leave(id: string, name: string) {
    leaveProject(id)
    notifications.show({ title: 'Project left', message: `You left ${name}.`, color: 'yellow' })
  }
  return (
    <>
      <PageHeader title="My projects" description="Projects you have chosen to support." />
      {projects.length === 0 ? (
        <div className="empty-state"><h3>No projects yet</h3><Text c="dimmed">Discover a project that matches your interests and join it.</Text><Button mt="md" onClick={() => navigate('/projects')}>Discover projects</Button></div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <Card key={project.id} withBorder>
              <Text fw={700} size="lg">{project.name}</Text>
              <Text size="sm" c="dimmed" mt={4}>{project.category}</Text>
              <Text size="sm" mt="md">{project.progress}% complete</Text>
              <Progress value={project.progress} color="forest" mt="xs" />
              <div className="card-actions"><Button variant="light" onClick={() => navigate(`/projects/${project.id}`)}>View details</Button><Button variant="subtle" color="red" onClick={() => leave(project.id, project.name)}>Leave</Button></div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
