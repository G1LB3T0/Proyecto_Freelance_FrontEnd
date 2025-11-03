import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Layout from "../Components/Layout.jsx";
import "../styles/Settings.css";
import settingsService from "../services/serviceSettings.js";
import authService from "../services/authService.js";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //BÚSQUEDA
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para diferentes secciones - Inicializados con valores del backend
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    avatar: null,
    first_name: "",
    last_name: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    projectUpdates: true,
    messageNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    soundEnabled: true,
    desktopNotifications: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    indexProfile: true,
    dataCollection: true,
    twoFactorAuth: false,
  });

  const [themeSettings, setThemeSettings] = useState({
    theme: "light",
    accentColor: "#3b82f6",
    fontSize: "medium",
    compactMode: false,
  });

  const [languageSettings, setLanguageSettings] = useState({
    language: "es",
    timezone: "America/Guatemala",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
  });

  const tabs = [
    { id: "profile", label: "Perfil", icon: "ri-user-3-line" },
    {
      id: "notifications",
      label: "Notificaciones",
      icon: "ri-notification-3-line",
    },
    { id: "privacy", label: "Privacidad", icon: "ri-shield-keyhole-line" },
    { id: "appearance", label: "Apariencia", icon: "ri-palette-line" },
    { id: "language", label: "Idioma", icon: "ri-earth-line" },
    { id: "billing", label: "Facturación", icon: "ri-bank-card-line" },
    { id: "data", label: "Datos", icon: "ri-download-2-line" },
  ];

  // Cargar datos del usuario al inicializar el componente
  useEffect(() => {
    loadUserData();
  }, []);

  const { t, i18n } = useTranslation();

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError("");

      // Debug: Log completo de las respuestas
      console.log("=== DEBUG SETTINGS ===");
      
      // Intentar múltiples fuentes de datos
      let settings = {};
      let user = {};

      try {
        // Obtener configuración del usuario
        const settingsResponse = await settingsService.getUserSettings();
        
        // Obtener información del perfil del usuario
        const profileResponse = await settingsService.getUserProfile();

        console.log("Settings Response:", settingsResponse);
        console.log("Profile Response:", profileResponse);

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
        console.log("Fallback to local user:", localUser);
        user = localUser || {};
      }
      
      // Fuente 3: Si aún no hay datos, usar datos por defecto
      if (!user || Object.keys(user).length === 0) {
        console.log("Using default user data");
        user = {
          name: "Usuario",
          email: "",
          username: "",
          first_name: "",
          last_name: ""
        };
      }

      console.log("Final user data:", user);
      console.log("Final settings data:", settings);
      console.log("======================");

      // Mapear los datos del backend al estado local con validaciones ultra-robustas
      const safeUser = user || {};
      const safeSettings = settings || {};
      const socialLinks = safeSettings.social_links || {};
      
      setProfileData({
        name: safeUser.full_name || safeUser.name || safeUser.username || 
              `${safeUser.first_name || ''} ${safeUser.last_name || ''}`.trim() || 
              "Usuario",
        email: safeUser.email || "",
        username: safeUser.username || "",
        phone: safeUser.phone || safeSettings.phone_e164 || "",
        bio: safeSettings.bio || "",
        location: safeSettings.location || "",
        website: safeSettings.website_url || "",
        linkedin: socialLinks.linkedin || "",
        github: socialLinks.github || "",
        avatar: safeSettings.profile_picture || null,
        first_name: safeUser.first_name || safeSettings.first_name || "",
        last_name: safeUser.last_name || safeSettings.last_name || "",
      });
      // Mapear configuraciones de idioma si existen
      setLanguageSettings({
        language:
          safeSettings.language || safeSettings.locale ||
          localStorage.getItem("appLanguage") || "es",
        timezone: safeSettings.timezone || languageSettings.timezone,
        dateFormat: safeSettings.date_format || languageSettings.dateFormat,
        timeFormat: safeSettings.time_format || languageSettings.timeFormat,
      });

    } catch (error) {
      console.error("Error cargando datos del usuario:", error);
      setError("Error cargando la configuración del usuario. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de pestañas por búsqueda
  const q = searchQuery.trim().toLowerCase();
  const filteredTabs = q
    ? tabs.filter((t) => (t.label || "").toLowerCase().includes(q))
    : tabs;

  // Si la pestaña activa ya no está en el filtro, cambiar a la primera coincidente
  useEffect(() => {
    if (!q) return;
    const stillVisible = filteredTabs.some((t) => t.id === activeTab);
    if (!stillVisible && filteredTabs.length > 0) {
      setActiveTab(filteredTabs[0].id);
    }
  }, [q, filteredTabs, activeTab]);

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

  // Función para guardar cambios del perfil
  const handleSaveProfile = async () => {
    try {
      setSaveStatus("saving");
      setError("");

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
          // Emitir evento para otras partes de la app (Layout) que escuchen cambios de usuario
          window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedLocal }));
        } catch (err) {
          console.warn('No se pudo actualizar local user tras guardar perfil:', err);
        }

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 2000);
      } else {
        throw new Error(response.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error guardando perfil:", error);
      setError("Error al guardar los cambios. Inténtalo de nuevo.");
      setSaveStatus("");
    }
  };

  // Función genérica para otras secciones (mantiene funcionalidad local)
  const handleSave = async (section) => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
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
          setSaveStatus("saving");
          setError("");
          
          // Actualizar estado local inmediatamente
          setProfileData((prev) => ({ ...prev, avatar: base64 }));
          
          // Subir al servidor
          const response = await settingsService.uploadAvatar(base64);
          
          if (response.success) {
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus(""), 2000);
          } else {
            throw new Error(response.error || "Error al subir imagen");
          }
        } catch (error) {
          console.error("Error subiendo avatar:", error);
          setError("Error al subir la imagen. Inténtalo de nuevo.");
          setSaveStatus("");
          // Revertir cambio local si falló
          setProfileData((prev) => ({ ...prev, avatar: null }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para cambiar contraseña conectada al backend
  const handlePasswordChange = async () => {
    try {
      if (passwordData.new_password !== passwordData.confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (passwordData.new_password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return;
      }

      setSaveStatus("saving");
      setError("");

      const response = await settingsService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      if (response.success) {
        setSaveStatus("saved");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirmPassword: "",
        });
        setTimeout(() => setSaveStatus(""), 2000);
      } else {
        throw new Error(response.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      setError(error.message || "Error al cambiar la contraseña");
      setSaveStatus("");
    }
  };

  // Función para guardar configuración de idioma
  const handleSaveLanguage = async () => {
    try {
      setSaveStatus("saving");
      setError("");

      const payload = {
        language: languageSettings.language,
        timezone: languageSettings.timezone,
        date_format: languageSettings.dateFormat,
        time_format: languageSettings.timeFormat,
      };

      const response = await settingsService.updateUserSettings(payload);

      if (response.success) {
        // Persistir preferencia localmente y notificar al resto de la app
        localStorage.setItem("appLanguage", languageSettings.language);
        window.dispatchEvent(new CustomEvent("language-changed", { detail: languageSettings.language }));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 2000);
      } else {
        throw new Error(response.error || "Error al guardar idioma");
      }
    } catch (err) {
      console.error("Error guardando idioma:", err);
      setError("No fue posible guardar la configuración de idioma. Intenta de nuevo.");
      setSaveStatus("");
    }
  };

  // Componente de switch personalizado
  const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="toggle-container">
      <span className="toggle-label">{label}</span>
      <div
        className={`toggle-switch ${checked ? "active" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <div className="toggle-slider"></div>
      </div>
    </div>
  );

  // Mostrar loading mientras cargan los datos
  if (loading) {
    return (
      <Layout currentPage="Settings">
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
    <Layout
      currentPage="Settings"
      searchPlaceholder="Buscar en configuración..."
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div className="settings-page">
        {/* Estado de guardado */}
        {saveStatus && (
          <div className={`save-status ${saveStatus}`}>
            <span className="save-icon">
              {saveStatus === "saved" ? (
                <i className="ri-check-line" aria-hidden="true"></i>
              ) : (
                <i className="ri-time-line" aria-hidden="true"></i>
              )}
            </span>
            {saveStatus === "saved" ? "Guardado" : "Guardando..."}
          </div>
        )}

        {/* Mostrar errores */}
        {error && (
          <div className="error-message">
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            {error}
            <button onClick={() => setError("")} className="error-close">
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          </div>
        )}

        {/* Header */}
      <div className="settings-header">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.description')}</p>
          {q && (
            <div className="filter-hint">
              Mostrando pestañas que coinciden con{" "}
              <strong>"{searchQuery}"</strong>
            </div>
          )}
        </div>



        <div className="settings-layout">
          {/* Sidebar de navegación */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {filteredTabs.length > 0 ? (
                filteredTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nav-button ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                  >
                    <span className="nav-icon">
                      <i className={tab.icon} aria-hidden="true"></i>
                    </span>
                    <span className="nav-label">{tab.label}</span>
                  </button>
                ))
              ) : (
                <div className="no-results">
                  <p>No se encontraron pestañas para "{searchQuery}".</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="btn btn-primary"
                    style={{ marginTop: 8 }}
                  >
                    Ver todas
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* Contenido principal */}
          <div className="settings-content">
            {/* Contenido de Perfil */}
            {activeTab === "profile" && (
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
                        <span className="avatar-placeholder">
                          <i className="ri-user-3-line" aria-hidden="true"></i>
                        </span>
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
                      <label
                        htmlFor="avatar-upload"
                        className="btn btn-primary"
                      >
                        <i className="ri-camera-line" aria-hidden="true"></i>{" "}
                        Cambiar foto
                      </label>
                      <p className="help-text">JPG, PNG o GIF. Máximo 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* Formulario de perfil */}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          first_name: e.target.value,
                          name: `${e.target.value} ${prev.last_name}`.trim()
                        }))
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          last_name: e.target.value,
                          name: `${prev.first_name} ${e.target.value}`.trim()
                        }))
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-with-icon">
                      <span className="input-icon">
                        <i className="ri-mail-line" aria-hidden="true"></i>
                      </span>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="form-input with-icon"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <p className="help-text">Asegúrate de usar un email válido</p>
                  </div>

                  <div className="form-group">
                    <label>Usuario</label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="form-input"
                      placeholder="nombre_usuario"
                    />
                    <p className="help-text">Solo letras, números y guiones bajos</p>
                  </div>

                  <div className="form-group">
                    <label>Teléfono</label>
                    <div className="input-with-icon">
                      <span className="input-icon">
                        <i
                          className="ri-smartphone-line"
                          aria-hidden="true"
                        ></i>
                      </span>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className="form-input with-icon"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ubicación</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Biografía</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    rows={4}
                    className="form-textarea"
                  />
                  <p className="help-text">
                    Cuéntanos un poco sobre ti y tu trabajo
                  </p>
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
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        placeholder="www.tusitio.com"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>LinkedIn</label>
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            linkedin: e.target.value,
                          }))
                        }
                        placeholder="linkedin.com/in/tuusuario"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>GitHub</label>
                      <input
                        type="url"
                        value={profileData.github}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            github: e.target.value,
                          }))
                        }
                        placeholder="github.com/tuusuario"
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
                        <span className="input-icon">
                          <i className="ri-lock-2-line" aria-hidden="true"></i>
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              current_password: e.target.value,
                            }))
                          }
                          className="form-input with-icon"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                        >
                          {showPassword ? (
                            <i className="ri-eye-line" aria-hidden="true"></i>
                          ) : (
                            <i
                              className="ri-eye-off-line"
                              aria-hidden="true"
                            ></i>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Nueva contraseña</label>
                      <div className="password-input">
                        <span className="input-icon">
                          <i className="ri-lock-2-line" aria-hidden="true"></i>
                        </span>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.new_password}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              new_password: e.target.value,
                            }))
                          }
                          className="form-input with-icon"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="password-toggle"
                        >
                          {showNewPassword ? (
                            <i className="ri-eye-line" aria-hidden="true"></i>
                          ) : (
                            <i
                              className="ri-eye-off-line"
                              aria-hidden="true"
                            ></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="form-input"
                      style={{ maxWidth: "300px" }}
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    className="btn btn-danger"
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? "Actualizando..." : "Actualizar contraseña"}
                  </button>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="btn btn-primary save-btn"
                  disabled={saveStatus === "saving"}
                >
                  <i className="ri-save-3-line" aria-hidden="true"></i> 
                  {saveStatus === "saving" ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            )}

            {/* Idioma */}
            {activeTab === "language" && (
              <div className="tab-content">
                <h2>{t('settings.language.title')}</h2>

                <div className="form-group">
                  <label>{t('settings.language.interface')}</label>
                  <select
                    value={languageSettings.language}
                    onChange={(e) =>
                      setLanguageSettings((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setLanguageSettings((prev) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                    }
                    className="form-input"
                    placeholder="America/Guatemala"
                  />
                </div>

                <div className="form-actions">
                  <button
                    onClick={async () => {
                      await handleSaveLanguage();
                      try { i18n.changeLanguage(languageSettings.language); } catch (err) {}
                    }}
                    className="btn btn-primary"
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? t('actions.saving') : t('actions.saveLanguage')}
                  </button>
                </div>
              </div>
            )}

            {/* Las demás pestañas mantienen funcionalidad local - puedes agregar el resto según necesites */}
            
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;