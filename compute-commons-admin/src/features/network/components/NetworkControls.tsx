import { SegmentedControl } from '@mantine/core'
import type { ElectricityMode } from '../types'

interface NetworkControlsProps {
  mode: ElectricityMode
  onModeChange: (mode: ElectricityMode) => void
}

export function NetworkControls(props: NetworkControlsProps) {
  return (
    <div className="network-controls">
      <SegmentedControl
        size="xs"
        value={props.mode}
        onChange={(value) => props.onModeChange(value as ElectricityMode)}
        data={[
          { label: 'Carbon intensity', value: 'carbon' },
          { label: 'Total load', value: 'load' },
        ]}
      />
    </div>
  )
}
