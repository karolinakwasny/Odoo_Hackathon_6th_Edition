import { Badge, Button, Card, Group, Progress, Text } from '@mantine/core'
import { IconUsers, IconClock, IconCpu } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../../types'

export function ProjectCard({ project, recommended = false }: { project: Project; recommended?: boolean }) {
  const navigate = useNavigate()
  return (
    <Card className="project-card" padding="lg" radius="md" withBorder>
      <div className={`project-visual ${project.image}`}><span>{project.category.split(' ')[0]}</span></div>
      <Group justify="space-between" mt="md">
        <Badge variant="light" color="forest">{project.category}</Badge>
        {recommended && <Badge variant="dot" color="lime">Recommended</Badge>}
      </Group>
      <Text fw={700} size="lg" mt="sm">{project.name}</Text>
      <Text size="sm" c="dimmed" mt={6} lineClamp={2}>{project.description}</Text>
      <Group gap="lg" mt="md" className="project-meta">
        <span><IconCpu size={15} /> {project.requirements}</span>
        <span><IconClock size={15} /> {project.estimatedDurationMinutes} min</span>
        <span><IconUsers size={15} /> {project.contributors.toLocaleString()}</span>
      </Group>
      <Progress value={project.progress} size="xs" color="forest" mt="md" />
      <Button variant="light" fullWidth mt="md" onClick={() => navigate(`/projects/${project.id}`)}>Explore project</Button>
    </Card>
  )
}
