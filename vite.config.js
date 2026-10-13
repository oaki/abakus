import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png'],
      manifest: {
        name: 'Hravý Abakus (Soroban)',
        short_name: 'Abakus',
        description: 'Interaktívna výučba počítania na japonskom abakuse (Soroban) pre deti.',
        theme_color: '#f8fafc',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192 512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    target: ['es2020', 'safari15', 'ios15']
  }
})
