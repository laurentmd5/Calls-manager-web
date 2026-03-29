// Configuration de l'API
export const API_CONFIG = {
  // URL de base de l'API - sans le / à la fin
  BASE_URL: 'http://localhost:8000',
  
  // Pas de préfixe ici, il sera géré dans les endpoints
  API_PREFIX: '',
  
  // Timeout des requêtes en millisecondes
  TIMEOUT: 10000,
  
  // Configuration des en-têtes par défaut
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/login',
    REGISTER: '/api/v1/register',
    PROFILE: '/api/v1/me',
  },
  USERS: {
    BASE: '/api/v1/users',
    BY_ID: (id: string) => `/api/v1/users/${id}`,
    COMMERCIALS: '/api/v1/users/commercials',
    INACTIVE: '/api/v1/users/inactive',
  },
  CLIENTS: {
    BASE: '/api/v1/clients',
    BY_ID: (id: string) => `/api/v1/clients/${id}`,
  },
  CALLS: {
    BASE: '/api/v1/calls',
    BY_ID: (id: string) => `/api/v1/calls/${id}`,
  },
  RECORDINGS: {
    BASE: '/api/v1/recordings',
    UPLOAD: '/api/v1/recordings/upload',
    BY_ID: (id: string) => `/api/v1/recordings/${id}`,
    DOWNLOAD: (id: string) => `/api/v1/recordings/${id}/download`,
  },
};
