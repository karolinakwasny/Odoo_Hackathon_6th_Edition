import type { HubProgress } from '../../hooks/useHubProgress'
import type { Project } from '../../types'

// The project whose progress comes from the backend's chunk run (backend-prototype, ws://localhost:8000/ws)
export const LIVE_PROJECT_ID = 'forest-guardian'
// Chunks the whole project needs; each run of the backend computes part of them (e.g. 50)
export const LIVE_PROJECT_TOTAL_CHUNKS = 250

export interface LiveNumbers {
  completed: number  // chunks completed over all runs so far
  total: number      // chunks the project needs
  running: number    // chunks being computed right now
  activeNodes: number
}

/** Live chunk numbers for the live project, or undefined while the backend isn't reachable. */
export function liveNumbers(hub: HubProgress | null): LiveNumbers | undefined {
  const run = hub?.projects[0]
  if (!hub || !run) return undefined
  return {
    completed: Math.min(run.completed_total ?? run.done, LIVE_PROJECT_TOTAL_CHUNKS),
    total: LIVE_PROJECT_TOTAL_CHUNKS,
    running: run.running,
    activeNodes: hub.nodes_online,
  }
}

/** The project with its progress, active nodes and status taken from the live run (other projects unchanged). */
export function withLiveProgress(project: Project, hub: HubProgress | null): Project {
  const live = liveNumbers(hub)
  if (project.id !== LIVE_PROJECT_ID || !live) return project
  const status =
    live.completed >= live.total ? 'Completed'
      : live.running > 0 ? 'Active'
        : live.completed > 0 ? 'Paused'  // a run finished, but the project still needs more chunks
          : project.status
  return {
    ...project,
    progress: Math.round(live.completed / live.total * 100),
    activeNodes: live.activeNodes,
    status,
  }
}
