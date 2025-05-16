interface ImportMetaEnv {
  VITE_BACKEND_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const BACKEND_API = import.meta.env.VITE_BACKEND_API || 'https://fallertrack-be.my.id';

export const API_ENDPOINTS = {
  HOME: `${BACKEND_API}/api/home`,
  CURRENT_DISTANCE: `${BACKEND_API}/api/current-distance`,
  SOS_LOCATION: `${BACKEND_API}/api/sos-location`,
  ALERT: `${BACKEND_API}/api/alert`,
  SUMMARIZE: `${BACKEND_API}/api/summarize`,
  FALL_NOTIFICATION: `${BACKEND_API}/api/fall-notification`,
}; 