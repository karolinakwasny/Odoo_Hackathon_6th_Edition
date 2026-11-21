import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProjectCategory, UserProfile } from '../types'

interface UserStore extends UserProfile {
  onboardingCompleted: boolean
  joinedProjectIds: string[]
  contributionEnabled: boolean
  setProfile: (profile: Partial<UserProfile>) => void
  completeOnboarding: () => void
  joinProject: (projectId: string) => void
  leaveProject: (projectId: string) => void
  setContributionEnabled: (enabled: boolean) => void
  updateInterests: (interests: ProjectCategory[]) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: 'Alex',
      email: 'alex@example.com',
      username: 'alex',
      displayName: 'Alex',
      country: '',
      region: '',
      city: '',
      electricityZone: '',
      interests: [],
      deviceType: 'Laptop',
      cpuUsage: 50,
      availability: 'When idle',
      activeHours: '',
      prioritizeRenewableEnergy: true,
      allowPostponement: true,
      onboardingCompleted: false,
      joinedProjectIds: [],
      contributionEnabled: true,
      setProfile: (profile) => set(profile),
      completeOnboarding: () => set({ onboardingCompleted: true }),
      joinProject: (projectId) => set((state) => ({
        joinedProjectIds: state.joinedProjectIds.includes(projectId)
          ? state.joinedProjectIds
          : [...state.joinedProjectIds, projectId],
      })),
      leaveProject: (projectId) => set((state) => ({
        joinedProjectIds: state.joinedProjectIds.filter((id) => id !== projectId),
      })),
      setContributionEnabled: (enabled) => set({ contributionEnabled: enabled }),
      updateInterests: (interests) => set({ interests }),
    }),
    { name: 'compute-commons-user-profile' },
  ),
)
