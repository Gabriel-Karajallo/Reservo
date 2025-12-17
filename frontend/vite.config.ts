import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
  registerType: "autoUpdate",
  includeAssets: [
    "favicon.ico",
    "logo.png",
    "icons/icono192.png",
    "icons/icono512.png",
    "icons/titulo192.png",
    "icons/titulo512.png"
  ],
  manifest: {
    name: "Reservo",
    short_name: "Reservo",
    description: "Reserva tus servicios favoritos al instante.",
    theme_color: "#1f2f4d",
    background_color: "#1f2f4d",
    display: "standalone",
    start_url: "/",
    scope: "/",
    icons: [
      // ICONO DE LA APP (R)
      {
        src: "icons/icono192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "icons/icono512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },

      // SPLASH SCREEN (logo Reservo texto)
      {
        src: "icons/titulo192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "icons/titulo512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  }
})
  ],

  server: {
    origin: "http://localhost:5173",
  }
});
