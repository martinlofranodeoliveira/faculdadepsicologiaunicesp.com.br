/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CRM_LEAD_ENDPOINT?: string
  readonly VITE_CRM_API_KEY?: string
  readonly VITE_CRM_BEARER_TOKEN?: string
  readonly VITE_CRM_EMPRESA?: string
  readonly VITE_CRM_ETAPA_GRAD?: string
  readonly VITE_CRM_ETAPA_POS?: string
  readonly VITE_CRM_FUNIL_GRAD?: string
  readonly VITE_CRM_FUNIL_POS?: string
  readonly VITE_CRM_STATUS_LEAD?: string
  readonly VITE_CRM_FONTE_ID?: string
  readonly VITE_CRM_FONTE_TEXTO?: string
  readonly VITE_CRM_ORIGEM?: string
  readonly VITE_CRM_POLO?: string
  readonly VITE_POS_COURSES_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
