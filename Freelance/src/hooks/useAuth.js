import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getUser();
        const currentToken = authService.getToken();
        const isAuth = authService.isAuthenticated();

        setUser(currentUser);
        setToken(currentToken);
        setIsAuthenticated(isAuth);

        // Configurar renovación automática del token
        if (isAuth) {
          authService.setupTokenRefresh();
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.data.user);
        setToken(result.data.token);
        setIsAuthenticated(true);
        authService.setupTokenRefresh();
      }
      
      return result;
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error al iniciar sesión'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    try {
      const success = await authService.refreshToken();
      if (success) {
        setToken(authService.getToken());
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Error al renovar token:', error);
      logout();
      return false;
    }
  };

  // Función para hacer peticiones autenticadas
  const authenticatedFetch = async (url, options = {}) => {
    try {
      return await authService.authenticatedFetch(url, options);
    } catch (error) {
      if (error.message === 'Sesión expirada') {
        logout();
      }
      throw error;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    authenticatedFetch
  };
};

export default useAuth;
