import {
  IconCalendar,
  IconChevronDown,
  IconCpu,
  IconDots,
  IconLeaf,
  IconMicroscope,
  IconWorld,
} from '@tabler/icons-react'
import { Button, Progress } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useHubProgress } from '../../../hooks/useHubProgress'
import { withLiveProgress } from '../liveProject'
import type { Project, ProjectCategory } from '../types'
import { StatusBadge } from '../../../components/ui/StatusBadge'

interface ProjectCardProps {
  project: Project
  expanded: boolean
  onToggle: () => void
}

const categoryIcons = {
  Climate: IconWorld,
  Biodiversity: IconLeaf,
  Research: IconMicroscope,
  Other: IconDots,
} satisfies Record<ProjectCategory, typeof IconWorld>

export function ProjectCard({ project: storedProject, expanded, onToggle }: ProjectCardProps) {
  const navigate = useNavigate()
  const hub = useHubProgress()
  const project = withLiveProgress(storedProject, hub)
  const total = project.requirements.taskCount
  const progress = total > 0 ? Math.round(project.completedTasks / total * 100) : 0
  const CategoryIcon = categoryIcons[project.category]

  return (
    <article className={`project-list-item${expanded ? ' expanded' : ''}`}>
      <button
        type="button"
        className="project-list-trigger"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        <span className={`project-category-icon ${project.category.toLowerCase()}`}>
          <CategoryIcon size={21} stroke={1.7} />
        </span>
        <span className="project-list-main">
          <span className="project-list-title-row">
            <strong>{project.name}</strong>
            <StatusBadge status={project.status} />
          </span>
          <span className="project-list-summary">
            <span>{project.category}</span>
            <span>{project.completedTasks} / {total} tasks</span>
            <span>{progress}% complete</span>
          </span>
        </span>
        <span className="project-list-progress">
          <Progress value={progress} color="forest" size="sm" radius="xl" />
        </span>
        <IconChevronDown className="project-expand-icon" size={19} />
      </button>

      {expanded && (
        <div className="project-expanded-content">
          <p className="project-description">{project.description}</p>
          <dl className="project-detail-grid">
            <div><dt>Priority</dt><dd>{project.priority}</dd></div>
            <div><dt>Strategy</dt><dd>{project.schedulingStrategy}</dd></div>
            <div><dt>Total chunks</dt><dd>{project.requirements.taskCount}</dd></div>
            <div><dt>Completed chunks</dt><dd>{project.completedTasks}</dd></div>
            <div><dt>Renewable postponement</dt><dd>{project.requirements.postponeForRenewableEnergy ? 'Enabled' : 'Disabled'}</dd></div>
            <div><dt><IconCalendar size={14} /> Created</dt><dd>{project.createdAt}</dd></div>
          </dl>
          <div className="project-expanded-footer">
            <span><IconCpu size={15} /> {project.requirements.taskCount} total tasks</span>
            <Button variant="light" color="forest" onClick={() => navigate(`/projects/${project.id}`)}>
              View full details
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}
