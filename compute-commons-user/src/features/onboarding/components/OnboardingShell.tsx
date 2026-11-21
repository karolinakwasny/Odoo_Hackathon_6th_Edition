import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Checkbox, Group, Progress, SegmentedControl, Select, Slider, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconLeaf, IconMicroscope, IconPlanet, IconTrees, IconWorld, IconSchool, IconBrandOpenSource } from '@tabler/icons-react'
import { useUserStore } from '../../../store/userStore'
import type { ProjectCategory, UserProfile } from '../../../types'

const steps = [
  { key: 'profile', path: '/onboarding', title: 'Create your profile', description: 'Choose the name the community will know you by.' },
  { key: 'location', path: '/onboarding/location', title: 'Where are you contributing from?', description: 'Regional electricity conditions help us schedule work more thoughtfully.' },
  { key: 'interests', path: '/onboarding/interests', title: 'What matters to you?', description: 'Select interests to make project recommendations more useful.' },
  { key: 'preferences', path: '/onboarding/preferences', title: 'Set your contribution preferences', description: 'You stay in control and can pause at any time.' },
]

const interests: Array<{ name: ProjectCategory; description: string; icon: typeof IconLeaf }> = [
  { name: 'Climate & Environment', description: 'Climate modeling and planetary health', icon: IconLeaf },
  { name: 'Biodiversity & Ecosystems', description: 'Species and habitat research', icon: IconTrees },
  { name: 'Scientific Research', description: 'Open scientific discovery', icon: IconMicroscope },
  { name: 'Open Source & Public Infrastructure', description: 'Tools and datasets for everyone', icon: IconBrandOpenSource },
  { name: 'Space & Astronomy', description: 'Observations beyond our planet', icon: IconPlanet },
  { name: 'Social Good', description: 'Community and humanitarian work', icon: IconWorld },
  { name: 'Education', description: 'Learning resources and research', icon: IconSchool },
]

export function OnboardingShell() {
  const { step } = useParams()
  const stepIndex = step === 'location' ? 1 : step === 'interests' ? 2 : step === 'preferences' ? 3 : 0
  const navigate = useNavigate()
  const store = useUserStore()
  const [usernameError, setUsernameError] = useState('')

  function continueStep() {
    if (stepIndex === 0 && store.username.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return
    }
    setUsernameError('')
    if (stepIndex === 1 && !store.country.trim()) {
      notifications.show({ title: 'Country required', message: 'Choose a country to continue.', color: 'red' })
      return
    }
    if (stepIndex === 3) {
      store.completeOnboarding()
      notifications.show({ title: 'Profile created', message: 'You are ready to discover projects.', color: 'green' })
      navigate('/projects')
      return
    }
    navigate(steps[stepIndex + 1].path)
  }

  function toggleInterest(category: ProjectCategory) {
    store.updateInterests(store.interests.includes(category)
      ? store.interests.filter((item) => item !== category)
      : [...store.interests, category])
  }

  const current = steps[stepIndex]
  return (
    <main className="onboarding-shell">
      <section className="onboarding-panel">
        <div className="onboarding-brand"><span className="brand-mark">C</span><strong>Compute Commons</strong></div>
        <Progress value={(stepIndex + 1) * 25} color="forest" size="sm" />
        <div className="step-copy">
          <span>Step {stepIndex + 1} of 4</span>
          <h1>{current.title}</h1>
          <p>{current.description}</p>
        </div>

        {stepIndex === 0 && (
          <div className="onboarding-form">
            <TextInput label="Username" required value={store.username} error={usernameError} onChange={(event) => store.setProfile({ username: event.currentTarget.value })} />
            <TextInput label="Display name (optional)" value={store.displayName ?? ''} onChange={(event) => store.setProfile({ displayName: event.currentTarget.value })} />
          </div>
        )}
        {stepIndex === 1 && (
          <div className="onboarding-form">
            <Select label="Country" required searchable value={store.country} onChange={(value) => store.setProfile({ country: value ?? '' })} data={['Belgium','Canada','Denmark','France','Germany','India','Netherlands','Norway','Poland','Portugal','Spain','United Kingdom','United States','Other']} />
            <TextInput label="Region (optional)" value={store.region ?? ''} onChange={(event) => store.setProfile({ region: event.currentTarget.value })} />
            <TextInput label="City (optional)" value={store.city ?? ''} onChange={(event) => store.setProfile({ city: event.currentTarget.value })} />
            <TextInput label="Electricity zone (optional)" placeholder="For example: DE or NL" value={store.electricityZone ?? ''} onChange={(event) => store.setProfile({ electricityZone: event.currentTarget.value })} />
            <div className="form-explanation">Electricity conditions vary between regions. This helps the scheduler prioritize cleaner, lower-impact work without using an exact address.</div>
          </div>
        )}
        {stepIndex === 2 && (
          <div className="interest-grid">
            {interests.map(({ name, description, icon: Icon }) => {
              const selected = store.interests.includes(name)
              return (
                <button type="button" key={name} className={`interest-card${selected ? ' selected' : ''}`} onClick={() => toggleInterest(name)}>
                  <Icon size={21} stroke={1.6} />
                  <strong>{name}</strong>
                  <span>{description}</span>
                </button>
              )
            })}
          </div>
        )}
        {stepIndex === 3 && (
          <div className="preferences-form">
            <label>Device type</label>
            <SegmentedControl fullWidth value={store.deviceType} onChange={(value) => store.setProfile({ deviceType: value as UserProfile['deviceType'] })} data={['Desktop','Laptop','Server']} />
            <div className="range-control"><div><label>Maximum CPU usage</label><strong>{store.cpuUsage}%</strong></div><Slider value={store.cpuUsage} onChange={(value) => store.setProfile({ cpuUsage: value })} marks={[{ value: 25, label: '25%' },{ value: 50, label: '50%' },{ value: 75, label: '75%' },{ value: 100, label: '100%' }]} /></div>
            <Select label="Availability" value={store.availability} onChange={(value) => store.setProfile({ availability: (value ?? 'When idle') as UserProfile['availability'] })} data={['Always','When idle','Scheduled hours']} />
            {store.availability === 'Scheduled hours' && <TextInput label="Active hours" placeholder="18:00–22:00" value={store.activeHours ?? ''} onChange={(event) => store.setProfile({ activeHours: event.currentTarget.value })} />}
            <Checkbox checked={store.prioritizeRenewableEnergy} onChange={(event) => store.setProfile({ prioritizeRenewableEnergy: event.currentTarget.checked })} label="Prioritize renewable energy" description="Favor contribution periods when cleaner electricity is available." />
            <Checkbox checked={store.allowPostponement} onChange={(event) => store.setProfile({ allowPostponement: event.currentTarget.checked })} label="Allow tasks to wait for cleaner energy" description="Low-priority tasks may be postponed until cleaner capacity is available." />
            <div className="form-explanation">You remain in control. You can pause your contribution at any time from My Computer.</div>
          </div>
        )}

        <Group justify="space-between" mt="xl">
          <Button variant="subtle" disabled={stepIndex === 0} onClick={() => navigate(steps[stepIndex - 1]?.path ?? '/onboarding')}>Back</Button>
          <Button onClick={continueStep}>{stepIndex === 3 ? 'Create profile' : 'Continue'}</Button>
        </Group>
      </section>
    </main>
  )
}
