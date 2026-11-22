import { useState } from 'react'
import { notify } from '../../utils/notify'
import { useProjectStore } from './data/projectStore'
import { useUserStore } from '../../store/userStore'
import ComputeGlobe from '../../components/globe/ComputeGlobe'

export function ProjectsPage() {
  const projects = useProjectStore((state) => state.projects)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const joinedIds = useUserStore((state) => state.joinedProjectIds)
  const activeIds = useUserStore((state) => state.activeProjectIds)
  const joinProject = useUserStore((state) => state.joinProject)
  const leaveProject = useUserStore((state) => state.leaveProject)
  const startContribution = useUserStore((state) => state.startContribution)
  const stopContribution = useUserStore((state) => state.stopContribution)

  const selected = projects[selectedIndex]
  const isJoined = joinedIds.includes(selected.id)
  const isActive = activeIds.includes(selected.id)

  function addProject() {
    joinProject(selected.id)
    notify('Added to My Projects', `${selected.name} is ready for contribution.`, 'green')
  }

  function removeProject() {
    leaveProject(selected.id)
    notify('Removed', `${selected.name} was removed from My Projects.`, 'yellow')
  }

  function toggleContribution() {
    if (isActive) {
      stopContribution(selected.id)
      notify('Contribution stopped', `${selected.name} is paused.`, 'yellow')
    } else {
      startContribution(selected.id)
      notify('Contribution started', `${selected.name} is now active.`, 'green')
    }

  }

  const wheelProjects = [-1, 0, 1].map((offset) =>
    projects[(selectedIndex + offset + projects.length) % projects.length],
  )

  return (
    <div className="projects-experience">
      <div className="projects-heading">
        <div>
          <span className="section-kicker">Discover meaningful work</span>
          <h1>Choose a project</h1>
        </div>
        {/* <div className="wheel-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous project"><IconChevronLeft size={19} /></button>
          <span>{selectedIndex + 1} / {projects.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next project"><IconChevronRight size={19} /></button>
        </div> */}
      </div>

      <div className="project-workspace">
        <section className="project-wheel vertical" aria-label="Selected project">
          {wheelProjects.map((project, position) => {
            const projectIndex = projects.findIndex((item) => item.id === project.id)
            if (position === 1) {
              return (
                <article className="wheel-card center" key={project.id}>
                  <div className="wheel-card-body">
                    <h2>{project.name}</h2>
                    <p className="project-description">{project.description}</p>
                    <div className="project-detail-copy">
                      <div><span>Why it matters</span><p>{project.whyItMatters}</p></div>
                      <div><span>What your computer does</span><p>{project.whatItDoes}</p></div>
                      <div><span>How results are used</span><p>{project.resultsUsedFor}</p></div>
                    </div>
                    <div className="project-actions">
                      {!isJoined ? (
                        <button className="native-button" type="button" onClick={addProject}>Add to My Projects</button>
                      ) : (
                        <>
                          <button className={`native-button ${isActive ? 'warning' : ''}`} type="button" onClick={toggleContribution}>
                            {isActive ? 'Stop contributing' : 'Start contributing'}
                          </button>
                          <button className="native-button danger" type="button" onClick={removeProject}>Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              )
            }
            return (
              <button
                type="button"
                className={`wheel-card preview ${position === 0 ? 'previous' : 'next'}`}
                key={project.id}
                onClick={() => setSelectedIndex(projectIndex)}
              >
                <span>{project.category}</span>
                <strong>{project.name}</strong>
                <small>{project.requirements} compute requirements</small>
              </button>
            )
          })}
        </section>
        <section className="project-globe-panel">
          <ComputeGlobe
            compact={false}
            highlightedProject={selected.name}
            projectNodeCount={selected.nodeCount}
            projectCountries={selected.collaboratorCountries}
            showControls={true}
            showDetailPanel={true}
          />
        </section>
      </div>
    </div>
  )
}
