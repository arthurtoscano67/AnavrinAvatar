/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AVATAR_RENDERER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
