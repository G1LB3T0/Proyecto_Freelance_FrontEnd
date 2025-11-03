import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../Components/Layout.jsx';
import '../styles/Settings.css';
import settingsService from '../services/serviceSettings.js';
import authService from '../services/authService.js';

const FreelancerSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados específicos para freelancers
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    portfolio: '',
    skills: '',
    hourlyRate: '',
    availability: 'full-time',
    experience: '0-1',
    avatar: null,
    first_name: '',
    last_name: ''
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

  // Cargar datos del usuario al inicializar
  useEffect(() => {
    loadUserData();
  }, []);

  const { t, i18n } = useTranslation();

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Debug para FreelancerSettings
      console.log("=== DEBUG FREELANCER SETTINGS ===");
      
      // Intentar múltiples fuentes de datos
      let settings = {};
      let user = {};

      try {
        // Obtener configuración del usuario
        const settingsResponse = await settingsService.getUserSettings();
        
        // Obtener información del perfil del usuario
        const profileResponse = await settingsService.getUserProfile();

        console.log("Freelancer Settings Response:", settingsResponse);
        console.log("Freelancer Profile Response:", profileResponse);

        // Fuente 1: API responses
        if (settingsResponse?.success) {
          settings = settingsResponse.data || {};
        }
        
        if (profileResponse?.success) {
          user = profileResponse.data?.user || profileResponse.data || {};
        }
      } catch (apiError) {
        console.log("API calls failed:", apiError);
      }

      // Fuente 2: Fallback a authService si API falla o no hay datos
      if (!user || (!user.email && !user.name && !user.username)) {
        const localUser = authService.getUser();
        console.log("Freelancer fallback to local user:", localUser);
        user = localUser || {};
      }
      
      // Fuente 3: Si aún no hay datos, usar datos por defecto para freelancer
      if (!user || Object.keys(user).length === 0) {
        console.log("Using default freelancer data");
        user = {
          name: "Freelancer",
          email: "",
          username: "",
          first_name: "",
          last_name: ""
        };
      }

      console.log("Final freelancer user data:", user);
      console.log("Final freelancer settings data:", settings);
      console.log("==================================");

      // Mapear los datos del backend al estado local (específico para freelancers) con validaciones ultra-robustas
      const safeUser = user || {};
      const safeSettings = settings || {};
      const socialLinks = safeSettings.social_links || {};
      
      setProfileData({
        name: safeUser.full_name || safeUser.name || safeUser.username || 
              `${safeUser.first_name || ''} ${safeUser.last_name || ''}`.trim() || 
              "Freelancer",
        email: safeUser.email || '',
        username: safeUser.username || '',
        phone: safeUser.phone || safeSettings.phone_e164 || '',
        bio: safeSettings.bio || '',
        location: safeSettings.location || '',
        website: safeSettings.website_url || '',
        linkedin: socialLinks.linkedin || '',
        github: socialLinks.github || '',
        portfolio: safeSettings.portfolio_url || '',
        skills: safeSettings.skills || '',
        hourlyRate: safeSettings.hourly_rate || '',
        availability: safeSettings.availability || 'full-time',
        experience: safeSettings.experience || '0-1',
        avatar: safeSettings.profile_picture || null,
        first_name: safeUser.first_name || safeSettings.first_name || '',
        last_name: safeUser.last_name || safeSettings.last_name || ''
      });      // Mapear configuraciones específicas del freelancer si existen
      if (safeSettings.freelancer_settings) {
        setFreelancerSettings(prev => ({
          ...prev,
          ...safeSettings.freelancer_settings
        }));
      }

      // Mapear configuraciones de notificaciones
      if (safeSettings.notification_settings) {
        setNotificationSettings(prev => ({
          ...prev,
          ...safeSettings.notification_settings
        }));
      }

      // Mapear configuraciones de privacidad
      if (safeSettings.privacy_settings) {
        setPrivacySettings(prev => ({
          ...prev,
          ...safeSettings.privacy_settings
        }));
      }
      // Mapear configuraciones de idioma
      setLanguageSettings({
        language: safeSettings.language || safeSettings.locale || localStorage.getItem('appLanguage') || 'es',
        timezone: safeSettings.timezone || languageSettings.timezone,
        dateFormat: safeSettings.date_format || languageSettings.dateFormat,
        timeFormat: safeSettings.time_format || languageSettings.timeFormat,
      });

    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      setError('Error al cargar la configuración. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  // Función para validar datos
  const validateProfileData = () => {
    const errors = [];
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profileData.email && !emailRegex.test(profileData.email)) {
      errors.push('El email no tiene un formato válido');
    }
    
    // Validar username
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (profileData.username && !usernameRegex.test(profileData.username)) {
      errors.push('El usuario solo puede contener letras, números y guiones bajos');
    }
    
    if (profileData.username && profileData.username.length < 3) {
      errors.push('El usuario debe tener al menos 3 caracteres');
    }
    
    return errors;
  };

  // Función para guardar perfil freelancer
  const handleSaveProfile = async () => {
    try {
      setSaveStatus('saving');
      setError('');

      // Validar datos antes de enviar
      const validationErrors = validateProfileData();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '));
        setSaveStatus('');
        return;
      }

      const updateData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        username: profileData.username,
        phone_e164: profileData.phone,
        bio: profileData.bio,
        location: profileData.location,
        website_url: profileData.website,
        portfolio_url: profileData.portfolio,
        skills: profileData.skills,
        hourly_rate: profileData.hourlyRate,
        availability: profileData.availability,
        experience: profileData.experience,
        social_links: {
          linkedin: profileData.linkedin,
          github: profileData.github,
        },
      };

      const response = await settingsService.updateUserSettings(updateData);

      if (response.success) {
        // Actualizar usuario local (localStorage) para reflejar cambios en la UI global
        try {
          const local = authService.getUser() || {};
          const updatedLocal = {
            ...local,
            email: profileData.email || local.email,
            username: profileData.username || local.username,
            first_name: profileData.first_name || local.first_name,
            last_name: profileData.last_name || local.last_name,
            name: profileData.name || `${profileData.first_name || local.first_name || ''} ${profileData.last_name || local.last_name || ''}`.trim() || local.name
          };
          authService.setUser(updatedLocal);
          window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedLocal }));
        } catch (err) {
          console.warn('No se pudo actualizar local user tras guardar perfil freelancer:', err);
        }

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        throw new Error(response.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando perfil freelancer:', error);
      setError('Error al guardar los cambios. Inténtalo de nuevo.');
      setSaveStatus('');
    }
  };

  // Función para guardar configuración de freelancer
  const handleSaveFreelancer = async () => {
    try {
      setSaveStatus('saving');
      setError('');

      const updateData = {
        freelancer_settings: freelancerSettings
      };

      const response = await settingsService.updateUserSettings(updateData);

      if (response.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        throw new Error(response.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando configuración freelancer:', error);
      setError('Error al guardar la configuración. Inténtalo de nuevo.');
      setSaveStatus('');
    }
  };

  // Función genérica para otras secciones
  const handleSave = async (section) => {
    if (section === 'profile') {
      return handleSaveProfile();
    } else if (section === 'freelancer') {
      return handleSaveFreelancer();
    }
    
    // Para otras secciones, mantener funcionalidad local por ahora
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  // Función para subir avatar
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        
        try {
          setSaveStatus('saving');
          setError('');
          
          // Actualizar estado local inmediatamente
          setProfileData(prev => ({ ...prev, avatar: base64 }));
          
          // Subir al servidor
          const response = await settingsService.uploadAvatar(base64);
          
          if (response.success) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 2000);
          } else {
            throw new Error(response.error || 'Error al subir imagen');
          }
        } catch (error) {
          console.error('Error subiendo avatar:', error);
          setError('Error al subir la imagen. Inténtalo de nuevo.');
          setSaveStatus('');
          // Revertir cambio local si falló
          setProfileData(prev => ({ ...prev, avatar: null }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para cambiar contraseña
  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (passwordData.newPassword.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      setSaveStatus('saving');
      setError('');

      const response = await settingsService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      if (response.success) {
        setSaveStatus('saved');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        throw new Error(response.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setError(error.message || 'Error al cambiar la contraseña');
      setSaveStatus('');
    }
  };

  // Función para guardar configuración de idioma (freelancer)
  const handleSaveLanguage = async () => {
    try {
      setSaveStatus('saving');
      setError('');

      const payload = {
        language: languageSettings.language,
        timezone: languageSettings.timezone,
        date_format: languageSettings.dateFormat,
        time_format: languageSettings.timeFormat,
      };

      const response = await settingsService.updateUserSettings(payload);

      if (response.success) {
        localStorage.setItem('appLanguage', languageSettings.language);
        window.dispatchEvent(new CustomEvent('language-changed', { detail: languageSettings.language }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        throw new Error(response.error || 'Error al guardar idioma');
      }
    } catch (err) {
      console.error('Error guardando idioma (freelancer):', err);
      setError('No fue posible guardar la configuración de idioma. Intenta de nuevo.');
      setSaveStatus('');
    }
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

  // Mostrar loading mientras cargan los datos
  if (loading) {
    return (
      <Layout currentPage="FreelancerSettings">
        <div className="settings-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando configuración...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentPage="FreelancerSettings" searchPlaceholder={t('top.searchPlaceholder')}>
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

        {/* Mostrar errores */}
        {error && (
          <div className="error-message">
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            {error}
            <button onClick={() => setError('')} className="error-close">
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="settings-header">
          <h1>{t('settings.title') + ' Freelancer'}</h1>
          <p>{t('settings.description')}</p>
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
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) =>
                        setProfileData(prev => ({
                          ...prev,
                          first_name: e.target.value,
                          name: `${e.target.value} ${prev.last_name}`.trim()
                        }))
                      }
                      className="form-input"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) =>
                        setProfileData(prev => ({
                          ...prev,
                          last_name: e.target.value,
                          name: `${prev.first_name} ${e.target.value}`.trim()
                        }))
                      }
                      className="form-input"
                      placeholder="Tu apellido"
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
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Usuario</label>
                    <div className="input-with-icon">
                      <span className="input-icon"><i className="ri-user-line" aria-hidden="true"></i></span>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        className="form-input with-icon"
                        placeholder="nombre_usuario"
                      />
                    </div>
                    <p className="help-text">Solo letras, números y guiones bajos</p>
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

            {/* Idioma */}
            {activeTab === 'language' && (
              <div className="tab-content">
                <h2>{t('settings.language.title')}</h2>

                <div className="form-group">
                  <label>{t('settings.language.interface')}</label>
                  <select
                    value={languageSettings.language}
                    onChange={(e) => setLanguageSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="form-input"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('settings.language.timezone')}</label>
                  <input
                    type="text"
                    value={languageSettings.timezone}
                    onChange={(e) => setLanguageSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="form-input"
                    placeholder="America/Guatemala"
                  />
                </div>

                <div className="form-actions">
                  <button onClick={async () => { await handleSaveLanguage(); try { i18n.changeLanguage(languageSettings.language); } catch (err) {} }} className="btn btn-primary" disabled={saveStatus === 'saving'}>
                    {saveStatus === 'saving' ? t('actions.saving') : t('actions.saveLanguage')}
                  </button>
                </div>
              </div>
            )}

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