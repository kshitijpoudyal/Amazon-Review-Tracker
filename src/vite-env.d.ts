/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ORIGIN?: string;
  readonly VITE_SENDGRID_API_KEY?: string;
  readonly VITE_FROM_EMAIL?: string;
  readonly VITE_FROM_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
