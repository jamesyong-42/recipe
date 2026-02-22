/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
interface ImportMetaEnv {
  readonly VITE_BASE_PATH: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_IS_PREVIEW: string
  // add other VITE_… vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}