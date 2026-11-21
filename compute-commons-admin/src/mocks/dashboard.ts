export const dashboardStats: Array<{
  label: string
  value: string
  change: string
  icon: 'nodes' | 'tasks' | 'energy' | 'power'
  color: string
}> = [
  {
    label: "Connected nodes",
    value: "128",
    change: "+12 this week",
    icon: "nodes",
    color: "green",
  },
  {
    label: "Active tasks",
    value: "342",
    change: "86 running",
    icon: "tasks",
    color: "blue",
  },
  {
    label: "Renewable energy",
    value: "78.4%",
    change: "+8.2% vs baseline",
    icon: "energy",
    color: "lime",
  },
  {
    label: "Energy consumed",
    value: "42.8 kWh",
    change: "Today",
    icon: "power",
    color: "orange",
  },
]

export const schedulerEvents = [
  {
    id: 1,
    time: "10:42:08",
    title: "Task assigned to Berlin-03",
    description: "High solar availability · 92%",
    type: "success",
  },
  {
    id: 2,
    time: "10:41:52",
    title: "New node connected",
    description: "Amsterdam-02 joined the network",
    type: "info",
  },
  {
    id: 3,
    time: "10:41:30",
    title: "Task completed",
    description: "Climate simulation · Task #452",
    type: "success",
  },
  {
    id: 4,
    time: "10:40:15",
    title: "Task waiting for resources",
    description: "Low available computing capacity",
    type: "warning",
  },
]