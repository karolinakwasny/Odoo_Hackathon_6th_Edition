import { Badge, Button, Progress } from '@mantine/core'
import { IconArrowLeft, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useNavigate, useParams } from 'react-router-dom'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useProjectStore } from '../../../store/projectStore'
import { useChunkProgress, useHubProgress } from '../../../hooks/useHubProgress'
import { LIVE_PROJECT_ID, withLiveProgress } from '../liveProject'

export function ProjectDetailsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const storedProject = useProjectStore((state) => state.projects.find((item) => item.id === projectId))
  const changeStatus = useProjectStore((state) => state.changeStatus)
  const hub = useHubProgress()
  const chunkProgress = useChunkProgress()
  const project = storedProject && withLiveProgress(storedProject, hub)
  const isLive = project?.id === LIVE_PROJECT_ID

  if (!project) {
    return <EmptyState title="Project not found" description="This project does not exist in the local workspace." action={<Button variant="default" onClick={() => navigate('/projects')}>Back to projects</Button>} />
  }

  const selectedProject = project
  const progress = selectedProject.requirements.taskCount ? Math.round(selectedProject.completedTasks / selectedProject.requirements.taskCount * 100) : 0

  function updateStatus(status: 'Running' | 'Paused') {
    changeStatus(selectedProject.id, status)
    notifications.show({
      title: status === 'Running' ? 'Project started' : 'Project paused',
      message: `${selectedProject.name} is now ${status.toLowerCase()}.`,
      color: status === 'Running' ? 'green' : 'orange',
    })
  }

  return (
    <>
      <Button variant="subtle" color="forest" leftSection={<IconArrowLeft size={16} />} className="back-button" onClick={() => navigate('/projects')}>All projects</Button>
      <div className="project-detail-header">
        <div>
          <span className="project-category">{project.category}</span>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </div>
        <div className="detail-actions">
          <StatusBadge status={project.status} />
          {/* the live project is started from the Coordinator page, so no Start/Pause buttons here */}
          {!isLive && project.status !== 'Running' && project.status !== 'Completed' && (
            <Button leftSection={<IconPlayerPlay size={16} />} onClick={() => updateStatus('Running')}>{project.status === 'Paused' ? 'Resume' : 'Start'}</Button>
          )}
          {!isLive && project.status === 'Running' && (
            <Button color="orange" variant="light" leftSection={<IconPlayerPause size={16} />} onClick={() => updateStatus('Paused')}>Pause</Button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <section className="panel detail-progress">
          <div className="panel-heading"><div><h2>Task progress</h2><p>{project.completedTasks} of {project.requirements.taskCount} tasks completed</p></div><strong>{progress}%</strong></div>
          <Progress value={progress} size="lg" radius="xl" color="forest" />
              {Object.entries(chunkProgress).map(([chunk, percent]) => (
            <div key={chunk} style={{ marginTop: 12 }}>
              <span>Chunk {chunk}: {percent}%</span>
              <Progress value={percent} size="sm" radius="xl" color="green" />
            </div>
          ))}
        </section>
        <section className="panel">
          <div className="panel-heading"><h2>Project information</h2></div>
          <dl className="detail-list">
            <div><dt>Priority</dt><dd><Badge variant="light" color={project.priority === 'Critical' ? 'red' : 'gray'}>{project.priority}</Badge></dd></div>
            <div><dt>Created</dt><dd>{project.createdAt}</dd></div>
            <div><dt>Category</dt><dd>{project.category}</dd></div>
          </dl>
        </section>
        <section className="panel">
          <div className="panel-heading"><h2>Computational requirements</h2></div>
          <dl className="detail-list">
            <div><dt>Tasks</dt><dd>{project.requirements.taskCount}</dd></div>
            <div><dt>CPU cores/task</dt><dd>{project.requirements.cpuCoresPerTask}</dd></div>
            <div><dt>Memory/task</dt><dd>{project.requirements.memoryMbPerTask.toLocaleString()} MB</dd></div>
            <div><dt>Duration/task</dt><dd>{project.requirements.estimatedDurationSeconds}s</dd></div>
          </dl>
        </section>
        <section className="panel">
          <div className="panel-heading"><h2>Scheduling configuration</h2></div>
          <dl className="detail-list">
            <div><dt>Strategy</dt><dd>{project.schedulingStrategy}</dd></div>
            <div><dt>Renewable postponement</dt><dd>{project.requirements.postponeForRenewableEnergy ? 'Enabled' : 'Disabled'}</dd></div>
          </dl>
        </section>
        <section className="panel activity-panel">
          <div className="panel-heading"><h2>Recent activity</h2></div>
          <div className="event-list">
            {project.recentActivity.map((activity) => (
              <div className="event" key={activity.id}>
                <span className="event-marker success" />
                <div className="event-content"><strong>{activity.title}</strong><span>{activity.detail}</span></div>
                <time>{activity.time}</time>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
