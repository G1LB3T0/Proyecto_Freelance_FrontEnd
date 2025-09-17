// Servicio de autenticación para manejar tokens y localStorage
class AuthService {
    constructor() {
        // URL base del backend - ajustar según tu configuración
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        this.tokenKey = 'authToken';
        this.userKey = 'userData';
    }

    // Guardar token en localStorage
    setToken(token) {
        try {
            localStorage.setItem(this.tokenKey, token);
            console.log('Token guardado exitosamente');
        } catch (error) {
            console.error('Error al guardar token:', error);
        }
    }

    // Obtener token del localStorage
    getToken() {
        try {
            return localStorage.getItem(this.tokenKey);
        } catch (error) {
            console.error('Error al obtener token:', error);
            return null;
        }
    }

    // Guardar datos del usuario en localStorage
    setUser(userData) {
        try {
            localStorage.setItem(this.userKey, JSON.stringify(userData));
            console.log('Datos de usuario guardados exitosamente');
        } catch (error) {
            console.error('Error al guardar datos de usuario:', error);
        }
    }

    // Obtener datos del usuario del localStorage
    getUser() {
        try {
            const userData = localStorage.getItem(this.userKey);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error al obtener datos de usuario:', error);
            return null;
        }
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Decodificar el token para verificar expiración
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            // Verificar si el token ha expirado
            if (payload.exp && payload.exp < currentTime) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error al verificar token:', error);
            this.logout();
            return false;
        }
    }

    // Función de login
    async login(email, password) {
        try {
            const url = `${this.baseURL}/login/login`;
            console.log('🔗 Intentando conectar a:', url);
            console.log('📤 Datos a enviar:', { email, password });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            const data = await response.json();
            console.log('📥 Response data:', data);

            if (data.success && data.data.token) {
                // Guardar token y datos del usuario
                this.setToken(data.data.token);
                this.setUser(data.data.user);

                console.log('✅ Login exitoso:', data.message);
                return {
                    success: true,
                    data: data.data,
                    message: data.message
                };
            } else {
                console.error('❌ Error en login:', data.message);
                return {
                    success: false,
                    message: data.message || 'Error al iniciar sesión'
                };
            }
        } catch (error) {
            console.error('🚨 Error de conexión completo:', error);
            console.error('🚨 Error message:', error.message);
            console.error('🚨 URL intentada:', `${this.baseURL}/api/login`);
            return {
                success: false,
                message: 'Error de conexión con el servidor. Verifica que el backend esté corriendo en ' + this.baseURL
            };
        }
    }

    // Función de logout
    logout() {
        try {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            console.log('Sesión cerrada exitosamente');

            // Opcional: Redirigir al login
            window.location.href = '/login';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }

    // Verificar token con el servidor
    async verifyToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${this.baseURL}/api/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error al verificar token con servidor:', error);
            return false;
        }
    }

    // Refrescar token
    async refreshToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const response = await fetch(`${this.baseURL}/api/refresh-token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success && data.data.token) {
                this.setToken(data.data.token);
                console.log('Token renovado exitosamente');
                return true;
            } else {
                console.error('Error al renovar token:', data.message);
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Error al renovar token:', error);
            this.logout();
            return false;
        }
    }

    // Hacer peticiones autenticadas
    async authenticatedFetch(url, options = {}) {
        const token = this.getToken();

        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            // Si el token ha expirado, intentar renovarlo
            if (response.status === 401 || response.status === 403) {
                const refreshed = await this.refreshToken();

                if (refreshed) {
                    // Reintentar la petición con el nuevo token
                    config.headers.Authorization = `Bearer ${this.getToken()}`;
                    return await fetch(url, config);
                } else {
                    this.logout();
                    throw new Error('Sesión expirada');
                }
            }

            return response;
        } catch (error) {
            console.error('Error en petición autenticada:', error);
            throw error;
        }
    }

    // Configurar interceptor para renovación automática de token
    setupTokenRefresh() {
        const token = this.getToken();
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convertir a milliseconds
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            // Renovar el token 5 minutos antes de que expire
            const refreshTime = timeUntilExpiry - (5 * 60 * 1000);

            if (refreshTime > 0) {
                setTimeout(() => {
                    this.refreshToken();
                }, refreshTime);
            }
        } catch (error) {
            console.error('Error al configurar renovación automática:', error);
        }
    }
}

// Crear instancia singleton
const authService = new AuthService();

// Configurar renovación automática al cargar la página
if (typeof window !== 'undefined') {
    authService.setupTokenRefresh();
}

export default authService;
