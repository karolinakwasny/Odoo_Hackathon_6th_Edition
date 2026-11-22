import { IconArrowRight, IconLeaf } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

export function WelcomePage() {
  const navigate = useNavigate()
  return (
    <main className="welcome-page">
      <nav className="welcome-nav">
        <div className="welcome-brand"><span className="brand-mark">C</span><strong>Compute Commons</strong></div>
      </nav>
      <section className="welcome-hero">
        <div>
          <span className="welcome-eyebrow"><IconLeaf size={16} /> Community-powered research</span>
          <h1>Put unused computing power to work for a better world.</h1>
          <p>Support climate research, biodiversity, scientific discovery and public-interest projects with the resources you already have.</p>
          <button className="native-button welcome-button" type="button" onClick={() => navigate('/onboarding')}>Get started <IconArrowRight size={18} /></button>
        </div>
        <div className="welcome-orbit" aria-hidden="true">
          <span /><span /><span /><div>C</div>
        </div>
      </section>
    </main>
  )
}
