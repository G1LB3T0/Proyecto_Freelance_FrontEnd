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