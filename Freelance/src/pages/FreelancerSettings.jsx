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