import { useMemo, useState } from 'react'
import { Select, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { PageHeader } from '../../../components/common/PageHeader'
import { ProjectCard } from '../../../components/common/ProjectCard'
import { useProjectStore } from '../data/projectStore'
import { useUserStore } from '../../../store/userStore'
import type { ProjectCategory } from '../../../types'

export function ProjectsPage() {
  const projects = useProjectStore((state) => state.projects)
  const interests = useUserStore((state) => state.interests)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProjectCategory | 'All'>('All')
  const [requirements, setRequirements] = useState('All')
  const [energy, setEnergy] = useState('All')
  const filtered = useMemo(() => projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
    && (category === 'All' || project.category === category)
    && (requirements === 'All' || project.requirements === requirements)
    && (energy === 'All' || project.energyPreference === energy)), [projects, search, category, requirements, energy])
  const recommended = filtered.filter((project) => interests.includes(project.category)).slice(0, 3)
  const recommendedIds = new Set(recommended.map((project) => project.id))
  const rest = filtered.filter((project) => !recommendedIds.has(project.id))
  return (
    <>
      <PageHeader title="Discover projects" description="Find meaningful work that your available computing capacity can support." />
      <div className="project-filters">
        <TextInput leftSection={<IconSearch size={16} />} placeholder="Search projects" value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
        <Select value={category} onChange={(value) => setCategory((value ?? 'All') as ProjectCategory | 'All')} data={['All','Climate & Environment','Biodiversity & Ecosystems','Scientific Research','Open Source & Public Infrastructure','Space & Astronomy','Social Good','Education']} />
        <Select value={requirements} onChange={(value) => setRequirements(value ?? 'All')} data={['All','Low','Medium','High']} />
        <Select value={energy} onChange={(value) => setEnergy(value ?? 'All')} data={['All','Flexible','Renewable preferred','Anytime']} />
      </div>
      {recommended.length > 0 && (
        <section className="project-section">
          <h2>Recommended for you</h2>
          <p>Based on the interests you selected.</p>
          <div className="project-grid">{recommended.map((project) => <ProjectCard key={project.id} project={project} recommended />)}</div>
        </section>
      )}
      <section className="project-section">
        <h2>All projects</h2>
        {rest.length > 0 ? <div className="project-grid">{rest.map((project) => <ProjectCard key={project.id} project={project} />)}</div> : <p className="muted-empty">No projects match these filters.</p>}
      </section>
    </>
  )
}
