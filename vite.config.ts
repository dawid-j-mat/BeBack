import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': a new build waits for the user's tap on the "new version"
      // bar (src/components/UpdateToast.tsx) instead of swapping mid-use.
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'BeBack',
        short_name: 'BeBack',
        description: 'Prywatny dziennik podróży',
        lang: 'pl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#F1E8D4',
        background_color: '#F1E8D4',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        // Offline-first (SPEC §3.5): map tiles, glyphs and fonts come from
        // the service worker cache when the network is gone. Supabase is
        // deliberately NOT cached here - entry data lives in the app layer
        // (outbox + localStorage snapshot), where sync can reason about it.
        runtimeCaching: [
          {
            // OpenFreeMap: vector tiles and glyph ranges (D-18). CacheFirst:
            // tiles are immutable enough for a travel journal, and revisited
            // areas should render with zero network.
            urlPattern: /^https:\/\/tiles\.openfreemap\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 600, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts stylesheet: tiny, may change (new subsets), so
            // serve from cache while revalidating in the background.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'font-css' },
          },
          {
            // Font files are content-hashed by Google - safe to cache long.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
