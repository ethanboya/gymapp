import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Take over from any previously installed service worker immediately on
      // update, instead of leaving a stale cached build stuck until every tab
      // is closed - this is exactly the kind of stale-deploy issue that broke
      // the app on a phone earlier.
      workbox: {
        clientsClaim: true,
        skipWaiting: true
      },
      manifest: {
        name: 'Gym Tracker',
        short_name: 'Gym Tracker',
        description: 'A mobile-first workout log with progress graphs and PR tracking.',
        start_url: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#052e22',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
