import { useEffect, useState } from 'react'

export interface HubProgress {
  type: 'progress'
  projects: { id: string; done: number; running: number; total: number; percent: number }[]
  nodes_online: number
}

export function useHubProgress() {
  const [progress, setProgress] = useState<HubProgress | null>(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'progress') setProgress(msg)
    }
    return () => ws.close()
  }, [])

  return progress // null until connected (or when the backend isn't running)
}