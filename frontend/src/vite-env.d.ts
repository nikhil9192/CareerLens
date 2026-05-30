/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_DEFAULT_SCHOOL_ID: string;
  readonly VITE_DEFAULT_TEACHER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
