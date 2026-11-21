import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AvailabilityPeriod, ProjectCategory, UserProfile } from '../types'

interface UserStore extends UserProfile {
  onboardingCompleted: boolean
  joinedProjectIds: string[]
  activeProjectIds: string[]
  contributionEnabled: boolean
  setProfile: (profile: Partial<UserProfile>) => void
  completeOnboarding: () => void
  joinProject: (projectId: string) => void
  leaveProject: (projectId: string) => void
  startContribution: (projectId: string) => void
  stopContribution: (projectId: string) => void
  setContributionEnabled: (enabled: boolean) => void
  updateInterests: (interests: ProjectCategory[]) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      name: 'Alex',
      email: 'alex@example.com',
      profileType: 'Individual',
      organisationName: '',
      username: 'alex',
      displayName: 'Alex',
      country: '',
      region: '',
      city: '',
      electricityZone: '',
      interests: [],
      deviceType: 'Laptop',
      cpuUsage: 50,
      availability: ['Evenings'] as AvailabilityPeriod[],
      activeHours: '',
      prioritizeRenewableEnergy: true,
      allowPostponement: true,
      onboardingCompleted: false,
      joinedProjectIds: [],
      activeProjectIds: [],
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
        activeProjectIds: state.activeProjectIds.filter((id) => id !== projectId),
        contributionEnabled: state.activeProjectIds.filter((id) => id !== projectId).length > 0,
      })),
      startContribution: (projectId) => set((state) => ({
        activeProjectIds: state.activeProjectIds.includes(projectId)
          ? state.activeProjectIds
          : [...state.activeProjectIds, projectId],
        contributionEnabled: true,
      })),
      stopContribution: (projectId) => set((state) => {
        const activeProjectIds = state.activeProjectIds.filter((id) => id !== projectId)
        return { activeProjectIds, contributionEnabled: activeProjectIds.length > 0 }
      }),
      setContributionEnabled: (enabled) => set({ contributionEnabled: enabled }),
      updateInterests: (interests) => set({ interests }),
    }),
    {
      name: 'compute-commons-user-profile',
      merge: (persisted, current) => {
        const stored = persisted as Partial<UserStore>
        return {
          ...current,
          ...stored,
          activeProjectIds: Array.isArray(stored.activeProjectIds) ? stored.activeProjectIds : [],
          joinedProjectIds: Array.isArray(stored.joinedProjectIds) ? stored.joinedProjectIds : current.joinedProjectIds,
          profileType: stored.profileType === 'Organisation' ? 'Organisation' : 'Individual',
          availability: Array.isArray(stored.availability)
            ? stored.availability
            : ['Evenings'],
        }
      },
    },
  ),
)
