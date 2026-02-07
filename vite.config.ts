import { defineConfig, loadEnv, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import { compression } from 'vite-plugin-compression2'
import topLevelAwait from 'vite-plugin-top-level-await'
import { visualizer } from 'rollup-plugin-visualizer'
import mkcert from 'vite-plugin-mkcert'

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
