import { create } from 'zustand'
import type { Project } from '../types'

export const projectOwnerProjects: Project[] = [
  { id:'open-climate-data', name:'Open Climate Data', description:'Processed regional climate datasets into a consistent, publicly accessible research archive.', category:'Open Source & Public Infrastructure', organization:'Open Earth Initiative', status:'Completed', progress:100, contributors:713, activeNodes:0, nodeCount:9, image:'data', whyItMatters:'Public environmental datasets should be consistent and accessible to researchers and community planners.', whatItDoes:'Cleaned, validated and converted public environmental records into standardized research datasets.', resultsUsedFor:'The completed archive now supports independent climate planning and research projects.', collaboratorCountries:['DE','FR','DK','NO','GB','CA','US'] },
  { id:'forest-guardian', name:'Forest Guardian', description:'Process satellite imagery to identify deforestation and vegetation change across protected regions.', category:'Biodiversity & Ecosystems', organization:'Global Forest Observatory', status:'Recruiting', progress:0, contributors:1184, activeNodes:0, nodeCount:14, image:'restoration', whyItMatters:'Satellites capture imagery of forests around the world. Processing those observations at scale helps conservation teams identify deforestation, vegetation loss and ecosystem change quickly.', whatItDoes:'Compares satellite image sections across different dates and calculates indicators of vegetation change.', resultsUsedFor:'Areas that may require investigation are prioritized for local conservation organizations.', collaboratorCountries:['BR','NO','DK','DE','FR','AU','CA','ES'] },
]

interface ProjectStore { projects: Project[] }
export const useProjectStore = create<ProjectStore>(() => ({ projects: projectOwnerProjects }))
