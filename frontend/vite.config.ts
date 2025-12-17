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
      // ICONO DE LA APP (la R)
      {
        src: 'icons/icono192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: 'icons/icono512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },

      // SPLASH SCREEN (logo Reservo texto)
      {
        src: 'icons/titulo512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  }
})
  ],

  server: {
    origin: "http://localhost:5173",
  }
});
