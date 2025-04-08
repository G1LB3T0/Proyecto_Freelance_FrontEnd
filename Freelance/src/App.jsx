import { useState } from 'react';
import './App.css';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Inicio de sesión con: ${email}`);
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Bienvenido de nuevo</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-container">
              <i className="icon fa-solid fa-envelope"></i>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Contraseña</label>
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            <div className="input-container">
              <i className="icon fa-solid fa-lock"></i>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="remember-me">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
            />
            <label htmlFor="remember-me">Recordarme</label>
          </div>

          <button
            type="submit"
            className={`login-button ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="register-link">
          <p>
            ¿No tienes cuenta?{' '}
            <a href="#">Regístrate ahora</a>
          </p>
        </div>

        <div className="separator">
          <span>O continúa con</span>
        </div>

        <div className="social-login">
          <button className="social-button">
            <i className="fa-brands fa-google"></i> Google
          </button>
          <button className="social-button">
            <i className="fa-brands fa-facebook-f"></i> Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
