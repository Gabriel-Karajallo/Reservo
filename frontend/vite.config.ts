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
      includeAssets: [
        'favicon.ico',
        'logo.png',
        'icons/icono192.png',
        'icons/icono512.png'
      ],
      manifest: {
        name: 'Reservo',
        short_name: 'Reservo',
        description: 'Reserva tus servicios favoritos al instante.',
        theme_color: '#0f6f63',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/cliente/home',
        icons: [
          {
            src: 'icons/icono192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icono512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      }
    })
  ],

  server: {
    origin: "http://localhost:5173",
  }
});
