import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout.jsx';
import '../styles/Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Estados para diferentes secciones
  const [profileData, setProfileData] = useState({
    name: 'Miguel Sánchez',
    email: 'miguel.sanchez@email.com',
    phone: '+502 1234-5678',
    bio: 'Desarrollador Full Stack especializado en React y Node.js',
    location: 'Guatemala City, Guatemala',
    website: 'www.miguelsanchez.dev',
    linkedin: 'linkedin.com/in/miguelsanchez',
    github: 'github.com/miguelsanchez',
    avatar: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    messageNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    soundEnabled: true,
    desktopNotifications: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    indexProfile: true,
    dataCollection: true,
    twoFactorAuth: false
  });

  const [themeSettings, setThemeSettings] = useState({
    theme: 'light',
    accentColor: '#3b82f6',
    fontSize: 'medium',
    compactMode: false
  });

  const [languageSettings, setLanguageSettings] = useState({
    language: 'es',
    timezone: 'America/Guatemala',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    { id: 'privacy', label: 'Privacidad', icon: '🛡️' },
    { id: 'appearance', label: 'Apariencia', icon: '🎨' },
    { id: 'language', label: 'Idioma', icon: '🌍' },
    { id: 'billing', label: 'Facturación', icon: '💳' },
    { id: 'data', label: 'Datos', icon: '📥' }
  ];

  // Función para guardar cambios
  const handleSave = async (section) => {
    setSaveStatus('saving');
    // Simular llamada API
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  // Función para subir avatar
  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para cambiar contraseña
  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    handleSave('password');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Componente de switch personalizado
  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="toggle-container">
      <span className="toggle-label">{label}</span>
      <div 
        className={`toggle-switch ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <div className="toggle-slider"></div>
      </div>
    </div>
  );

  return (
    <Layout currentPage="Settings" searchPlaceholder="Buscar en configuración...">
      <div className="settings-page">
        {/* Estado de guardado */}
        {saveStatus && (
          <div className={`save-status ${saveStatus}`}>
            <span className="save-icon">
              {saveStatus === 'saved' ? '✅' : '⏳'}
            </span>
            {saveStatus === 'saved' ? 'Guardado' : 'Guardando...'}
          </div>
        )}

        {/* Header */}
        <div className="settings-header">
          <h1>Configuración</h1>
          <p>Personaliza tu experiencia en la plataforma</p>
        </div>

        <div className="settings-layout">
          {/* Sidebar de navegación */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <span className="nav-label">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido principal */}
          <div className="settings-content">
            {/* Contenido de Perfil */}
            {activeTab === 'profile' && (
              <div className="tab-content">
                <h2>Información del Perfil</h2>
                
                {/* Avatar */}
                <div className="form-section">
                  <label className="section-label">Foto de Perfil</label>
                  <div className="avatar-upload">
                    <div className="avatar-preview">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="Avatar" />
                      ) : (
                        <span className="avatar-placeholder">👤</span>
                      )}
                    </div>
                    <div className="avatar-actions">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="file-input"
                      />
                      <label htmlFor="avatar-upload" className="btn btn-primary">
                        📸 Cambiar foto
                      </label>
                      <p className="help-text">JPG, PNG o GIF. Máximo 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* Formulario de perfil */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-with-icon">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="form-input with-icon"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <div className="input-with-icon">
                      <span className="input-icon">📱</span>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="form-input with-icon"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ubicación</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Biografía</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="form-textarea"
                  />
                  <p className="help-text">Cuéntanos un poco sobre ti y tu trabajo</p>
                </div>

                {/* Enlaces sociales */}
                <div className="form-section">
                  <h3>Enlaces Sociales</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Sitio web</label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="www.tusitio.com"
                        className="form-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>LinkedIn</label>
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="linkedin.com/in/tuusuario"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Cambio de contraseña */}
                <div className="form-section password-section">
                  <h3>Cambiar Contraseña</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Contraseña actual</label>
                      <div className="password-input">
                        <span className="input-icon">🔒</span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="form-input with-icon"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Nueva contraseña</label>
                      <div className="password-input">
                        <span className="input-icon">🔒</span>
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="form-input with-icon"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="password-toggle"
                        >
                          {showNewPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="form-input"
                      style={{ maxWidth: '300px' }}
                    />
                  </div>

                  <button onClick={handlePasswordChange} className="btn btn-danger">
                    Actualizar contraseña
                  </button>
                </div>

                <button onClick={() => handleSave('profile')} className="btn btn-primary save-btn">
                  💾 Guardar cambios
                </button>
              </div>
            )}

            {/* Contenido de Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="tab-content">
                <h2>Preferencias de Notificaciones</h2>
                <p className="tab-description">Controla cómo y cuándo recibes notificaciones</p>

                <div className="settings-sections">
                  <div className="settings-group">
                    <h3>Notificaciones por Email</h3>
                    <div className="toggles-list">
                      <ToggleSwitch
                        checked={notificationSettings.emailNotifications}
                        onChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                        label="Recibir notificaciones por email"
                      />
                      <ToggleSwitch
                        checked={notificationSettings.projectUpdates}
                        onChange={(checked) => setNotificationSettings(prev => ({ ...prev, projectUpdates: checked }))}
                        label="Actualizaciones de proyectos"
                      />
                      <ToggleSwitch
                        checked={notificationSettings.messageNotifications}
                        onChange={(checked) => setNotificationSettings(prev => ({ ...prev, messageNotifications: checked }))}
                        label="Nuevos mensajes"
                      />
                      <ToggleSwitch
                        checked={notificationSettings.weeklyDigest}
                        onChange={(checked) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: checked }))}
                        label="Resumen semanal"
                      />
                      <ToggleSwitch
                        checked={notificationSettings.marketingEmails}
                        onChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                        label="Emails promocionales"
                      />
                    </div>
                  </div>

                  <div className="settings-group">
                    <h3>Notificaciones Push</h3>
                    <div className="toggles-list">
                      <ToggleSwitch
                        checked={notificationSettings.pushNotifications}
                        onChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                        label="Notificaciones push en el navegador"
                      />
                      <ToggleSwitch
                        checked={notificationSettings.desktopNotifications}
                        onChange={(checked) => setNotificationSettings(prev => ({ ...prev, desktopNotifications: checked }))}
                        label="Notificaciones de escritorio"
                      />
                      <ToggleSwitch
                        checked={notificationSettings.soundEnabled}
                        onChange={(checked) => setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }))}
                        label="Sonidos de notificación"
                      />
                    </div>
                  </div>
                </div>

                <button onClick={() => handleSave('notifications')} className="btn btn-primary save-btn">
                  💾 Guardar preferencias
                </button>
              </div>
            )}

            {/* Contenido de Privacidad */}
            {activeTab === 'privacy' && (
              <div className="tab-content">
                <h2>Configuración de Privacidad</h2>
                <p className="tab-description">Controla quién puede ver tu información y cómo se usa</p>

                <div className="settings-sections">
                  <div className="form-group">
                    <label>Visibilidad del perfil</label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                      className="form-select"
                    >
                      <option value="public">Público - Visible para todos</option>
                      <option value="members">Solo miembros registrados</option>
                      <option value="private">Privado - Solo conexiones</option>
                    </select>
                  </div>

                  <div className="settings-group">
                    <h3>Información visible</h3>
                    <div className="toggles-list">
                      <ToggleSwitch
                        checked={privacySettings.showEmail}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, showEmail: checked }))}
                        label="Mostrar email en el perfil"
                      />
                      <ToggleSwitch
                        checked={privacySettings.showPhone}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, showPhone: checked }))}
                        label="Mostrar teléfono en el perfil"
                      />
                      <ToggleSwitch
                        checked={privacySettings.indexProfile}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, indexProfile: checked }))}
                        label="Permitir indexación en buscadores"
                      />
                    </div>
                  </div>

                  <div className="settings-group">
                    <h3>Seguridad</h3>
                    <div className="toggles-list">
                      <ToggleSwitch
                        checked={privacySettings.twoFactorAuth}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                        label="Autenticación de dos factores"
                      />
                      <ToggleSwitch
                        checked={privacySettings.dataCollection}
                        onChange={(checked) => setPrivacySettings(prev => ({ ...prev, dataCollection: checked }))}
                        label="Permitir recolección de datos para mejoras"
                      />
                    </div>
                  </div>
                </div>

                <button onClick={() => handleSave('privacy')} className="btn btn-primary save-btn">
                  💾 Guardar configuración
                </button>
              </div>
            )}

            {/* Contenido de Apariencia */}
            {activeTab === 'appearance' && (
              <div className="tab-content">
                <h2>Personalizar Apariencia</h2>
                <p className="tab-description">Ajusta el tema y la presentación visual de la plataforma</p>

                <div className="settings-sections">
                  <div className="settings-group">
                    <label className="section-label">Tema</label>
                    <div className="theme-options">
                      {['light', 'dark', 'auto'].map(theme => (
                        <div
                          key={theme}
                          onClick={() => setThemeSettings(prev => ({ ...prev, theme }))}
                          className={`theme-option ${themeSettings.theme === theme ? 'active' : ''}`}
                        >
                          <div className={`theme-preview ${theme}`}></div>
                          <span className="theme-label">
                            {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Auto'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="settings-group">
                    <label className="section-label">Color de acento</label>
                    <div className="color-options">
                      {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(color => (
                        <div
                          key={color}
                          onClick={() => setThemeSettings(prev => ({ ...prev, accentColor: color }))}
                          className={`color-option ${themeSettings.accentColor === color ? 'active' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="settings-group">
                    <label className="section-label">Tamaño de fuente</label>
                    <div className="font-size-options">
                      {[
                        { value: 'small', label: 'Pequeña' },
                        { value: 'medium', label: 'Mediana' },
                        { value: 'large', label: 'Grande' }
                      ].map(size => (
                        <button
                          key={size.value}
                          onClick={() => setThemeSettings(prev => ({ ...prev, fontSize: size.value }))}
                          className={`font-option ${themeSettings.fontSize === size.value ? 'active' : ''} ${size.value}`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="settings-group">
                    <ToggleSwitch
                      checked={themeSettings.compactMode}
                      onChange={(checked) => setThemeSettings(prev => ({ ...prev, compactMode: checked }))}
                      label="Modo compacto (más información en menos espacio)"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSave('appearance')}
                  className="btn btn-primary save-btn"
                  style={{ backgroundColor: themeSettings.accentColor }}
                >
                  💾 Aplicar cambios
                </button>
              </div>
            )}

            {/* Contenido de Idioma */}
            {activeTab === 'language' && (
              <div className="tab-content">
                <h2>Configuración Regional</h2>
                <p className="tab-description">Personaliza el idioma, zona horaria y formatos de fecha</p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Idioma</label>
                    <select
                      value={languageSettings.language}
                      onChange={(e) => setLanguageSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="form-select"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Zona horaria</label>
                    <select
                      value={languageSettings.timezone}
                      onChange={(e) => setLanguageSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="form-select"
                    >
                      <option value="America/Guatemala">Guatemala (GMT-6)</option>
                      <option value="America/Mexico_City">México (GMT-6)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Formato de fecha</label>
                    <select
                      value={languageSettings.dateFormat}
                      onChange={(e) => setLanguageSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                      className="form-select"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (23/08/2025)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (08/23/2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2025-08-23)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Formato de hora</label>
                    <select
                      value={languageSettings.timeFormat}
                      onChange={(e) => setLanguageSettings(prev => ({ ...prev, timeFormat: e.target.value }))}
                      className="form-select"
                    >
                      <option value="24h">24 horas (14:30)</option>
                      <option value="12h">12 horas (2:30 PM)</option>
                    </select>
                  </div>
                </div>

                <button onClick={() => handleSave('language')} className="btn btn-primary save-btn">
                  💾 Guardar configuración
                </button>
              </div>
            )}

            {/* Contenido de Facturación */}
            {activeTab === 'billing' && (
              <div className="tab-content">
                <h2>Facturación y Suscripción</h2>
                <p className="tab-description">Gestiona tu plan y métodos de pago</p>

                {/* Plan actual */}
                <div className="billing-card current-plan">
                  <div className="plan-header">
                    <div className="plan-info">
                      <h3>Plan Gratuito</h3>
                      <p>Acceso básico a la plataforma</p>
                    </div>
                    <span className="plan-status active">Activo</span>
                  </div>
                  
                  <div className="plan-features">
                    <p><strong>Tu plan incluye:</strong></p>
                    <ul className="features-list">
                      <li className="included">✅ Hasta 5 proyectos</li>
                      <li className="included">✅ 50 conexiones</li>
                      <li className="included">✅ Soporte básico</li>
                      <li className="not-included">❌ Análisis avanzados</li>
                    </ul>
                  </div>

                  <button className="btn btn-upgrade">
                    ⭐ Actualizar a Premium
                  </button>
                </div>

                {/* Historial de facturación */}
                <div className="settings-group">
                  <h3>Historial de Facturación</h3>
                  <div className="billing-history">
                    <div className="history-header">
                      <span>Fecha</span>
                      <span>Descripción</span>
                      <span>Estado</span>
                      <span>Monto</span>
                    </div>
                    <div className="history-empty">
                      No tienes historial de facturación aún
                    </div>
                  </div>
                </div>

                {/* Métodos de pago */}
                <div className="settings-group">
                  <h3>Métodos de Pago</h3>
                  <div className="payment-methods">
                    <div className="empty-state">
                      <span className="empty-icon">💳</span>
                      <p>No tienes métodos de pago configurados</p>
                      <button className="btn btn-primary">
                        Agregar método de pago
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contenido de Datos */}
            {activeTab === 'data' && (
              <div className="tab-content">
                <h2>Gestión de Datos</h2>
                <p className="tab-description">Exporta, importa o elimina tus datos de la plataforma</p>

                <div className="settings-sections">
                  {/* Exportar datos */}
                  <div className="data-card export-data">
                    <h3>📥 Exportar Datos</h3>
                    <p>Descarga una copia de todos tus datos en formato JSON</p>
                    <div className="export-actions">
                      <button className="btn btn-primary">
                        📄 Exportar perfil
                      </button>
                      <button className="btn btn-success">
                        📝 Exportar publicaciones
                      </button>
                    </div>
                  </div>

                  {/* Zona peligrosa */}
                  <div className="data-card danger-zone">
                    <h3>⚠️ Zona de Peligro</h3>
                    <p>Estas acciones son irreversibles. Procede con precaución.</p>
                    
                    <div className="danger-actions">
                      <div className="danger-item">
                        <div className="danger-info">
                          <h4>Eliminar todas las publicaciones</h4>
                          <p>Elimina permanentemente todas tus publicaciones</p>
                        </div>
                        <button className="btn btn-danger">
                          🗑️ Eliminar
                        </button>
                      </div>

                      <div className="danger-item">
                        <div className="danger-info">
                          <h4>Eliminar cuenta</h4>
                          <p>Elimina permanentemente tu cuenta y todos los datos asociados</p>
                        </div>
                        <button className="btn btn-danger-dark">
                          🗑️ Eliminar cuenta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;