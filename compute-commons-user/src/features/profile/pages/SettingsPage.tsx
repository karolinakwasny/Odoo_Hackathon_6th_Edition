import { useState } from 'react'
import { Button, Checkbox, Group, MultiSelect, SegmentedControl, Select, Slider, TextInput } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { PageHeader } from '../../../components/common/PageHeader'
import { useUserStore } from '../../../store/userStore'
import type { ProjectCategory, UserProfile } from '../../../types'

const interests: ProjectCategory[] = ['Climate & Environment','Biodiversity & Ecosystems','Scientific Research','Open Source & Public Infrastructure','Space & Astronomy','Social Good','Education']

export function SettingsPage() {
  const store = useUserStore()
  const [draft, setDraft] = useState({
    username: store.username,
    displayName: store.displayName ?? '',
    profileType: store.profileType,
    organisationName: store.organisationName ?? '',
    country: store.country,
    region: store.region ?? '',
    city: store.city ?? '',
    interests: store.interests,
  })

  function save() {
    if (draft.username.trim().length < 3) {
      notifications.show({ title: 'Username required', message: 'Use at least 3 characters.', color: 'red' })
      return
    }
    if (!draft.country) {
      notifications.show({ title: 'Country required', message: 'Choose a country.', color: 'red' })
      return
    }
    if (draft.profileType === 'Organisation' && !draft.organisationName.trim()) {
      notifications.show({ title: 'Organisation name required', message: 'Enter a name for your organisation.', color: 'red' })
      return
    }
    store.setProfile({
      username: draft.username.trim(),
      displayName: draft.displayName.trim(),
      profileType: draft.profileType,
      organisationName: draft.organisationName.trim(),
      country: draft.country,
      region: draft.region,
      city: draft.city,
    })
    store.updateInterests(draft.interests)
    notifications.show({ title: 'Settings saved', message: 'Your profile has been updated locally.', color: 'green' })
  }

  function toggleInterest(value: ProjectCategory) {
    setDraft((state) => ({ ...state, interests: state.interests.includes(value) ? state.interests.filter((item) => item !== value) : [...state.interests, value] }))
  }

  return (
    <>
      <PageHeader title="Settings" description="Update your profile and contribution preferences." />
      <div className="settings-grid">
        <section className="settings-section"><h2>Profile</h2>
          <SegmentedControl
            fullWidth
            value={draft.profileType}
            onChange={(value) => setDraft({ ...draft, profileType: value as UserProfile['profileType'] })}
            data={['Individual', 'Organisation']}
          />
          <TextInput label="Username" required value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.currentTarget.value })} />
          <TextInput label="Display name" value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.currentTarget.value })} />
          {draft.profileType === 'Organisation' && <TextInput label="Organisation name" required value={draft.organisationName} onChange={(event) => setDraft({ ...draft, organisationName: event.currentTarget.value })} />}
          <Select label="Country" required searchable value={draft.country} onChange={(value) => setDraft({ ...draft, country: value ?? '' })} data={['Belgium','Canada','Denmark','France','Germany','India','Netherlands','Norway','Poland','Portugal','Spain','United Kingdom','United States','Other']} />
          <TextInput label="Region" value={draft.region} onChange={(event) => setDraft({ ...draft, region: event.currentTarget.value })} /><TextInput label="City" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.currentTarget.value })} />
        </section>
        <section className="settings-section"><h2>Interests</h2><div className="settings-interests">{interests.map((interest) => <Checkbox key={interest} checked={draft.interests.includes(interest)} onChange={() => toggleInterest(interest)} label={interest} />)}</div></section>
        <section className="settings-section"><h2>Contribution preferences</h2><SegmentedControl fullWidth value={store.deviceType} onChange={(value) => store.setProfile({ deviceType: value as UserProfile['deviceType'] })} data={['Desktop','Laptop','Server']} />
          <div className="range-control"><div><label>Maximum CPU usage</label><strong>{store.cpuUsage}%</strong></div><Slider value={store.cpuUsage} onChange={(value) => store.setProfile({ cpuUsage: value })} /></div>
          <MultiSelect
            label="Availability"
            value={store.availability}
            onChange={(value) => store.setProfile({ availability: value as UserProfile['availability'] })}
            data={['Mornings', 'Afternoons', 'Evenings']}
            clearable
          />
          <Checkbox checked={store.prioritizeRenewableEnergy} onChange={(event) => store.setProfile({ prioritizeRenewableEnergy: event.currentTarget.checked })} label="Prioritize renewable energy" />
          <Checkbox checked={store.allowPostponement} onChange={(event) => store.setProfile({ allowPostponement: event.currentTarget.checked })} label="Allow tasks to be postponed" />
        </section>
      </div>
      <Group justify="flex-end" mt="lg"><Button onClick={save}>Save changes</Button></Group>
    </>
  )
}
