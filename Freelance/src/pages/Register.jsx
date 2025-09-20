import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    postalCode: '',
    userType: '', // Agregar campo para tipo de usuario
    agreeTerms: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear password error when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.username;
      case 2:
        return formData.phone && formData.dateOfBirth && formData.gender &&
          formData.country && formData.postalCode && formData.userType;
      case 3:
        if (formData.password !== formData.confirmPassword) {
          setPasswordError('Las contraseñas no coinciden');
          return false;
        }
        if (formData.password.length < 8) {
          setPasswordError('La contraseña debe tener al menos 8 caracteres');
          return false;
        }
        return formData.password && formData.confirmPassword && formData.agreeTerms;
      default:
        return true;
    }
  };

  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  const openPrivacyModal = (e) => {
    e.preventDefault();
    setShowPrivacyModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  const closePrivacyModal = () => {
    setShowPrivacyModal(false);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    console.log('handleLoginClick ejecutado - navegando a login');
    navigate('/');
  };

  const handleNextClick = () => {
    if (validateStep(currentStep)) {
      nextStep();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setIsSubmitting(true);

    // Validar que todos los campos requeridos estén llenos
    const requiredFields = [
      'firstName', 'lastName', 'email', 'username', 'password',
      'phone', 'dateOfBirth', 'gender', 'country', 'postalCode', 'userType'
    ];

    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

    if (missingFields.length > 0) {
      console.error('Campos faltantes:', missingFields);
      alert(`Por favor completa todos los campos: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    const requestData = {
      email: formData.email.trim(),
      password: formData.password,
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      username: formData.username.trim(),
      phone: formData.phone.trim(),
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      country: formData.country.trim(),
      postal_code: formData.postalCode.trim(),
      user_type: formData.userType
    };

    console.log('Datos que se envían al servidor:', requestData);
    console.log('Validación completa - todos los campos presentes');

    // Verificar específicamente el formato de fecha
    if (!requestData.date_of_birth || requestData.date_of_birth === '') {
      console.error('Fecha de nacimiento faltante');
      alert('Por favor selecciona tu fecha de nacimiento');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = {
            message: `Error ${response.status}: ${response.statusText}`,
            details: 'No se pudo parsear la respuesta del servidor'
          };
        }

        console.error('=== ERROR DETALLADO DEL SERVIDOR ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('URL llamada:', 'http://localhost:3000/register');
        console.error('Método:', 'POST');
        console.error('Headers enviados:', {
          'Content-Type': 'application/json'
        });
        console.error('Error Data COMPLETO:', JSON.stringify(errorData, null, 2));
        console.error('Datos enviados COMPLETO:', JSON.stringify(requestData, null, 2));

        // Intentar obtener el texto crudo de la respuesta para más detalles
        try {
          const responseClone = response.clone();
          const textResponse = await responseClone.text();
          console.error('Respuesta RAW del servidor:', textResponse);
        } catch (textError) {
          console.error('No se pudo obtener la respuesta en texto:', textError);
        }

        console.error('=== FIN ERROR DETALLADO ===');

        // Manejar errores específicos
        if (response.status === 500) {
          const errorMessage = errorData.error || errorData.message || 'Error interno del servidor. Verifica que todos los campos sean válidos.';
          throw new Error(`Error 500 - ${errorMessage}`);
        }

        // Manejar la estructura de error del servidor
        const errorMessage = errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      // Manejar la respuesta según la estructura del servidor
      if (data.success) {
        const userEmail = data.data?.user?.email || formData.email;
        const userName = data.data?.user?.username || formData.username;

        // Mostrar mensaje de éxito
        setRegistrationSuccess(true);
        setRegistrationMessage(`¡Registro exitoso! Cuenta creada para: ${userEmail} con username: ${userName}`);

        // Redireccionar al login después de un registro exitoso
        setTimeout(() => {
          navigate('/');
        }, 3000); // Esperar 3 segundos para que el usuario vea el mensaje
      } else {
        throw new Error(data.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => {
    const percentage = ((currentStep - 1) / 2) * 100;

    return (
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  const renderStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Información Personal";
      case 2:
        return "Información de Contacto";
      case 3:
        return "Contraseña y Términos";
      default:
        return "Crear Cuenta";
    }
  };

  const renderStep1 = () => (
    <>
      <div className="form-group">
        <label htmlFor="firstName">Nombre</label>
        <div className="input-container">
          <span className="icon user-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Juan"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Apellido</label>
        <div className="input-container">
          <span className="icon user-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Pérez"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Correo electrónico</label>
        <div className="input-container">
          <span className="icon email-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </span>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="username">Nombre de usuario</label>
        <div className="input-container">
          <span className="icon user-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="juanperez"
            required
          />
        </div>
      </div>

      <div className="form-buttons">
        <button
          type="button"
          className="next-button"
          onClick={handleNextClick}
        >
          Siguiente
        </button>
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="form-group">
        <label htmlFor="phone">Teléfono</label>
        <div className="input-container">
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+502123456789"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="dateOfBirth">Fecha de nacimiento</label>
        <div className="input-container">
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="gender">Género</label>
        <div className="input-container">
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="country">País</label>
        <div className="input-container">
          <input
            id="country"
            name="country"
            type="text"
            value={formData.country}
            onChange={handleChange}
            placeholder="País"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="postalCode">Código Postal</label>
        <div className="input-container">
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Código Postal"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="userType">Tipo de Usuario</label>
        <div className="input-container">
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona tu perfil</option>
            <option value="freelancer">Freelancer</option>
            <option value="project_manager">Project Manager</option>
          </select>
        </div>
      </div>

      <div className="form-buttons">
        <button
          type="button"
          className="back-button"
          onClick={prevStep}
        >
          Atrás
        </button>
        <button
          type="button"
          className="next-button"
          onClick={handleNextClick}
        >
          Siguiente
        </button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <div className="input-container">
          <span className="icon password-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirmar contraseña</label>
        <div className="input-container">
          <span className="icon password-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        {passwordError && <div className="error-message">{passwordError}</div>}
      </div>

      <div className="terms-agreement">
        <input
          id="agreeTerms"
          name="agreeTerms"
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={handleChange}
          required
        />
        <label htmlFor="agreeTerms">
          Acepto los <a href="#" className="terms-link" onClick={openTermsModal}>Términos y Condiciones</a> y la <a href="#" className="terms-link" onClick={openPrivacyModal}>Política de Privacidad</a>
        </label>
      </div>

      <div className="form-buttons">
        <button
          type="button"
          className="back-button"
          onClick={prevStep}
        >
          Atrás
        </button>
        <button
          type="submit"
          className={`register-button ${isSubmitting ? 'submitting' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </div>
    </>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Crear Cuenta</h1>
          <p>{renderStepTitle()}</p>
          {renderProgressBar()}
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {renderCurrentStep()}
        </form>

        {registrationSuccess && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>{registrationMessage}</p>
            <p className="redirect-message">Serás redirigido al login en unos segundos...</p>
          </div>
        )}

        <div className="login-link">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button type="button" className="link-button" onClick={handleLoginClick}>
              Iniciar sesión
            </button>
          </p>
        </div>

        <div className="separator">
          <span>O regístrate con</span>
        </div>

        <div className="social-login">
          <button type="button" className="social-button google-button">
            <svg className="social-icon" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Google
          </button>
          <button type="button" className="social-button github-button">
            <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </button>
          <button type="button" className="social-button microsoft-button">
            <svg className="social-icon" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#00a4ef" d="M1 13h10v10H1z" />
              <path fill="#7fba00" d="M13 1h10v10H13z" />
              <path fill="#ffb900" d="M13 13h10v10H13z" />
            </svg>
            Microsoft
          </button>
        </div>
      </div>

      {/* Modal de Términos y Condiciones */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={closeTermsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Términos y Condiciones</h2>
              <button className="modal-close" onClick={closeTermsModal}>×</button>
            </div>
            <div className="modal-body">
              <h3>1. Aceptación de los Términos</h3>
              <p>Al registrarte y utilizar nuestros servicios, aceptas estar sujeto a estos términos y condiciones.</p>

              <h3>2. Uso del Servicio</h3>
              <p>Te comprometes a usar nuestro servicio de manera responsable y conforme a la ley.</p>

              <h3>3. Cuenta de Usuario</h3>
              <p>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</p>

              <h3>4. Contenido</h3>
              <p>El contenido que publiques debe ser apropiado y no infringir derechos de terceros.</p>

              <h3>5. Limitación de Responsabilidad</h3>
              <p>No nos hacemos responsables por daños indirectos o consecuenciales.</p>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={closeTermsModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Política de Privacidad */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={closePrivacyModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Política de Privacidad</h2>
              <button className="modal-close" onClick={closePrivacyModal}>×</button>
            </div>
            <div className="modal-body">
              <h3>1. Recopilación de Información</h3>
              <p>Recopilamos información que nos proporcionas directamente al registrarte.</p>

              <h3>2. Uso de la Información</h3>
              <p>Utilizamos tu información para proporcionar y mejorar nuestros servicios.</p>

              <h3>3. Compartir Información</h3>
              <p>No compartimos tu información personal con terceros sin tu consentimiento.</p>

              <h3>4. Seguridad</h3>
              <p>Implementamos medidas de seguridad para proteger tu información.</p>

              <h3>5. Cookies</h3>
              <p>Utilizamos cookies para mejorar tu experiencia de usuario.</p>

              <h3>6. Contacto</h3>
              <p>Para preguntas sobre esta política, contáctanos en privacy@ejemplo.com</p>
            </div>
            <div className="modal-footer">
              <button className="modal-button" onClick={closePrivacyModal}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;