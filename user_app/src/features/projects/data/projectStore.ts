import { create } from 'zustand'
import type { Project } from '../../../types'
import { projects } from './projects'

export const useProjectStore = create<{ projects: Project[] }>(() => ({ projects }))
