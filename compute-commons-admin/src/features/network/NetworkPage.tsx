import { Badge } from '@mantine/core'
import { IconBolt, IconLeaf, IconMapPin, IconServer } from '@tabler/icons-react'
import { PageHeader } from '../../components/ui/PageHeader'

export function NetworkPage() {
  return (
    <>
      <PageHeader title="Network" description="Explore the distributed computing community." actions={<Badge color="green" variant="light">128 nodes online</Badge>} />
      <div className="placeholder-hero network-hero">
        <div className="hero-grid" />
        <div className="network-map-ring ring-one" /><div className="network-map-ring ring-two" />
        <div className="network-node node-one"><IconMapPin size={16} />Berlin</div>
        <div className="network-node node-two"><IconMapPin size={16} />Amsterdam</div>
        <div className="network-node node-three"><IconMapPin size={16} />Lisbon</div>
        <div className="network-map-caption">
          <IconServer size={24} />
          <div><strong>European network</strong><span>78.4% renewable-powered</span></div>
        </div>
      </div>
      <div className="placeholder-stats">
        <div className="panel"><IconServer /><strong>128</strong><span>Connected nodes</span></div>
        <div className="panel"><IconLeaf /><strong>78.4%</strong><span>Renewable energy</span></div>
        <div className="panel"><IconBolt /><strong>42.8 kWh</strong><span>Consumed today</span></div>
      </div>
    </>
  )
}
