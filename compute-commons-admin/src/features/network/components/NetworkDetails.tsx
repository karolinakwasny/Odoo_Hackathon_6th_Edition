import { IconBolt, IconCpu, IconMemory, IconServer, IconX } from '@tabler/icons-react'
import type { ComputingNode, ElectricityZone } from '../types'
import { computingNodes } from '../../../mocks/electricity'

export type NetworkSelection =
  | { kind: 'zone'; zone: ElectricityZone }
  | { kind: 'node'; node: ComputingNode }
  | null

export function NetworkDetails({ selection, onClose }: { selection: NetworkSelection; onClose: () => void }) {
  if (!selection) return null

  if (selection.kind === 'node') {
    const node = selection.node
    return (
      <aside className="network-detail-panel">
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close details"><IconX size={16} /></button>
        <span className={`node-status-label ${node.status.toLowerCase()}`}><span />{node.status}</span>
        <h3>{node.name}</h3>
        <p>Connected computing node</p>
        <dl>
          <div><dt><IconCpu size={15} />CPU capacity</dt><dd>{node.cpuCapacity} cores</dd></div>
          <div><dt>CPU utilization</dt><dd>{node.cpuUtilization}%</dd></div>
          <div><dt><IconMemory size={15} />Available memory</dt><dd>{node.availableMemoryGb} GB</dd></div>
          <div><dt><IconServer size={15} />Current tasks</dt><dd>{node.currentTaskCount}</dd></div>
        </dl>
      </aside>
    )
  }

  const zone = selection.zone
  const nodes = computingNodes.filter((node) => node.zoneId === zone.id)
  const capacity = nodes.reduce((sum, node) => sum + node.cpuCapacity, 0)
  const mixEntries = Object.entries(zone.electricityMix)
  return (
    <aside className="network-detail-panel zone-detail-panel">
      <button className="detail-close" type="button" onClick={onClose} aria-label="Close details"><IconX size={16} /></button>
      <span className="zone-country">{zone.country}</span>
      <h3>{zone.name}</h3>
      <div className="zone-summary">
        <div><IconBolt size={16} /><strong>{zone.carbonIntensity}</strong><span>gCO₂eq/kWh</span></div>
        <div><strong>{zone.renewablePercentage}%</strong><span>renewables</span></div>
      </div>
      <div className="zone-mix">
        <h4>Electricity mix</h4>
        {mixEntries.map(([source, value]) => (
          <div className="mix-row" key={source}>
            <span>{source}</span>
            <div><i style={{ width: `${value}%` }} /></div>
            <strong>{value}%</strong>
          </div>
        ))}
      </div>
      <div className="zone-compute">
        <span>{nodes.length} connected nodes</span>
        <strong>{capacity} available CPU cores</strong>
      </div>
    </aside>
  )
}
