import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Reservo',
        short_name: 'Reservo',
        description: 'Reserva tus servicios favoritos al instante.',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        theme_color: '#1F2A44',
        background_color: '#1F2A44',

        icons: [
          // ICONO APP → SOLO LA R
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },

          // ICONO USADO PARA SPLASH → TEXTO "RESERVO"
          {
            src: '/icons/splash-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  server: {
    origin: 'http://localhost:5173'
  }
});
