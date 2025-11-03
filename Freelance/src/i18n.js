import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      app: {
        title: 'FreelanceHub'
      },
      greeting: 'Bienvenido/a',
      top: {
        searchPlaceholder: 'Buscar...'
      },
      premium: {
        upgrade: 'Actualizar a Premium'
      },
      settings: {
        title: 'Configuración',
        description: 'Personaliza tu experiencia en la plataforma',
        language: {
          title: 'Idioma',
          interface: 'Idioma de la interfaz',
          timezone: 'Zona horaria'
        },
        saveChanges: 'Guardar cambios'
      },
      login: {
        title: 'Iniciar Sesión',
        welcome: 'Bienvenido de nuevo',
        emailLabel: 'Correo electrónico',
        emailPlaceholder: 'usuario@ejemplo.com',
        passwordLabel: 'Contraseña',
        forgotPassword: '¿Olvidaste tu contraseña?',
        rememberMe: 'Recordarme',
        signingIn: 'Iniciando sesión...',
        signIn: 'Iniciar sesión',
        noAccount: '¿No tienes cuenta? ',
        registerNow: 'Regístrate ahora',
        continueWith: 'O continúa con',
        social: {
          google: 'Google',
          github: 'GitHub',
          microsoft: 'Microsoft'
        },
        messages: {
          successRedirect: 'Login exitoso - Redirigiendo...',
          errorLogin: 'Error al iniciar sesión',
          errorConnection: 'Error de conexión con el servidor'
        }
      },
      register: {
        title: 'Crear Cuenta',
        stepTitles: {
            register: {
              title: 'Create Account',
              stepTitles: {
                1: 'Personal Information',
                2: 'Contact Information',
                3: 'Password & Terms'
              },
              firstName: 'First name',
              lastName: 'Last name',
              emailLabel: 'Email',
              usernameLabel: 'Username',
              placeholders: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'user@example.com',
                username: 'johndoe'
              },
              next: 'Next',
              back: 'Back',
              registering: 'Registering...',
              createAccount: 'Create account',
              loginLink: 'Sign in',
              orRegisterWith: 'Or register with',
              terms: {
                title: 'Terms and Conditions',
                acceptText: 'I accept the Terms and Conditions and the Privacy Policy',
                close: 'Close'
              },
              privacy: {
                title: 'Privacy Policy'
              },
              messages: {
                passwordsMismatch: 'Passwords do not match',
                passwordTooShort: 'Password must be at least 8 characters',
                success: 'Registration successful! Account created.'
              }
            },
          1: 'Información Personal',
          2: 'Información de Contacto',
          3: 'Contraseña y Términos'
        },
        firstName: 'Nombre',
        lastName: 'Apellido',
        emailLabel: 'Correo electrónico',
        usernameLabel: 'Nombre de usuario',
        placeholders: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'usuario@ejemplo.com',
          username: 'juanperez'
        },
        next: 'Siguiente',
        back: 'Atrás',
        registering: 'Registrando...',
        createAccount: 'Crear cuenta',
        loginLink: 'Iniciar sesión',
        orRegisterWith: 'O regístrate con',
        terms: {
          title: 'Términos y Condiciones',
          acceptText: 'Acepto los Términos y Condiciones y la Política de Privacidad',
          close: 'Cerrar'
        },
        privacy: {
          title: 'Política de Privacidad'
        },
        messages: {
          passwordsMismatch: 'Las contraseñas no coinciden',
          passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
          success: '¡Registro exitoso! Cuenta creada.'
        }
      },
      actions: {
        save: 'Guardar',
        saving: 'Guardando...',
        saved: 'Guardado',
        saveLanguage: 'Guardar idioma'
      }
    }
  },
  en: {
    translation: {
      app: {
        title: 'FreelanceHub'
      },
            register: {
              title: 'Crear Cuenta',
              stepTitles: {
                1: 'Información Personal',
                2: 'Información de Contacto',
                3: 'Contraseña y Términos'
              },
              firstName: 'Nombre',
              lastName: 'Apellido',
              emailLabel: 'Correo electrónico',
              usernameLabel: 'Nombre de usuario',
              placeholders: {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'usuario@ejemplo.com',
                username: 'juanperez'
              },
              next: 'Siguiente',
              back: 'Atrás',
              registering: 'Registrando...',
              createAccount: 'Crear cuenta',
              loginLink: 'Iniciar sesión',
              orRegisterWith: 'O regístrate con',
              terms: {
                title: 'Términos y Condiciones',
                acceptText: 'Acepto los Términos y Condiciones y la Política de Privacidad',
                close: 'Cerrar'
              },
              privacy: {
                title: 'Política de Privacidad'
              },
              messages: {
                passwordsMismatch: 'Las contraseñas no coinciden',
                passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
                success: '¡Registro exitoso! Cuenta creada.'
              }
            },
      greeting: 'Welcome',
      top: {
        searchPlaceholder: 'Search...'
      },
      premium: {
        upgrade: 'Upgrade to Premium'
      },
      settings: {
        title: 'Settings',
        description: 'Customize your experience on the platform',
        language: {
          title: 'Language',
          interface: 'Interface language',
          timezone: 'Timezone'
        },
        saveChanges: 'Save changes'
      },
      login: {
        title: 'Sign in',
        welcome: 'Welcome back',
        emailLabel: 'Email',
        emailPlaceholder: 'user@example.com',
        passwordLabel: 'Password',
        forgotPassword: 'Forgot your password?',
        rememberMe: 'Remember me',
        signingIn: 'Signing in...',
        signIn: 'Sign in',
        noAccount: 'Don\'t have an account? ',
        registerNow: 'Register now',
        continueWith: 'Or continue with',
        social: {
          google: 'Google',
          github: 'GitHub',
          microsoft: 'Microsoft'
        },
          register: {
            title: 'Create Account',
            stepTitles: {
              1: 'Personal Information',
              2: 'Contact Information',
              3: 'Password & Terms'
            },
            firstName: 'First name',
            lastName: 'Last name',
            emailLabel: 'Email',
            usernameLabel: 'Username',
            placeholders: {
              firstName: 'John',
              lastName: 'Doe',
              email: 'user@example.com',
              username: 'johndoe'
            },
            next: 'Next',
            back: 'Back',
            registering: 'Registering...',
            createAccount: 'Create account',
            loginLink: 'Sign in',
            orRegisterWith: 'Or register with',
            terms: {
              title: 'Terms and Conditions',
              acceptText: 'I accept the Terms and Conditions and the Privacy Policy',
              close: 'Close'
            },
            privacy: {
              title: 'Privacy Policy'
            },
            messages: {
              passwordsMismatch: 'Passwords do not match',
              passwordTooShort: 'Password must be at least 8 characters',
              success: 'Registration successful! Account created.'
            }
          },
        messages: {
          successRedirect: 'Login successful - Redirecting...',
          errorLogin: 'Error signing in',
          errorConnection: 'Connection error with server'
        }
      },
      actions: {
        save: 'Save',
        saving: 'Saving...',
        saved: 'Saved',
        saveLanguage: 'Save language'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('appLanguage') || 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
