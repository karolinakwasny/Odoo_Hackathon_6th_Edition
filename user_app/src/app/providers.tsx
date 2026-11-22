import { useEffect, useState, type ReactNode } from 'react'
import type { NotifyTone } from '../utils/notify'

interface Toast {
  id: number
  title: string
  message: string
  tone: NotifyTone
}

export function Providers({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handleNotify = (event: Event) => {
      const detail = (event as CustomEvent<Omit<Toast, 'id'>>).detail
      const toast = { ...detail, id: Date.now() }
      setToasts((current) => [...current, toast])
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id))
      }, 4000)
    }
    window.addEventListener('compute-commons-notify', handleNotify)
    return () => window.removeEventListener('compute-commons-notify', handleNotify)
  }, [])

  return (
    <>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className={`native-toast ${toast.tone}`} key={toast.id}>
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  )
}
