import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  UserResponse, 
  UsersResponse 
} from '@/types/api';

// Création d'une instance Axios avec la configuration de base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...API_CONFIG.headers,
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token JWT aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Ne pas ajouter le token pour les routes d'authentification
    if (token && !config.url?.includes('/login') && !config.url?.includes('/register')) {
      // S'assurer que le token est au bon format (avec le préfixe Bearer)
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = authToken;
      
      // Ajouter les en-têtes nécessaires pour les requêtes CORS
      config.headers['Content-Type'] = 'application/json';
      config.headers.Accept = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour logger les réponses
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.config.url, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Gestion des erreurs HTTP
      const { status } = error.response;
      
      if (status === 401) {
        // Rediriger vers la page de connexion si non authentifié
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      
      // Vous pouvez ajouter plus de gestion d'erreurs ici
      console.error('Erreur API:', error.response.data);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Aucune réponse du serveur:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Fonctions d'aide pour les appels API
export const api = {
  // Méthodes CRUD de base
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.get<T>(url, config),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.post<T>(url, data, config),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.put<T>(url, data, config),
  
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.delete<T>(url, config),
  
  // Téléchargement de fichier
  upload: <T>(
    url: string, 
    file: File, 
    fieldName: string = 'file',
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<AxiosResponse<T>> => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    return apiClient.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },
  
  // Téléchargement de fichier
  download: <T = Blob>(url: string, config?: AxiosRequestConfig): Promise<T> => 
    apiClient.get<T>(url, { ...config, responseType: 'blob' })
      .then(response => response.data),
};

// Services spécifiques
export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion avec:', { email });
      
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN, 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true
        }
      );
      
      console.log('Réponse de connexion reçue:', response.data);
      
      // Stocker le token avec le préfixe Bearer
      if (response.data?.access_token) {
        const token = response.data.access_token;
        console.log('Token reçu:', token);
        
        // Stocker le token brut (sans le préfixe Bearer)
        const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
        localStorage.setItem('access_token', cleanToken);
        
        // Mettre à jour l'en-tête d'autorisation pour les requêtes suivantes
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
        
        console.log('Token stocké et en-tête mis à jour');
        
        // Si la réponse contient des données utilisateur, les retourner également
        if (response.data.user) {
          return {
            ...response,
            data: {
              ...response.data,
              user: response.data.user
            }
          };
        }
      } else {
        console.error('Aucun token dans la réponse de connexion');
      }
      
      return response;
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // En cas d'erreur, nettoyer le token
      localStorage.removeItem('access_token');
      delete apiClient.defaults.headers.common['Authorization'];
      
      throw error;
    }
  },
    
  register: (userData: RegisterRequest) => 
    api.post<UserResponse>(API_ENDPOINTS.AUTH.REGISTER, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    
  getProfile: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Aucun token trouvé');
      }

      console.log('Récupération du profil avec le token:', token);
      
      const response = await apiClient.get<UserResponse>(API_ENDPOINTS.AUTH.PROFILE, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.replace(/^Bearer\s+/i, '')}`
        },
        withCredentials: true
      });
      
      console.log('Réponse du profil:', response.data);
      return response;
      
    } catch (error: any) {
      console.error('Erreur lors de la récupération du profil:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Si le token est invalide ou expiré
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('access_token');
        delete apiClient.defaults.headers.common['Authorization'];
      }
      
      throw error;
    }
  },
};

export const userService = {
  getAll: () => api.get<UsersResponse>(API_ENDPOINTS.USERS.BASE),
  getById: (id: string) => api.get<UserResponse>(API_ENDPOINTS.USERS.BY_ID(id)),
  create: (userData: RegisterRequest) => 
    api.post<UserResponse>(API_ENDPOINTS.USERS.BASE, userData),
  update: (id: string, userData: Partial<RegisterRequest>) => 
    api.put<UserResponse>(API_ENDPOINTS.USERS.BY_ID(id), userData),
  delete: (id: string) => api.delete<{ success: boolean }>(API_ENDPOINTS.USERS.BY_ID(id)),
};

export const clientService = {
  getAll: () => api.get(API_ENDPOINTS.CLIENTS.BASE),
  getById: (id: string) => api.get(API_ENDPOINTS.CLIENTS.BY_ID(id)),
  create: (clientData: any) => api.post(API_ENDPOINTS.CLIENTS.BASE, clientData),
  update: (id: string, clientData: any) => 
    api.put(API_ENDPOINTS.CLIENTS.BY_ID(id), clientData),
  delete: (id: string) => api.delete(API_ENDPOINTS.CLIENTS.BY_ID(id)),
};

export const callService = {
  getAll: () => api.get(API_ENDPOINTS.CALLS.BASE),
  getById: (id: string) => api.get(API_ENDPOINTS.CALLS.BY_ID(id)),
  create: (callData: any) => api.post(API_ENDPOINTS.CALLS.BASE, callData),
  update: (id: string, callData: any) => 
    api.put(API_ENDPOINTS.CALLS.BY_ID(id), callData),
  delete: (id: string) => api.delete(API_ENDPOINTS.CALLS.BY_ID(id)),
};

export const recordingService = {
  getAll: () => api.get(API_ENDPOINTS.RECORDINGS.BASE),
  getById: (id: string) => api.get(API_ENDPOINTS.RECORDINGS.BY_ID(id)),
  download: (id: string) => api.download(API_ENDPOINTS.RECORDINGS.DOWNLOAD(id)),
  upload: (file: File, onUploadProgress?: (progressEvent: AxiosProgressEvent) => void) => 
    api.upload<{ success: boolean; url: string }>(API_ENDPOINTS.RECORDINGS.UPLOAD, file, 'file', onUploadProgress),
  delete: (id: string) => api.delete(API_ENDPOINTS.RECORDINGS.BY_ID(id)),
};

export default api;
