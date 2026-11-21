import { create } from 'zustand'
import type { Project } from '../../../types'
import { projects } from './projects'

interface ProjectStore {
  projects: Project[]
}

export const useProjectStore = create<ProjectStore>(() => ({
  projects,
}))
