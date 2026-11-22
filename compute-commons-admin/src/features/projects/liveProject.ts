import type { HubProgress } from '../../hooks/useHubProgress'
import type { Project } from './types'

// The project whose progress comes from the backend's chunk run (the workers on the Coordinator page).
export const LIVE_PROJECT_ID = 'climate-forest'

/**
 * Returns the project with its completed tasks and status taken from the live run.
 * The project's total (requirements.taskCount, e.g. 250) stays as it is: one run computes
 * only part of it (the chunk files in backend-prototype/chunks/), so after a run it shows e.g. 50 / 250.
 * Other projects, or any project while the backend isn't reachable, are returned unchanged.
 */
export function withLiveProgress(project: Project, hub: HubProgress | null): Project {
  const run = hub?.projects[0]
  if (project.id !== LIVE_PROJECT_ID || !run) return project

  const total = project.requirements.taskCount
  const done = Math.min(run.completed_total ?? run.done, total)  // all runs so far, e.g. 2 runs = 100 / 250
  const status =
    done >= total ? 'Completed'
      : run.running > 0 ? 'Running'
        : done > 0 ? 'Paused'   // a run finished, but the project still needs more chunks
          : 'Queued'            // backend up, no run yet

  return { ...project, completedTasks: done, status }
}
