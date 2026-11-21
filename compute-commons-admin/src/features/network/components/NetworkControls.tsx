import { SegmentedControl, Select } from '@mantine/core'
import type { ElectricityMode, TimeInterval, TimeView } from '../types'

interface NetworkControlsProps {
  mode: ElectricityMode
  timeView: TimeView
  interval: TimeInterval
  onModeChange: (mode: ElectricityMode) => void
  onTimeViewChange: (view: TimeView) => void
  onIntervalChange: (interval: TimeInterval) => void
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
          { label: 'Renewable %', value: 'renewable' },
        ]}
      />
      <SegmentedControl
        size="xs"
        value={props.timeView}
        onChange={(value) => props.onTimeViewChange(value as TimeView)}
        data={[
          { label: 'Current', value: 'current' },
          { label: 'Historical', value: 'historical' },
          { label: 'Forecast', value: 'forecast' },
        ]}
      />
      <Select
        size="xs"
        aria-label="Time interval"
        value={props.interval}
        onChange={(value) => {
          if (value === '15m' || value === 'hourly') props.onIntervalChange(value)
        }}
        data={[
          { label: '15 minutes', value: '15m' },
          { label: 'Hourly', value: 'hourly' },
        ]}
      />
    </div>
  )
}
