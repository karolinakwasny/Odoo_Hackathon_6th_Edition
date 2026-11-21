import { Badge, Button, Card, Text } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/common/PageHeader'
import { useUserStore } from '../../../store/userStore'

export function ProfilePage() {
  const navigate = useNavigate()
  const store = useUserStore()
  const name = store.displayName || store.username
  return (
    <>
      <PageHeader title="Profile" description="Your contribution identity and interests." action={<Button variant="light" onClick={() => navigate('/settings')}>Edit profile</Button>} />
      <Card withBorder className="profile-summary">
        <div className="profile-avatar">{name.slice(0, 1).toUpperCase()}</div>
        <div><Text fw={700} size="xl">{name}</Text><Text c="dimmed">@{store.username}</Text><Badge mt={6} variant="light" color="forest">{store.profileType}</Badge></div>
      </Card>
      <div className="profile-details">
        {store.profileType === 'Organisation' && <Card withBorder><h3>Organisation</h3><Text c="dimmed">{store.organisationName || 'Not set'}</Text></Card>}
        <Card withBorder><h3>Location</h3><Text c="dimmed">{[store.city, store.region, store.country].filter(Boolean).join(', ') || 'Not set'}</Text>{store.electricityZone && <Badge mt="md" variant="light">Zone {store.electricityZone}</Badge>}</Card>
        <Card withBorder><h3>Interests</h3><div className="profile-tags">{store.interests.length ? store.interests.map((interest) => <Badge key={interest} variant="light" color="forest">{interest}</Badge>) : <Text c="dimmed">No interests selected</Text>}</div></Card>
      </div>
    </>
  )
}
