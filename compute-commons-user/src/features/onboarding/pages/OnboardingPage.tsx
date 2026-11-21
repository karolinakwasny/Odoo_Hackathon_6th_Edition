import { useNavigate } from 'react-router-dom'
import { IconLeaf } from '@tabler/icons-react'
import { Button, Group, Text } from '@mantine/core'
import { useEffect } from 'react'
import { useUserStore } from '../../../store/userStore'

export function OnboardingPage() {
  const navigate = useNavigate()
  const onboardingCompleted = useUserStore((state) => state.onboardingCompleted)

  useEffect(() => {
    if (onboardingCompleted) navigate('/projects', { replace: true })
  }, [navigate, onboardingCompleted])

  return (
    <main className="onboarding">
      <nav className="welcome-nav">
        <div className="welcome-brand"><span className="brand-mark">C</span><strong>Compute Commons</strong></div>
      </nav>
      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="welcome-eyebrow"><IconLeaf size={16} /> Community-powered research</span>
          <h1>Put your unused computing power to work for a better world.</h1>
          <Text size="lg" c="dimmed">Join a shared network that supports climate research, biodiversity, scientific discovery and public-interest projects.</Text>
          <Group mt="xl">
            <Button size="lg" onClick={() => navigate('/onboarding')}>Get started</Button>
            <Button size="lg" variant="subtle" onClick={() => navigate(onboardingCompleted ? '/projects' : '/onboarding')}>Explore projects</Button>
          </Group>
        </div>
        <div className="network-visual" aria-label="Community computing network illustration">
          
        </div>
      </section>
    </main>
  )
}
