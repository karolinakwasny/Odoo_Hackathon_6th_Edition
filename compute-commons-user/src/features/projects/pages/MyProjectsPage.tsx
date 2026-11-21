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
  const activeProjectIds = useUserStore((state) => state.activeProjectIds)
  const startContribution = useUserStore((state) => state.startContribution)
  const stopContribution = useUserStore((state) => state.stopContribution)
  const allProjects = useProjectStore((state) => state.projects)
  const projects = allProjects.filter((project) => joinedIds.includes(project.id))
  function leave(id: string, name: string) {
    leaveProject(id)
    notifications.show({ title: 'Removed from My Projects', message: `${name} was removed.`, color: 'yellow' })
  }
  return (
    <>
      <PageHeader title="My projects" description="Projects you have chosen to support." />
      {projects.length === 0 ? (
        <div className="project-discovery-prompt compact">
          <div className="discovery-visual" aria-hidden="true"><span /><span /><span /><i /></div>
          <div>
            <span className="prompt-eyebrow">Ready when you are</span>
            <h3>No projects joined yet</h3>
            <Text c="dimmed">Search the project catalog and join work that matches your interests.</Text>
            <Button mt="lg" onClick={() => navigate('/projects')}>Search projects</Button>
          </div>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <Card key={project.id} withBorder>
              <div className="card-actions">
              <Text fw={700} size="lg">{project.name}</Text>
                <Button variant="light" onClick={() => navigate(`/projects/${project.id}`)}>View details</Button>
              </div>
              <Text size="sm" c="dimmed" mt={4}>{project.category}</Text>
              <Text size="sm" mt="md" c={activeProjectIds.includes(project.id) ? 'forest' : 'dimmed'}>
                {activeProjectIds.includes(project.id) ? 'Contributing' : 'Not contributing'}
              </Text>
              <Text size="sm" mt="md">{project.progress}% complete</Text>
              <Progress value={project.progress} color="forest" mt="xs" />
              <div className="card-actions">
                {activeProjectIds.includes(project.id) ? (
                  <Button variant="light" color="orange" onClick={() => {
                    stopContribution(project.id)
                    notifications.show({ title: 'Contribution stopped', message: `Stopped contributing to ${project.name}.`, color: 'yellow' })
                  }}>Stop contributing</Button>
                ) : (
                  <Button onClick={() => {
                    startContribution(project.id)
                    notifications.show({ title: 'Contribution started', message: `Now contributing to ${project.name}.`, color: 'green' })
                  }}>Start contributing</Button>
                )}
                <Button variant="subtle" color="red" onClick={() => leave(project.id, project.name)}>Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
