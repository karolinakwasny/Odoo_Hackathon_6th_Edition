import { useEffect, useState } from 'react'
import { Badge } from '@mantine/core'
import { IconArrowRight, IconLeaf, IconServer } from '@tabler/icons-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { NetworkControls } from './components/NetworkControls'
import { ElectricityMap } from './components/ElectricityMap'
import { NetworkDetails, type NetworkSelection } from './components/NetworkDetails'
import type { ElectricityMode } from './types'
import { schedulerAllocations } from '../../mocks/scheduler'
import { fetchLatestElectricityZones } from '../../services/electricityMaps'
import type { ElectricityZone } from './types'

export function NetworkPage() {
  const [mode, setMode] = useState<ElectricityMode>('carbon')
  const [selection, setSelection] = useState<NetworkSelection>(null)
  const [liveZones, setLiveZones] = useState<ElectricityZone[]>([])
  const [liveStatus, setLiveStatus] = useState<'loading' | 'live' | 'error'>('loading')

  useEffect(() => {
    let active = true
    fetchLatestElectricityZones().then((result) => {
      if (!active) return
      setLiveZones(result.zones)
      setLiveStatus(result.live ? 'live' : 'error')
    })
    return () => { active = false }
  }, [])

  return (
    <>
      <PageHeader
        title="Network"
        description="Live worldwide electricity carbon intensity and total load."
        actions={
          <div className="network-page-status">
            <Badge color={liveStatus === 'live' ? 'green' : 'gray'} variant="light">
              {liveStatus === 'loading' ? 'Loading live API data' : liveStatus === 'live' ? 'Live API data' : 'API unavailable'}
            </Badge>
            <Badge color="green" variant="light">128 nodes online</Badge>
          </div>
        }
      />

      <section className="network-map-section">
        <NetworkControls
          mode={mode}
          onModeChange={setMode}
        />
        <div className="network-map-wrap">
          <ElectricityMap
            mode={mode}
            zones={liveZones}
            onZoneSelect={(zone) => setSelection({ kind: 'zone', zone })}
          />
          <NetworkDetails selection={selection} onClose={() => setSelection(null)} />
          <div className="map-legend">
            <strong>{mode === 'carbon' ? 'Carbon intensity' : 'Total load'}</strong>
            {mode === 'carbon' ? (
              <><div className="legend-gradient carbon" /><div className="legend-values"><span>50</span><span>200</span><span>400</span><span>650+ gCO₂eq/kWh</span></div></>
            ) : (
              <><div className="legend-gradient load" /><div className="legend-values"><span>10k</span><span>30k</span><span>60k</span><span>100k+ MW</span></div></>
            )}
          </div>
          <div className="map-node-key"><span /><b>Computing node</b></div>
        </div>
      </section>

      <section className="scheduler-section">
        <div className="scheduler-heading">
          <div>
            <h2>Environment-aware scheduler</h2>
            <p>Recent allocation decisions across the network</p>
          </div>
          <span className="scheduler-live"><span />Live preview</span>
        </div>
        <div className="scheduler-layout">
          <div className="scheduler-flow">
            {schedulerAllocations.map((allocation) => (
              <article className="scheduler-row" key={allocation.id}>
                <div className="scheduler-zone favorable"><IconLeaf size={17} /><span><small>Favorable region</small><strong>{allocation.region}</strong></span></div>
                <IconArrowRight className="scheduler-arrow" size={16} />
                <div className="scheduler-zone receiving"><IconServer size={17} /><span><small>Receiving task</small><strong>{allocation.project}</strong></span></div>
                <div className="scheduler-node"><span /><b>{allocation.node}</b><small>{allocation.taskCount} tasks</small></div>
                <time>{allocation.time}</time>
              </article>
            ))}
          </div>
          <aside className="scheduler-summary">
            <span>Scheduler score</span>
            <strong>94.2</strong>
            <p>12 allocations shifted toward cleaner regions this hour</p>
          </aside>
        </div>
      </section>
    </>
  )
}
