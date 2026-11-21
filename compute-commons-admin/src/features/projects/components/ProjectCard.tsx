import { IconCpu, IconCalendar, IconChevronRight } from '@tabler/icons-react'
import { Progress } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types'
import { StatusBadge } from '../../../components/ui/StatusBadge'

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()
  const total = project.requirements.taskCount
  const progress = total > 0 ? Math.round(project.completedTasks / total * 100) : 0
  return (
    <article className="project-card" role="button" tabIndex={0} onClick={() => navigate(`/projects/${project.id}`)} onKeyDown={(event) => {
      if (event.key === 'Enter') navigate(`/projects/${project.id}`)
    }}>
      <div className="project-card-top">
        <div>
          <span className="project-category">{project.category}</span>
          <h3>{project.name}</h3>
        </div>
        <StatusBadge status={project.status} />
      </div>
      <p className="project-description">{project.description}</p>
      <div className="project-progress-copy">
        <span>{project.completedTasks} / {total} tasks</span>
        <strong>{progress}%</strong>
      </div>
      <Progress value={progress} color="forest" size="sm" radius="xl" />
      <div className="project-card-footer">
        <span><IconCpu size={15} /> {project.requirements.cpuCoresPerTask} cores/task</span>
        <span><IconCalendar size={15} /> {project.createdAt}</span>
        <IconChevronRight className="project-arrow" size={18} />
      </div>
    </article>
  )
}
