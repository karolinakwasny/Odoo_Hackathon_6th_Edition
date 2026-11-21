import { useEffect, useRef, useState } from 'react'

// The coordinator's snapshot, as sent by backend-prototype/api.py ("state" message)
export interface CoordinatorWorker {
  name: string
  addr: string
  country: string
  color: string
  status: 'offline' | 'idle' | 'busy' | 'error'
  chunk: string
  speed: 'L' | 'M' | 'H'
}

export interface CoordinatorChunk {
  num: number
  name: string
  state: 'pending' | 'in_progress' | 'done'
  percent: number
}

export interface CoordinatorState {
  run_started: boolean
  workers: CoordinatorWorker[]
  countries: { country: string; speed: 'L' | 'M' | 'H' }[]
  chunks: CoordinatorChunk[]
  done: number
  total: number
  overall_pct: number
}

export interface CoordinatorLog {
  time: string
  msg: string
  worker: string | null
}

export function useCoordinator() {
  const [state, setState] = useState<CoordinatorState | null>(null)
  const [logs, setLogs] = useState<CoordinatorLog[]>([])
  const [connected, setConnected] = useState(false)
  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws')
    socket.current = ws
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'state') setState(msg)
      if (msg.type === 'log') setLogs((current) => [...current.slice(-199), msg])
    }
    return () => ws.close()
  }, [])

  function send(message: object) {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify(message))
  }

  return {
    state,
    logs,
    connected,
    startRun: () => send({ type: 'request', project_id: 'math' }),
    setCountrySpeed: (country: string, mode: string) => send({ type: 'speed', country, mode }),
  }
}
