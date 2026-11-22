import { dashboardStats } from "../../mocks/dashboard"
import { StatCard } from "./StatCard"
import { SchedulerFeed } from "./SchedulerFeed"
import { IconArrowUpRight, IconMapPin } from "@tabler/icons-react"
import { useHubProgress } from "../../hooks/useHubProgress"
import { useProjectStore } from "../../store/projectStore"
import { LIVE_PROJECT_ID, withLiveProgress } from "../projects/liveProject"
import { useCoordinator } from "../../hooks/useCoordinator"
import { useRenewableShare } from "../../hooks/useCountryEmissions"
import { countryFlag } from "../../utils/countryFlags"

// Assumed power draw per CPU core while computing a chunk, for the energy estimate
const WATTS_PER_CORE = 10

export function OverviewPage() {
  const progress = useHubProgress()
  const nodes = progress?.nodes_online ?? 0
  const chunks = progress?.projects[0]
  // the live project (Forest Guardian): chunks done so far out of everything it needs (e.g. 50 / 250)
  const storedLiveProject = useProjectStore((state) => state.projects.find((project) => project.id === LIVE_PROJECT_ID))
  const liveProject = storedLiveProject && withLiveProgress(storedLiveProject, progress)

  // Renewable energy: average renewable share in the workers' countries, weighted by number of workers
  const workers = useCoordinator().state?.workers ?? []
  const renewables = useRenewableShare()
  const workerShares = workers.map((worker) => renewables.forCountry(worker.country)).filter((value): value is number => value !== undefined)
  const renewableShare = workerShares.length ? workerShares.reduce((sum, value) => sum + value, 0) / workerShares.length : undefined
  const countries = [...new Set(workers.map((worker) => worker.country))].map(countryFlag).join(' ')

  // Energy: an estimate, completed chunks × energy per chunk (cores × duration × WATTS_PER_CORE)
  const requirements = liveProject?.requirements
  const kwhPerChunk = requirements ? requirements.cpuCoresPerTask * requirements.estimatedDurationSeconds * WATTS_PER_CORE / 3_600_000 : 0
  const estimatedKwh = (liveProject?.completedTasks ?? 0) * kwhPerChunk

  const stats = dashboardStats.map((stat) => {
    if (stat.icon === 'nodes') {
      return { ...stat, value: String(nodes), change: 'workers connected' }
    }
    if (stat.icon === 'tasks') {
      return { ...stat, label: 'Chunks processed', value: `${liveProject?.completedTasks ?? 0} / ${liveProject?.requirements.taskCount ?? 0}`, change: `${chunks?.running ?? 0} running` }
    }
    if (stat.icon === 'energy') {
      if (renewableShare === undefined) return { ...stat, value: '—', change: 'No live data yet' }
      const diff = renewables.mapAverage !== undefined ? renewableShare - renewables.mapAverage : undefined
      return {
        ...stat,
        value: `${renewableShare.toFixed(1)}%`,
        change: diff !== undefined
          ? `${countries} · ${diff >= 0 ? '+' : ''}${diff.toFixed(1)} pts vs. map average`
          : `Live · ${countries}`,
      }
    }
    if (stat.icon === 'power') {
      return { ...stat, label: 'Estimated energy', value: `${estimatedKwh.toFixed(2)} kWh`, change: `${liveProject?.completedTasks ?? 0} chunks × ${kwhPerChunk.toFixed(2)} kWh` }
    }
    return stat
    })
  
  return (
    <>
      <div className="welcome-row">
        <div>
          <h2>Good morning, Administrator</h2>
          <p>Here's what's happening across your network.</p>
        </div>

        
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel network-panel">
          <div className="panel-heading">
            <div>
              <h2>Network distribution</h2>
              <p>Connected computing nodes across Europe</p>
            </div>

            <button className="text-button">
              View network <IconArrowUpRight size={16} />
            </button>
          </div>

          <div className="map-placeholder">
            <div className="map-overlay">
              <IconMapPin size={18} />
              <span>Interactive network map</span>
            </div>
            <div className="map-stat">
              <strong>{nodes}</strong>
              <span>Connected nodes</span>
            </div>
          </div>
        </section>

        <SchedulerFeed />
      </div>
    </>
  )
}