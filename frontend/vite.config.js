import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['favicon.svg', 'icons/icon-192.svg', 'icons/icon-512.svg'],
      manifest: {
        name: 'IA Low-Cost Assistant',
        short_name: 'IALowCost',
        description: 'Assistant public bilingue fonctionnant en mode hybride offline/online',
        theme_color: '#1976d2',
        background_color: '#f5f5f5',
        display: 'standalone',
        lang: 'fr',
        dir: 'ltr',
        icons: [
          {
            src: 'icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  },
  build: {
    outDir: 'dist'
  }
});
