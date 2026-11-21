import { useNavigate } from 'react-router-dom'
import { IconArrowRight, IconNetwork, IconLeaf } from '@tabler/icons-react'
import { Button, Group, Text } from '@mantine/core'

export function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <main className="onboarding">
      <nav className="welcome-nav">
        <div className="welcome-brand"><span className="brand-mark">C</span><strong>Compute Commons</strong></div>
        <Button variant="subtle" onClick={() => navigate('/projects')}>Explore projects</Button>
      </nav>
      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="welcome-eyebrow"><IconLeaf size={16} /> Community-powered research</span>
          <h1>Put your unused computing power to work for a better world.</h1>
          <Text size="lg" c="dimmed">Join a shared network that supports climate research, biodiversity, scientific discovery and public-interest projects.</Text>
          <Group mt="xl">
            <Button size="lg" rightSection={<IconArrowRight size={18} />} onClick={() => navigate('/onboarding')}>Get started</Button>
            <Button size="lg" variant="subtle" onClick={() => navigate('/projects')}>Explore projects</Button>
          </Group>
        </div>
        <div className="network-visual" aria-label="Community computing network illustration">
          <div className="network-orbit orbit-one" /><div className="network-orbit orbit-two" />
          <div className="network-core"><IconNetwork size={38} stroke={1.4} /></div>
          {['C','C','C','C','C','C'].map((letter, index) => (
            <span className={`network-node node-${index + 1}`} key={index}>{letter}</span>
          ))}
        </div>
      </section>
    </main>
  )
}
