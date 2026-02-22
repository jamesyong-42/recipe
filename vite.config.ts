import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import { compression } from 'vite-plugin-compression2'
import topLevelAwait from 'vite-plugin-top-level-await'
import { visualizer } from 'rollup-plugin-visualizer'
import mkcert from 'vite-plugin-mkcert'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }): UserConfig => {
  // Load all env vars from .env, .env.submodule, etc.
  const env = loadEnv(mode, process.cwd())
  // Read our base‐path (or default to '/')
  const base = env.VITE_BASE_PATH || '/'
  const debug = env.VITE_ENABLE_DEBUG === 'true'

  return {
    base,
    assetsInclude: ['**/*.wasm', '**/*.pck'],

    plugins: [
      mkcert(),
      wasm(),
      topLevelAwait(),
      react(),
      VitePWA({
        strategies: 'generateSW',
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        base,
        includeAssets: ['icon-192.svg', 'icon-512.svg', 'apple-touch-icon.svg'],
        manifest: {
          name: 'UI Snippet Manager',
          short_name: 'Snippets',
          description: 'Create, preview and manage UI code snippets',
          start_url: base,
          scope: base,
          display: 'standalone',
          orientation: 'any',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          lang: 'en',
          icons: [
            { src: 'icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
            { src: 'icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
            { src: 'apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,wasm}'],
          globIgnores: ['**/*.br'],
          navigateFallback: `${base}index.html`,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api-cache',
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/cdn\.sandpack\.dev\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'sandpack-cdn-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/esm\.sh\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'esm-sh-cache',
                expiration: { maxEntries: 150, maxAgeSeconds: 2592000 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/unpkg\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'unpkg-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 2592000 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
      compression({
        include: [/\.(js|mjs|json|css|html|wasm)$/i],
        threshold: 1024,
        deleteOriginalAssets: false,
        skipIfLargerOrEqual: true,
        algorithms: ['brotliCompress'],
      }),
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],

    build: {
      minify: 'terser',
      target: 'es2020',
      terserOptions: {
        compress: {
          ecma: 2020,
          passes: 3,
          drop_console: debug ? false : ['info'],
          pure_funcs: ['assert.*'],
          unused: true,
        },
        mangle: { toplevel: true },
        format: { comments: false },
      },
    },

    server: {
      host: true,
      port: 5178,
      strictPort: true
    },

    worker: {
      format: 'es',
    },
  }
})
