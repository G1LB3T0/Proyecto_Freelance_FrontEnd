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