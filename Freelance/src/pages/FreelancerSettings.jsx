import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout.jsx';
import '../styles/Settings.css';

const FreelancerSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Estados específicos para freelancers
  const [profileData, setProfileData] = useState({
    name: 'Ana García',
    email: 'ana.garcia@email.com',
    phone: '+502 9876-5432',
    bio: 'Diseñadora UX/UI y desarrolladora frontend con 5 años de experiencia',
    location: 'Ciudad de Guatemala, Guatemala',
    website: 'www.anagarcia.dev',
    linkedin: 'linkedin.com/in/anagarcia',
    github: 'github.com/anagarcia',
    portfolio: 'behance.net/anagarcia',
    skills: 'React, JavaScript, Figma, Adobe Creative Suite',
    hourlyRate: '25',
    availability: 'full-time',
    experience: '5+',
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
    projectInvitations: true,
    messageNotifications: true,
    paymentNotifications: true,
    projectDeadlines: true,
    clientFeedback: true,
    marketingEmails: false,
    weeklyDigest: true,
    soundEnabled: true,
    desktopNotifications: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showHourlyRate: true,
    indexProfile: true,
    dataCollection: true,
    twoFactorAuth: false,
    showAvailability: true
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

  const [freelancerSettings, setFreelancerSettings] = useState({
    autoAcceptProjects: false,
    showPortfolio: true,
    acceptTestProjects: true,
    minimumProjectValue: '100',
    preferredProjectTypes: ['web-development', 'ui-design'],
    workingHours: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '10:00', end: '14:00', enabled: false },
      sunday: { start: '10:00', end: '14:00', enabled: false }
    }
  });

  // Tabs específicos para freelancers
  const tabs = [
    { id: 'profile', label: 'Perfil Freelancer', icon: 'ri-user-3-line' },
    { id: 'freelancer', label: 'Configuración Freelancer', icon: 'ri-briefcase-line' },
    { id: 'notifications', label: 'Notificaciones', icon: 'ri-notification-3-line' },
    { id: 'privacy', label: 'Privacidad', icon: 'ri-shield-keyhole-line' },
    { id: 'appearance', label: 'Apariencia', icon: 'ri-palette-line' },
    { id: 'language', label: 'Idioma', icon: 'ri-earth-line' },
    { id: 'billing', label: 'Facturación', icon: 'ri-bank-card-line' }
  ];

  // Función para guardar cambios (reutilizada)
  const handleSave = async (section) => {
    setSaveStatus('saving');
    // Simular llamada API
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  // Función para subir avatar (reutilizada)
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

  // Función para cambiar contraseña (reutilizada)
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

  // Componente de switch personalizado (reutilizado)
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
    <Layout currentPage="FreelancerSettings" searchPlaceholder="Buscar en configuración...">
      <div className="settings-page">
        {/* Estado de guardado */}
        {saveStatus && (
          <div className={`save-status ${saveStatus}`}>
            <span className="save-icon">
              {saveStatus === 'saved' ? (
                <i className="ri-check-line" aria-hidden="true"></i>
              ) : (
                <i className="ri-time-line" aria-hidden="true"></i>
              )}
            </span>
            {saveStatus === 'saved' ? 'Guardado' : 'Guardando...'}
          </div>
        )}

        {/* Header */}
        <div className="settings-header">
          <h1>Configuración Freelancer</h1>
          <p>Personaliza tu perfil y configuración como freelancer</p>
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
                  <span className="nav-icon"><i className={tab.icon} aria-hidden="true"></i></span>
                  <span className="nav-label">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido principal */}
          <div className="settings-content">
            {/* Contenido de Perfil Freelancer */}
            {activeTab === 'profile' && (
              <div className="tab-content">
                <h2>Perfil de Freelancer</h2>
                
                {/* Avatar */}
                <div className="form-section">
                  <label className="section-label">Foto de Perfil</label>
                  <div className="avatar-upload">
                    <div className="avatar-preview">
                      {profileData.avatar ? (
                        <img src={profileData.avatar} alt="Avatar" />
                      ) : (
                        <span className="avatar-placeholder"><i className="ri-user-3-line" aria-hidden="true"></i></span>
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
                        <i className="ri-camera-line" aria-hidden="true"></i> Cambiar foto
                      </label>
                      <p className="help-text">JPG, PNG o GIF. Máximo 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* Formulario de perfil freelancer */}
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
                      <span className="input-icon"><i className="ri-mail-line" aria-hidden="true"></i></span>
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
                      <span className="input-icon"><i className="ri-smartphone-line" aria-hidden="true"></i></span>
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

                  <div className="form-group">
                    <label>Tarifa por hora (USD)</label>
                    <div className="input-with-icon">
                      <span className="input-icon">$</span>
                      <input
                        type="number"
                        value={profileData.hourlyRate}
                        onChange={(e) => setProfileData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                        className="form-input with-icon"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Disponibilidad</label>
                    <select
                      value={profileData.availability}
                      onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
                      className="form-input"
                    >
                      <option value="full-time">Tiempo completo</option>
                      <option value="part-time">Medio tiempo</option>
                      <option value="project-based">Por proyecto</option>
                      <option value="unavailable">No disponible</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Años de experiencia</label>
                    <select
                      value={profileData.experience}
                      onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                      className="form-input"
                    >
                      <option value="0-1">0-1 años</option>
                      <option value="2-3">2-3 años</option>
                      <option value="4-5">4-5 años</option>
                      <option value="5+">5+ años</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Portafolio</label>
                    <div className="input-with-icon">
                      <span className="input-icon"><i className="ri-briefcase-line" aria-hidden="true"></i></span>
                      <input
                        type="url"
                        value={profileData.portfolio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, portfolio: e.target.value }))}
                        className="form-input with-icon"
                        placeholder="https://tu-portafolio.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Biografía profesional</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="form-textarea"
                    rows="4"
                    placeholder="Describe tu experiencia, especialidades y lo que te hace único como freelancer..."
                  />
                </div>

                <div className="form-group full-width">
                  <label>Habilidades principales</label>
                  <textarea
                    value={profileData.skills}
                    onChange={(e) => setProfileData(prev => ({ ...prev, skills: e.target.value }))}
                    className="form-textarea"
                    rows="3"
                    placeholder="Lista tus habilidades separadas por comas (ej: React, JavaScript, Figma, etc.)"
                  />
                </div>

                <div className="form-actions">
                  <button onClick={() => handleSave('profile')} className="btn btn-primary">
                    Guardar cambios
                  </button>
                </div>
              </div>
            )}

            {/* Configuración específica de Freelancer */}
            {activeTab === 'freelancer' && (
              <div className="tab-content">
                <h2>Configuración de Trabajo</h2>
                
                <div className="form-section">
                  <h3>Preferencias de Proyectos</h3>
                  <div className="toggle-list">
                    <ToggleSwitch
                      checked={freelancerSettings.autoAcceptProjects}
                      onChange={(value) => setFreelancerSettings(prev => ({ ...prev, autoAcceptProjects: value }))}
                      label="Aceptar proyectos automáticamente (proyectos que coincidan con tu perfil)"
                    />
                    <ToggleSwitch
                      checked={freelancerSettings.showPortfolio}
                      onChange={(value) => setFreelancerSettings(prev => ({ ...prev, showPortfolio: value }))}
                      label="Mostrar portafolio en el perfil público"
                    />
                    <ToggleSwitch
                      checked={freelancerSettings.acceptTestProjects}
                      onChange={(value) => setFreelancerSettings(prev => ({ ...prev, acceptTestProjects: value }))}
                      label="Aceptar proyectos de prueba"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Configuración Financiera</h3>
                  <div className="form-group">
                    <label>Valor mínimo de proyecto (USD)</label>
                    <div className="input-with-icon">
                      <span className="input-icon">$</span>
                      <input
                        type="number"
                        value={freelancerSettings.minimumProjectValue}
                        onChange={(e) => setFreelancerSettings(prev => ({ ...prev, minimumProjectValue: e.target.value }))}
                        className="form-input with-icon"
                        min="1"
                      />
                    </div>
                    <p className="help-text">Solo recibirás invitaciones de proyectos que superen este valor</p>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Horario de Trabajo</h3>
                  <div className="working-hours">
                    {Object.entries(freelancerSettings.workingHours).map(([day, hours]) => (
                      <div key={day} className="day-schedule">
                        <div className="day-header">
                          <ToggleSwitch
                            checked={hours.enabled}
                            onChange={(value) => setFreelancerSettings(prev => ({
                              ...prev,
                              workingHours: {
                                ...prev.workingHours,
                                [day]: { ...hours, enabled: value }
                              }
                            }))}
                            label={day.charAt(0).toUpperCase() + day.slice(1)}
                          />
                        </div>
                        {hours.enabled && (
                          <div className="time-inputs">
                            <input
                              type="time"
                              value={hours.start}
                              onChange={(e) => setFreelancerSettings(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day]: { ...hours, start: e.target.value }
                                }
                              }))}
                              className="time-input"
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={hours.end}
                              onChange={(e) => setFreelancerSettings(prev => ({
                                ...prev,
                                workingHours: {
                                  ...prev.workingHours,
                                  [day]: { ...hours, end: e.target.value }
                                }
                              }))}
                              className="time-input"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={() => handleSave('freelancer')} className="btn btn-primary">
                    Guardar configuración
                  </button>
                </div>
              </div>
            )}

            {/* Notificaciones específicas para freelancers */}
            {activeTab === 'notifications' && (
              <div className="tab-content">
                <h2>Notificaciones</h2>
                
                <div className="form-section">
                  <h3>Notificaciones de Proyectos</h3>
                  <div className="toggle-list">
                    <ToggleSwitch
                      checked={notificationSettings.projectInvitations}
                      onChange={(value) => setNotificationSettings(prev => ({ ...prev, projectInvitations: value }))}
                      label="Invitaciones a proyectos"
                    />
                    <ToggleSwitch
                      checked={notificationSettings.projectDeadlines}
                      onChange={(value) => setNotificationSettings(prev => ({ ...prev, projectDeadlines: value }))}
                      label="Recordatorios de fechas límite"
                    />
                    <ToggleSwitch
                      checked={notificationSettings.clientFeedback}
                      onChange={(value) => setNotificationSettings(prev => ({ ...prev, clientFeedback: value }))}
                      label="Comentarios de clientes"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Notificaciones Financieras</h3>
                  <div className="toggle-list">
                    <ToggleSwitch
                      checked={notificationSettings.paymentNotifications}
                      onChange={(value) => setNotificationSettings(prev => ({ ...prev, paymentNotifications: value }))}
                      label="Notificaciones de pagos"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Comunicación</h3>
                  <div className="toggle-list">
                    <ToggleSwitch
                      checked={notificationSettings.messageNotifications}
                      onChange={(value) => setNotificationSettings(prev => ({ ...prev, messageNotifications: value }))}
                      label="Mensajes de clientes"
                    />
                    <ToggleSwitch
                      checked={notificationSettings.emailNotifications}
                      onChange={(value) => setNotificationSettings(prev => ({ ...prev, emailNotifications: value }))}
                      label="Notificaciones por email"
                    />
                    <ToggleSwitch
                      checked={notificationSettings.pushNotifications}
                      onChange={(value) => setNotificationSettings(prev => ({ ...prev, pushNotifications: value }))}
                      label="Notificaciones push"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={() => handleSave('notifications')} className="btn btn-primary">
                    Guardar notificaciones
                  </button>
                </div>
              </div>
            )}

            {/* Privacidad específica para freelancers */}
            {activeTab === 'privacy' && (
              <div className="tab-content">
                <h2>Privacidad y Seguridad</h2>
                
                <div className="form-section">
                  <h3>Visibilidad del Perfil</h3>
                  <div className="form-group">
                    <label>Visibilidad del perfil</label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                      className="form-input"
                    >
                      <option value="public">Público - Visible para todos</option>
                      <option value="clients">Solo clientes - Visible para clientes registrados</option>
                      <option value="private">Privado - Solo por invitación</option>
                    </select>
                  </div>
                  
                  <div className="toggle-list">
                    <ToggleSwitch
                      checked={privacySettings.showEmail}
                      onChange={(value) => setPrivacySettings(prev => ({ ...prev, showEmail: value }))}
                      label="Mostrar email en el perfil público"
                    />
                    <ToggleSwitch
                      checked={privacySettings.showPhone}
                      onChange={(value) => setPrivacySettings(prev => ({ ...prev, showPhone: value }))}
                      label="Mostrar teléfono en el perfil público"
                    />
                    <ToggleSwitch
                      checked={privacySettings.showHourlyRate}
                      onChange={(value) => setPrivacySettings(prev => ({ ...prev, showHourlyRate: value }))}
                      label="Mostrar tarifa por hora"
                    />
                    <ToggleSwitch
                      checked={privacySettings.showAvailability}
                      onChange={(value) => setPrivacySettings(prev => ({ ...prev, showAvailability: value }))}
                      label="Mostrar disponibilidad actual"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Seguridad</h3>
                  <div className="toggle-list">
                    <ToggleSwitch
                      checked={privacySettings.twoFactorAuth}
                      onChange={(value) => setPrivacySettings(prev => ({ ...prev, twoFactorAuth: value }))}
                      label="Autenticación de dos factores"
                    />
                    <ToggleSwitch
                      checked={privacySettings.indexProfile}
                      onChange={(value) => setPrivacySettings(prev => ({ ...prev, indexProfile: value }))}
                      label="Permitir indexación en buscadores"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={() => handleSave('privacy')} className="btn btn-primary">
                    Guardar configuración
                  </button>
                </div>
              </div>
            )}

            {/* Las demás secciones (appearance, language, billing) pueden reutilizar la misma lógica del Settings original */}
            {activeTab === 'appearance' && (
              <div className="tab-content">
                <h2>Apariencia</h2>
                <div className="form-section">
                  <h3>Tema</h3>
                  <div className="theme-options">
                    <div className="theme-grid">
                      {['light', 'dark', 'auto'].map((theme) => (
                        <div
                          key={theme}
                          className={`theme-option ${themeSettings.theme === theme ? 'active' : ''}`}
                          onClick={() => setThemeSettings(prev => ({ ...prev, theme }))}
                        >
                          <div className={`theme-preview theme-${theme}`}>
                            <div className="preview-header"></div>
                            <div className="preview-content">
                              <div className="preview-sidebar"></div>
                              <div className="preview-main"></div>
                            </div>
                          </div>
                          <span className="theme-name">
                            {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Automático'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button onClick={() => handleSave('appearance')} className="btn btn-primary">
                    Guardar apariencia
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FreelancerSettings;