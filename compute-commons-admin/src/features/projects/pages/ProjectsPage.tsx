import { useMemo, useState } from 'react'
import { Button, Select, TextInput } from '@mantine/core'
import { IconPlus, IconSearch } from '@tabler/icons-react'
import { EmptyState } from '../../../components/ui/EmptyState'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectForm } from '../components/ProjectForm'
import { useProjectStore } from '../../../store/projectStore'
import { useHubProgress } from '../../../hooks/useHubProgress'
import type { CreateProjectInput, ProjectStatus } from '../types'

export function ProjectsPage() {
  const [opened, setOpened] = useState(false)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProjectStatus | 'All'>('All')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const projects = useProjectStore((state) => state.projects)
  const add = useProjectStore((state) => state.add)
  const hub = useHubProgress()
  const runningProjects = hub?.projects.filter((project) => project.running > 0).length ?? 0

  const filtered = useMemo(() => projects.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
    && (status === 'All' || project.status === status),
  ), [projects, search, status])

  const stats = [
    ['Total projects', projects.length],
    ['Running', runningProjects],
    ['Queued', projects.filter((project) => project.status === 'Queued').length],
    ['Completed', projects.filter((project) => project.status === 'Completed').length],
  ]

  function createProject(input: CreateProjectInput) {
    add(input)
  }

  return (
    <>
      <div className="welcome-row page-header">
        <div />
        <Button leftSection={<IconPlus size={17} />} onClick={() => setOpened(true)}>New project</Button>
      </div>

      <div className="stats-grid project-stats">
        {stats.map(([label, value]) => (
          <div className="stat-card compact-stat" key={String(label)}>
            <span className="stat-label">{String(label)}</span>
            <strong className="stat-value">{String(value)}</strong>
          </div>
        ))}
      </div>

      <div className="project-toolbar">
        <TextInput value={search} onChange={(event) => setSearch(event.currentTarget.value)} leftSection={<IconSearch size={16} />} placeholder="Search projects" aria-label="Search projects" />
        <Select value={status} onChange={(value) => setStatus((value ?? 'All') as ProjectStatus | 'All')} data={['All', 'Running', 'Queued', 'Paused', 'Completed']} aria-label="Filter by status" />
      </div>

      {filtered.length > 0 ? (
        <div className="project-list">
          {filtered.map((project) => (
            <ProjectCard
              project={project}
              key={project.id}
              expanded={expandedId === project.id}
              onToggle={() => setExpandedId(expandedId === project.id ? null : project.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState description="Try a different name or status filter." />
      )}

      <ProjectForm opened={opened} onClose={() => setOpened(false)} onSubmit={createProject} />
    </>
  )
}
