import { useState } from 'react'
import { Badge } from '@mantine/core'
import { IconArrowRight, IconLeaf, IconServer } from '@tabler/icons-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { NetworkControls } from './components/NetworkControls'
import { ElectricityMap } from './components/ElectricityMap'
import { NetworkDetails, type NetworkSelection } from './components/NetworkDetails'
import type { ElectricityMode, TimeInterval, TimeView } from './types'
import { schedulerAllocations } from '../../mocks/scheduler'

export function NetworkPage() {
  const [mode, setMode] = useState<ElectricityMode>('carbon')
  const [timeView, setTimeView] = useState<TimeView>('current')
  const [interval, setInterval] = useState<TimeInterval>('15m')
  const [selection, setSelection] = useState<NetworkSelection>(null)

  return (
    <>
      <PageHeader
        title="Network"
        description="Electricity conditions and distributed computing capacity across Europe."
        actions={<Badge color="green" variant="light">128 nodes online</Badge>}
      />

      <section className="network-map-section">
        <NetworkControls
          mode={mode}
          timeView={timeView}
          interval={interval}
          onModeChange={setMode}
          onTimeViewChange={setTimeView}
          onIntervalChange={setInterval}
        />
        <div className="network-map-wrap">
          <ElectricityMap
            mode={mode}
            timeView={timeView}
            interval={interval}
            onZoneSelect={(zone) => setSelection({ kind: 'zone', zone })}
            onNodeSelect={(node) => setSelection({ kind: 'node', node })}
          />
          <NetworkDetails selection={selection} onClose={() => setSelection(null)} />
          <div className="map-legend">
            <strong>{mode === 'carbon' ? 'Carbon intensity' : 'Renewable energy'}</strong>
            {mode === 'carbon' ? (
              <><div className="legend-gradient carbon" /><div className="legend-values"><span>50</span><span>200</span><span>400</span><span>650+ gCO₂eq/kWh</span></div></>
            ) : (
              <><div className="legend-gradient renewable" /><div className="legend-values"><span>20%</span><span>45%</span><span>65%</span><span>100%</span></div></>
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
