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