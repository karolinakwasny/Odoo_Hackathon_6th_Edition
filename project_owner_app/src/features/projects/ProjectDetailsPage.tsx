import { useNavigate, useParams } from 'react-router-dom'
import { useProjectStore } from '../../store/projectStore'
import ComputeGlobe from '../../components/project-globe/ComputeGlobe'

export function ProjectDetailsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const project = useProjectStore((state) => state.projects.find((item) => item.id === projectId))
  if (!project) return <div className="owner-empty"><h1>Project not found</h1><button className="owner-primary" onClick={() => navigate('/projects')}>Back to projects</button></div>
  return (
    <div className="owner-project-details">
      <button className="owner-back" type="button" onClick={() => navigate('/projects')}>← All projects</button>
      <div className="owner-detail-layout">
        <section className="owner-detail-globe">
          <ComputeGlobe
            projectName={project.name}
            projectNodeCount={project.nodeCount}
            projectCountries={project.collaboratorCountries}
            showProjectNodes={project.id !== 'forest-guardian'}
          />
        </section>
        <section className="owner-detail-panel">
          <div className="owner-detail-heading">
            <div><span>{project.category}</span><h1>{project.name}</h1><p>{project.organization}</p></div>
            <span className="owner-status-pill">{project.status}</span>
          </div>
      <div className="owner-detail-grid">
        <article><span>Progress</span><strong>{project.progress}%</strong><div className="owner-progress"><span style={{ width: `${project.progress}%` }} /></div></article>
        <article><span>Active nodes</span><strong>{project.activeNodes}</strong></article>
        <article><span>Contributors</span><strong>{project.contributors.toLocaleString()}</strong></article>
        <article><span>Nodes allocated</span><strong>{project.nodeCount}</strong></article>
      </div>
      
        </section>
      </div>
    </div>
  )
}
