import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '@/services/api';
import { User, UserResponse } from '@/types/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRequiredRole: (user: User | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Fonction pour normaliser les données utilisateur
  const normalizeUser = (data: any): User | null => {
    if (!data) return null;
    
    // Si les données sont déjà au bon format
    if (data.id && data.email) {
      return data as User;
    }
    
    // Si les données sont dans une propriété data
    if (data.data && data.data.id && data.data.email) {
      return data.data as User;
    }
    
    return null;
  };
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await authService.getProfile();
      const userData = normalizeUser(response.data);
      
      if (userData) {
        // Vérifier si l'utilisateur a le rôle requis
        if (!hasRequiredRole(userData)) {
          console.log('Utilisateur sans rôle admin/manager détecté, déconnexion...');
          localStorage.removeItem('access_token');
          setUser(null);
          setIsLoading(false);
          toast({
            title: 'Accès refusé',
            description: 'Vous n\'avez pas les droits nécessaires pour accéder à cette application.',
            variant: 'destructive',
          });
          return;
        }
        setUser(userData);
      } else {
        // Si le token est invalide ou expiré
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('access_token');
        }
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur de vérification de l\'authentification:', error);
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const hasRequiredRole = useCallback((user: User | null): boolean => {
    if (!user) return false;
    return ['ADMIN', 'MANAGER'].includes(user.role.toUpperCase());
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      // Vérifier si la réponse contient un token d'accès
      if (response && response.access_token) {
        const profileResponse = await authService.getProfile();
        const userData = normalizeUser(profileResponse.data);
        
        if (userData) {
          // Vérifier si l'utilisateur a le rôle requis
          if (!hasRequiredRole(userData)) {
            localStorage.removeItem('access_token');
            toast({
              title: 'Accès refusé',
              description: 'Vous n\'avez pas les droits nécessaires pour accéder à cette application.',
              variant: 'destructive',
            });
            return false;
          }
          
          setUser(userData);
          return true;
        }
      }
      
      localStorage.removeItem('access_token');
      return false;
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      localStorage.removeItem('access_token');
      toast({
        title: 'Erreur de connexion',
        description: 'Une erreur est survenue lors de la connexion.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // Supprimer le token et les données utilisateur
    localStorage.removeItem('access_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
        hasRequiredRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
