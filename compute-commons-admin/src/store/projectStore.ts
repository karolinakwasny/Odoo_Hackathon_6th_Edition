import { create } from 'zustand'
import type { CreateProjectInput, Project, ProjectStatus } from '../features/projects/types'
import { initialProjects } from '../mocks/projects'

interface ProjectStore {
  projects: Project[]
  get: (id: string) => Project | undefined
  add: (input: CreateProjectInput) => Project
  update: (id: string, updates: Partial<Project>) => void
  changeStatus: (id: string, status: ProjectStatus) => void
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: initialProjects,
  get: (id) => get().projects.find((project) => project.id === id),
  add: (input) => {
    const project: Project = {
      ...input,
      id: `project-${crypto.randomUUID()}`,
      status: 'Queued',
      completedTasks: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      allocatedNodes: [],
      recentActivity: [{
        id: `activity-${crypto.randomUUID()}`,
        title: 'Project created',
        detail: 'Added to the scheduling queue',
        time: 'Just now',
      }],
    }
    set((state) => ({ projects: [project, ...state.projects] }))
    return project
  },
  update: (id, updates) => set((state) => ({
    projects: state.projects.map((project) => project.id === id ? { ...project, ...updates } : project),
  })),
  changeStatus: (id, status) => set((state) => ({
    projects: state.projects.map((project) => project.id === id ? { ...project, status } : project),
  })),
}))
