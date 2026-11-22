import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProjectStore } from '../../store/projectStore'
import ComputeGlobe from '../../components/project-globe/ComputeGlobe'
import { useChunkProgress, useHubProgress } from '../../hooks/useHubProgress'
import { useCoordinator } from '../../hooks/useCoordinator'
import { LIVE_PROJECT_ID, liveNumbers, withLiveProgress } from './liveProject'
import { CoordinatorSection } from '../coordinator/CoordinatorSection'
import { CARBON_SCALE, NO_DATA_COLOR } from '../../utils/carbonScale'

export function ProjectDetailsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const storedProject = useProjectStore((state) => state.projects.find((item) => item.id === projectId))
  const hub = useHubProgress()
  const chunkProgress = useChunkProgress()
  // one connection for all coordinator slides, so switching slides keeps the log and state
  const coordinator = useCoordinator()
  const [slide, setSlide] = useState(0)
  if (!storedProject) return <div className="owner-empty"><h1>Project not found</h1><button className="owner-primary" onClick={() => navigate('/projects')}>Back to projects</button></div>

  const project = withLiveProgress(storedProject, hub)
  const isLive = project.id === LIVE_PROJECT_ID
  const live = isLive ? liveNumbers(hub) : undefined

  const overview = (
    <div className="owner-detail-grid">
      <article><span>Active nodes</span><strong>{project.activeNodes}</strong></article>
      <article><span>Contributors</span><strong>{project.contributors.toLocaleString()}</strong></article>
      {isLive ? (
        <>
          <article><span>Total chunks</span><strong>{live?.total ?? '—'}</strong></article>
          <article><span>Chunks completed</span><strong>{live?.completed ?? '—'}</strong></article>
        </>
      ) : (
        <article><span>Nodes allocated</span><strong>{project.nodeCount}</strong></article>
      )}
    </div>
  )

  const taskProgress = (
    <div className="owner-task-progress">
      <div className="owner-task-progress-heading">
        <div><h2>Task progress</h2><p>{live ? `${live.completed} of ${live.total} chunks completed` : 'Backend not connected'}</p></div>
        <strong>{project.progress}%</strong>
      </div>
      <div className="owner-progress owner-progress-large"><span style={{ width: `${project.progress}%` }} /></div>
      {Object.entries(chunkProgress).map(([chunk, percent]) => (
        <div className="owner-chunk-bar" key={chunk}>
          <span>Chunk {chunk}: {percent}%</span>
          <div className="owner-progress"><span style={{ width: `${percent}%` }} /></div>
        </div>
      ))}
    </div>
  )

  // the sections you move through with the arrows, left to right
  const slides: { title: string; content: ReactNode }[] = isLive
    ? [
        { title: 'Overview', content: <>{overview}{taskProgress}</> },
        { title: 'Run & countries', content: <CoordinatorSection coordinator={coordinator} part="run" /> },
        { title: 'Chunk completion', content: <CoordinatorSection coordinator={coordinator} part="chunks" /> },
        { title: 'Workers', content: <CoordinatorSection coordinator={coordinator} part="workers" /> },
        { title: 'Log', content: <CoordinatorSection coordinator={coordinator} part="log" /> },
      ]
    : [{ title: 'Overview', content: overview }]
  const current = Math.min(slide, slides.length - 1)

  return (
    <div className="owner-project-details">
      <button className="owner-back" type="button" onClick={() => navigate('/projects')}>← All projects</button>
      <div className="owner-detail-layout">
        <div className="owner-globe-column">
          <section className="owner-detail-globe">
            <ComputeGlobe
              projectName={project.name}
              projectNodeCount={project.nodeCount}
              projectCountries={project.collaboratorCountries}
              showProjectNodes={project.id !== 'forest-guardian'}
            />
          </section>
          <div className="owner-carbon-legend">
            <span>Grid carbon intensity, live (gCO₂/kWh)</span>
            <div>
              {CARBON_SCALE.map((step) => <i key={step.label} style={{ background: step.color }}>{step.label}</i>)}
              <i style={{ background: NO_DATA_COLOR }}>no data</i>
            </div>
          </div>
        </div>
        <section className="owner-detail-panel">
          <div className="owner-detail-heading">
            <div><span>{project.category}</span><h1>{project.name}</h1></div>
            <span className="owner-status-pill">{project.status}</span>
          </div>

          {slides.length > 1 && (
            <div className="owner-slider-nav">
              <button type="button" aria-label="Previous section" disabled={current === 0} onClick={() => setSlide(current - 1)}>←</button>
              <div className="owner-slider-title">
                <strong>{slides[current].title}</strong>
                <div className="owner-slider-dots">
                  {slides.map((item, index) => (
                    <button key={item.title} type="button" aria-label={item.title} title={item.title} className={index === current ? 'active' : ''} onClick={() => setSlide(index)} />
                  ))}
                </div>
              </div>
              <button type="button" aria-label="Next section" disabled={current === slides.length - 1} onClick={() => setSlide(current + 1)}>→</button>
            </div>
          )}

          {slides[current].content}
        </section>
      </div>
    </div>
  )
}
