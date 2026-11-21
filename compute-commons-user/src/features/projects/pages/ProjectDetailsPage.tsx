import { Badge, Button, Divider, Grid, Group, Progress, Text } from '@mantine/core'
import { IconClock, IconCpu, IconLeaf, IconUsers } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjectStore } from '../data/projectStore'
import { useUserStore } from '../../../store/userStore'

export function ProjectDetailsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const project = useProjectStore((state) => state.projects.find((item) => item.id === projectId))
  const joined = useUserStore((state) => state.joinedProjectIds)
  const joinProject = useUserStore((state) => state.joinProject)
  const leaveProject = useUserStore((state) => state.leaveProject)
  if (!project) return <div className="empty-state"><h2>Project not found</h2><Button onClick={() => navigate('/projects')}>Discover projects</Button></div>

  const selectedProject = project
  const isJoined = joined.includes(selectedProject.id)
  function join() {
    joinProject(selectedProject.id)
    notifications.show({ title: 'Project joined', message: `You joined ${selectedProject.name}.`, color: 'green' })
  }
  function leave() {
    leaveProject(selectedProject.id)
    notifications.show({ title: 'Project left', message: `You left ${selectedProject.name}.`, color: 'yellow' })
  }

  return (
    <article className="project-details">
      <Button variant="subtle" onClick={() => navigate('/projects')}>← All projects</Button>
      <div className={`project-detail-hero ${project.image}`}>
        <Badge variant="white" color="forest">{project.category}</Badge>
      </div>
      <Grid mt="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <h1>{project.name}</h1>
          <Text c="dimmed">{project.organization}</Text>
          <Text mt="md" size="lg">{project.description}</Text>
          <Divider my="lg" />
          <h3>Why this project matters</h3><Text c="dimmed">{project.whyItMatters}</Text>
          <h3>What the computing work does</h3><Text c="dimmed">{project.whatItDoes}</Text>
          <h3>How results will be used</h3><Text c="dimmed">{project.resultsUsedFor}</Text>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <aside className="project-action-card">
            <Badge color={project.status === 'Recruiting' ? 'lime' : 'forest'} variant="light">{project.status}</Badge>
            {isJoined ? (
              <><Button fullWidth mt="lg" color="red" variant="light" onClick={leave}>Leave project</Button><Text ta="center" size="xs" c="dimmed" mt="xs">You are contributing to this project</Text></>
            ) : (
              <Button fullWidth mt="lg" onClick={join}>Join project</Button>
            )}
            <Divider my="lg" />
            <Group justify="space-between"><span><IconCpu size={16} /> Requirements</span><strong>{project.requirements}</strong></Group>
            <Group justify="space-between" mt="sm"><span><IconClock size={16} /> Task duration</span><strong>{project.estimatedDurationMinutes} min</strong></Group>
            <Group justify="space-between" mt="sm"><span><IconUsers size={16} /> Contributors</span><strong>{project.contributors.toLocaleString()}</strong></Group>
            <Group justify="space-between" mt="sm"><span><IconLeaf size={16} /> Energy</span><strong>{project.energyPreference}</strong></Group>
            <Divider my="lg" />
            <Text size="sm">{project.progress}% complete</Text>
            <Progress value={project.progress} color="forest" mt="xs" />
          </aside>
        </Grid.Col>
      </Grid>
    </article>
  )
}
