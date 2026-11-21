import { Badge, Button, Progress } from '@mantine/core'
import { IconLeaf, IconPlayerPlay, IconRocket } from '@tabler/icons-react'
import { PageHeader } from '../../components/ui/PageHeader'

export function SimulationPage() {
  return (
    <>
      <PageHeader title="Simulation" description="Model network behavior and renewable energy scenarios." actions={<Badge color="green" variant="light">Ready to run</Badge>} />
      <div className="simulation-grid">
        <section className="panel simulation-main">
          <div className="panel-heading"><div><h2>Solar surplus scenario</h2><p>European regional capacity simulation</p></div><IconRocket size={22} /></div>
          <div className="solar-orb"><IconLeaf size={44} /><span>Current forecast</span><strong>82%</strong></div>
          <div className="simulation-bars">
            <div><span>Renewable availability</span><Progress value={82} color="lime" /></div>
            <div><span>Expected capacity</span><Progress value={67} color="green" /></div>
            <div><span>Estimated task throughput</span><Progress value={74} color="blue" /></div>
          </div>
          <Button leftSection={<IconPlayerPlay size={16} />} className="run-button">Run simulation</Button>
        </section>
        <section className="panel simulation-aside">
          <div className="panel-heading"><div><h2>Scenario parameters</h2><p>Mock configuration</p></div></div>
          <dl className="detail-list">
            <div><dt>Region</dt><dd>Europe</dd></div>
            <div><dt>Duration</dt><dd>24 hours</dd></div>
            <div><dt>Nodes</dt><dd>128</dd></div>
            <div><dt>Weather model</dt><dd>Solar optimized</dd></div>
          </dl>
        </section>
      </div>
    </>
  )
}
