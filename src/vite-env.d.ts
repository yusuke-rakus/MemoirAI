declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
