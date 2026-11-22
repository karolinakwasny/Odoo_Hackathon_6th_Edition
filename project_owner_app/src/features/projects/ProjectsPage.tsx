import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../store/projectStore'
import { useHubProgress } from '../../hooks/useHubProgress'
import { withLiveProgress } from './liveProject'

export function ProjectsPage() {
  const navigate = useNavigate()
  const hub = useHubProgress()
  // Forest Guardian gets its progress, active nodes and status from the live run
  const projects = useProjectStore((state) => state.projects).map((project) => withLiveProgress(project, hub))
  return (
    <div className="owner-projects">
      <div className="owner-page-heading"><div><span>PROJECT CONTROL</span><h1>Projects</h1></div><button className="owner-primary" type="button">Create project</button></div>
      <div className="owner-project-grid">
        {projects.map((project) => (
          <article className="owner-project-card" key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
            <div className="owner-project-card-top"><span>{project.category}</span><b>{project.status}</b></div>
            <h2>{project.name}</h2>
            <p>{project.description}</p>
            <div className="owner-progress"><span style={{ width: `${project.progress}%` }} /></div>
            <div className="owner-project-meta"><span>{project.activeNodes} active nodes</span><span>{project.contributors.toLocaleString()} contributors</span></div>
          </article>
        ))}
      </div>
    </div>
  )
}
