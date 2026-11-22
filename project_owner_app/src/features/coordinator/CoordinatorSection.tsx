import { useEffect, useRef, useState } from 'react'
import type { useCoordinator } from '../../hooks/useCoordinator'
import { fetchLiveZones } from '../../services/electricityMaps'
import { countryFlag, countryLabel, countryName, countryZone } from '../../utils/countryFlags'

// The live coordinator view (same as the Coordinator page in compute-commons-admin),
// fed by the backend's WebSocket (backend-prototype/api.py), split into parts so the
// project page can show them as separate slides.

export type CoordinatorPart = 'run' | 'workers' | 'log' | 'chunks'
type Coordinator = ReturnType<typeof useCoordinator>

/** Current carbon intensity (gCO₂eq/kWh) per Electricity Maps zone, from this app's cached zone data. */
function useCarbonIntensity() {
  const [intensity, setIntensity] = useState<Record<string, number>>({})
  useEffect(() => {
    let active = true
    fetchLiveZones().then((zones) => {
      if (active) setIntensity(Object.fromEntries(zones.filter((zone) => zone.carbonIntensity > 0).map((zone) => [zone.id, zone.carbonIntensity])))
    })
    return () => { active = false }
  }, [])
  return (code: string): number | undefined => intensity[countryZone(code)]
}

/** Same scale as the network map's colors: under 200 is low, under 350 medium, otherwise high. */
function emissionLevel(grams: number): 'low' | 'medium' | 'high' {
  return grams < 200 ? 'low' : grams < 350 ? 'medium' : 'high'
}

export function CoordinatorSection({ coordinator, part }: { coordinator: Coordinator; part: CoordinatorPart }) {
  const { state, logs, connected, startRun, setCountrySpeed } = coordinator
  const carbonIntensity = useCarbonIntensity()
  const logBox = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logBox.current?.scrollTo({ top: logBox.current.scrollHeight })
  }, [logs, part])

  const chunks = state?.chunks ?? []
  const count = (s: string) => chunks.filter((chunk) => chunk.state === s).length
  const workers = state?.workers ?? []
  const workerColor = Object.fromEntries(workers.map((worker) => [worker.name, worker.color]))
  // chunk file name -> country of the worker computing it right now
  const chunkCountry = Object.fromEntries(workers.filter((worker) => worker.chunk !== '-').map((worker) => [worker.chunk, worker.country]))

  if (part === 'run') return (
    <>
      <div className="owner-coord-box">
        <div className="owner-coord-heading">
          <div>
            <h2>Run</h2>
            <p>Chunks this run: {count('pending')} pending · {count('in_progress')} in progress · {count('done')} done</p>
          </div>
          <span className={`owner-coord-badge ${connected ? 'low' : 'high'}`}>{connected ? 'Backend connected' : 'Backend offline'}</span>
        </div>
        <button className="owner-primary" type="button" disabled={!connected || state?.run_started} onClick={startRun}>
          {state?.run_started ? 'Run in progress' : 'Start run'}
        </button>
      </div>

      <div className="owner-coord-box">
        <div className="owner-coord-heading">
          <div><h2>Country speed controls</h2><p>L = 0.9s · M = 0.6s · H = 0.3s per calculation · grid emissions live from Electricity Maps</p></div>
        </div>
        {state?.countries.length ? state.countries.map((item) => {
          const grams = carbonIntensity(item.country)
          return (
            <div className="owner-coord-row" key={item.country}>
              <div className="owner-coord-country" title={countryLabel(item.country)}>
                <span className="owner-flag">{countryFlag(item.country)}</span>
                <strong>{countryName(item.country)}</strong>
                {grams !== undefined
                  ? <span className={`owner-coord-badge ${emissionLevel(grams)}`}>{emissionLevel(grams)} · {grams} gCO₂/kWh</span>
                  : <span className="owner-coord-badge">no emissions data</span>}
              </div>
              <div className="owner-speed">
                {(['L', 'M', 'H'] as const).map((mode) => (
                  <button key={mode} type="button" className={item.speed === mode ? 'active' : ''} onClick={() => setCountrySpeed(item.country, mode)}>{mode}</button>
                ))}
              </div>
            </div>
          )
        }) : <p className="owner-muted">No countries registered yet. Start the backend with ./start_workers.sh.</p>}
      </div>
    </>
  )

  if (part === 'workers') return (
    <div className="owner-coord-box">
      <div className="owner-coord-heading"><div><h2>Connected workers</h2></div></div>
      {workers.length === 0 && <p className="owner-muted">No workers reported yet.</p>}
      {workers.map((worker) => (
        <div className="owner-coord-row owner-worker" key={worker.name}>
          <span className="owner-dot" style={{ background: worker.color }} />
          <strong>{worker.name} <span title={countryLabel(worker.country)}>{countryFlag(worker.country)}</span></strong>
          <span className="owner-muted">{worker.addr}</span>
          <span className={`owner-coord-badge status-${worker.status}`}>{worker.status}</span>
          <span className="owner-muted owner-worker-chunk">chunk: {worker.chunk}</span>
        </div>
      ))}
    </div>
  )

  if (part === 'log') return (
    <div className="owner-coord-box">
      <div className="owner-coord-heading"><div><h2>Log</h2></div></div>
      <div className="owner-log" ref={logBox}>
        {logs.length === 0 && <p className="owner-muted">No log yet.</p>}
        {logs.map((entry, index) => (
          <div key={index} style={{ color: (entry.worker && workerColor[entry.worker]) || undefined }}>
            <span className="owner-muted">{entry.time} </span>{entry.msg}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="owner-coord-box">
      <div className="owner-coord-heading">
        <div>
          <h2>Chunk completion</h2>
          <p>{(state?.overall_pct ?? 0).toFixed(1)}% of this run ({state?.done ?? 0} / {state?.total ?? 0} chunks)</p>
        </div>
        <div className="owner-legend"><span className="not-done">Not done</span><span className="done">Done</span></div>
      </div>
      <div className="owner-chunk-grid">
        {chunks.map((chunk) => {
          const done = chunk.state === 'done'
          const country = chunk.state === 'in_progress' ? chunkCountry[chunk.name] : undefined
          return (
            <div key={chunk.num} className={`owner-chunk-tile ${done ? 'done' : ''}`}>
              #{chunk.num}<br />{done ? 100 : chunk.percent}%
              {/* flag of the worker computing this chunk, centered on the bottom-left corner */}
              {country && <span className="owner-chunk-flag" title={countryLabel(country)}>{countryFlag(country)}</span>}
            </div>
          )
        })}
      </div>
      {chunks.length === 0 && <p className="owner-muted">The chunks appear once the run starts.</p>}
    </div>
  )
}
