/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_DIARY_IMAGE_MODEL?: string;
    readonly VITE_DIARY_IMAGE_SIZE?: string;
    readonly VITE_RECAPTCHA_ENTERPRISE_SITE_KEY?: string;
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
