import type { ReactNode } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { theme } from '../styles/theme'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  )
}
