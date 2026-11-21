import { useEffect, useRef } from 'react'
import { Badge, Button, Progress, ScrollArea, SegmentedControl, SimpleGrid } from '@mantine/core'
import { IconPlayerPlay } from '@tabler/icons-react'
import { useCoordinator } from '../../hooks/useCoordinator'
import { emissionLevel, useCountryEmissions } from '../../hooks/useCountryEmissions'
import { countryFlag, countryLabel, countryName } from '../../utils/countryFlags'

// Same view as the Tkinter window in backend-prototype/coordinator.py, fed by the backend's WebSocket.
const statusColor = { busy: 'green', idle: 'blue', offline: 'gray', error: 'red' } as const

export function CoordinatorPage() {
  const { state, logs, connected, startRun, setCountrySpeed } = useCoordinator()
  const carbonIntensity = useCountryEmissions()
  const logViewport = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logViewport.current?.scrollTo({ top: logViewport.current.scrollHeight })
  }, [logs])

  const chunks = state?.chunks ?? []
  const count = (s: string) => chunks.filter((chunk) => chunk.state === s).length
  const workerColor = Object.fromEntries((state?.workers ?? []).map((worker) => [worker.name, worker.color]))
  // chunk file name -> country of the worker computing it right now
  const chunkCountry = Object.fromEntries((state?.workers ?? []).filter((worker) => worker.chunk !== '-').map((worker) => [worker.chunk, worker.country]))

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      <div style={{ display: 'grid', gap: 16, alignContent: 'start', minWidth: 0 }}>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Run</h2>
              <p>Chunks: {count('pending')} pending · {count('in_progress')} in progress · {count('done')} done</p>
            </div>
            <Badge color={connected ? 'green' : 'red'} variant="light">{connected ? 'Backend connected' : 'Backend offline'}</Badge>
          </div>
          <Button leftSection={<IconPlayerPlay size={16} />} disabled={!connected || state?.run_started} onClick={startRun}>
            {state?.run_started ? 'Run started' : 'Start run'}
          </Button>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div><h2>Country speed controls</h2><p>L = 0.9s, M = 0.6s, H = 0.3s per calculation · grid emissions live from Electricity Maps (Low &lt; 200, Medium &lt; 350, High ≥ 350 gCO₂/kWh)</p></div>
          </div>
          {state?.countries.length ? state.countries.map((item) => {
            const grams = carbonIntensity(item.country)
            const level = grams !== undefined ? emissionLevel(grams) : undefined
            return (
            <div key={item.country} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <strong title={countryLabel(item.country)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{countryFlag(item.country)}</span>
                  {countryName(item.country)}
                </strong>
                {level
                  ? <Badge color={level.color} variant="light" style={{ textTransform: 'none' }} title="Current carbon intensity of the electricity grid">{level.label} · {grams} gCO₂/kWh</Badge>
                  : <Badge color="gray" variant="light">No emissions data</Badge>}
              </div>
              <SegmentedControl size="xs" value={item.speed} onChange={(mode) => setCountrySpeed(item.country, mode)} data={['L', 'M', 'H']} />
            </div>
            )
          }) : <p className="muted-copy">No countries registered yet. Start the backend with ./start_workers.sh.</p>}
        </section>

        <section className="panel">
          <div className="panel-heading"><div><h2>Connected workers</h2></div></div>
          {(state?.workers ?? []).map((worker) => (
            <div key={worker.name} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: '6px 0', color: worker.color }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: worker.color, flexShrink: 0 }} />
              <strong style={{ whiteSpace: 'nowrap' }}>{worker.name} <span title={countryLabel(worker.country)}>{countryFlag(worker.country)}</span></strong>
              <span style={{ color: '#666' }}>{worker.addr}</span>
              <Badge size="xs" variant="light" color={statusColor[worker.status]}>{worker.status}</Badge>
              <span style={{ color: '#666', marginLeft: 'auto' }}>chunk: {worker.chunk}</span>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-heading"><div><h2>Log</h2></div></div>
          <ScrollArea h={280} viewportRef={logViewport}>
            <div style={{ fontFamily: 'Consolas, Menlo, monospace', fontSize: 12, lineHeight: 1.5 }}>
              {logs.length === 0 && <p className="muted-copy">No log yet.</p>}
              {logs.map((entry, index) => (
                <div key={index} style={{ color: (entry.worker && workerColor[entry.worker]) || undefined }}>
                  <span style={{ color: '#999' }}>{entry.time} </span>{entry.msg}
                </div>
              ))}
            </div>
          </ScrollArea>
        </section>
      </div>

      <section className="panel" style={{ alignSelf: 'start' }}>
        <div className="panel-heading"><div><h2>Project completion visualizer</h2></div></div>
        <strong>{(state?.overall_pct ?? 0).toFixed(1)}% completed ({state?.done ?? 0} / {state?.total ?? 0} chunks)</strong>
        <Progress value={state?.overall_pct ?? 0} color="green" mt="xs" mb="md" />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Badge color="red" variant="filled">Not done</Badge>
          <Badge color="green" variant="filled">Done</Badge>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 8 }}>
          {chunks.map((chunk) => {
            const done = chunk.state === 'done'
            const country = chunk.state === 'in_progress' ? chunkCountry[chunk.name] : undefined
            return (
              <div key={chunk.num} style={{ position: 'relative', background: done ? '#2E7D32' : '#C62828', color: 'white', borderRadius: 6, padding: '6px 0', textAlign: 'center', fontFamily: 'Consolas, Menlo, monospace', fontSize: 12, fontWeight: 700 }}>
                #{chunk.num}<br />{done ? 100 : chunk.percent}%
                {country && (
                  // flag of the worker computing this chunk, centered on the bottom-left corner
                  <span title={countryLabel(country)} style={{ position: 'absolute', left: 0, bottom: 0, transform: 'translate(-50%, 50%)', fontSize: 18, lineHeight: 1, zIndex: 1 }}>
                    {countryFlag(country)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        {chunks.length === 0 && <p className="muted-copy">The chunks appear once the run starts.</p>}
      </section>
    </SimpleGrid>
  )
}
