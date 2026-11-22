import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../store/projectStore'
import { getProjectOwnerOverview, type ProjectOverviewMetric } from '../../services/projectOverview'
import { useHubProgress } from '../../hooks/useHubProgress'
import { LIVE_PROJECT_ID, liveNumbers, withLiveProgress } from '../projects/liveProject'

export function OverviewPage() {
  const navigate = useNavigate()
  const projects = useProjectStore((state) => state.projects)
  const hub = useHubProgress()
  // Forest Guardian's progress, status and active nodes from the live run (same as on its project page)
  const storedForestProject = projects.find((project) => project.id === LIVE_PROJECT_ID)
  const forestProject = storedForestProject && withLiveProgress(storedForestProject, hub)
  const forestLive = liveNumbers(hub)
  const completedProject = projects.find((project) => project.status === 'Completed')
  const [overview, setOverview] = useState<ProjectOverviewMetric | null>(null)

  useEffect(() => {
    let active = true
    getProjectOwnerOverview().then((data) => {
      if (active) setOverview(data)
    })
    return () => { active = false }
  }, [])

  return (
    <div className="owner-overview">
      <section className="owner-overview-copy">
        <span className="owner-kicker">PROJECT OWNER </span>
        <h1>Overview</h1>
        <p>Monitor distributed capacity, active projects and compute allocation across your research network.</p>
        <div className="owner-stats">
          <div><span>Connected nodes</span><strong>{overview?.connectedNodes ?? forestProject?.activeNodes ?? 0}</strong></div>
          <div><span>Chunks processed</span><strong>{(overview?.chunksProcessed ?? 128432).toLocaleString()}</strong></div>
          <div><span>Contributors</span><strong>{(overview?.activeContributors ?? forestProject?.contributors ?? 0).toLocaleString()}</strong></div>
        </div>
        <div className="owner-kicker">YOUR PROJECTS</div>
        {completedProject && (
          <button className="owner-overview-project completed" type="button" onClick={() => navigate(`/projects/${completedProject.id}`)}>
            <span>Completed project</span>
            <strong>{completedProject.name}</strong>
            <small>{completedProject.progress}% processed</small>
          </button>
        )}
        {forestProject && (
          <button className="owner-overview-project" type="button" onClick={() => navigate(`/projects/${forestProject.id}`)}>
            <span>{forestProject.status === 'Completed' ? 'Completed project' : `${forestProject.status} project`}</span>
            <strong>{forestProject.name}</strong>
            <small>{forestProject.progress}% processed{forestLive ? ` · ${forestLive.completed} / ${forestLive.total} chunks` : ''}</small>
          </button>
        )}
        <button className="owner-add-project" type="button" onClick={() => navigate('/projects')}>
          <span>+</span>
          <b>Add project</b>
        </button>
      </section>
      <section className="owner-globe">
        <div className="owner-globe-orbit orbit-a" />
        <div className="owner-globe-orbit orbit-b" />
        <div className="owner-globe-core">
          <span className="owner-globe-grid" />
          {[
            ['Berlin', 24, 30],
            ['Lisbon', 16, 55],
            ['Nairobi', 57, 66],
            ['Singapore', 82, 58],
            ['São Paulo', 31, 78],
            ['Toronto', 34, 24],
          ].map(([label, left, top]) => (
            <span className="owner-node" key={String(label)} style={{ left: `${left}%`, top: `${top}%` }}>
              <i /><b>{label}</b>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
