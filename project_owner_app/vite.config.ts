import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.API_KEY_MAPS
  return {
    plugins: [react()],
    server: {
      proxy: apiKey ? {
        '/electricity-maps': {
          target: 'https://api.electricitymaps.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/electricity-maps/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => proxyReq.setHeader('auth-token', apiKey))
          },
        },
      } : undefined,
    },
  }
})
