

import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Calendar, Phone, Shield, Bell, Camera, Activity, ChevronRight, X, Lock, Eye, Trash2, CheckCircle, AlertCircle, EyeOff, Globe, Heart, Circle, Siren, MapPin, Loader2, Moon, Sun, RefreshCw, Clock } from 'lucide-react';
import { UserProfile, AppRoute } from '../types';
import { getRecommendedEmergencyNumber, EMERGENCY_NUMBERS } from '../services/emergencyService';
import { 
  requestHealthKitAuthorization, 
  revokeHealthKitAccess, 
  checkHealthKitStatus, 
  HEALTH_PERMISSIONS,
  requestGoogleFitAuthorization,
  revokeGoogleFitAccess,
  checkGoogleFitStatus,
  GOOGLE_FIT_PERMISSIONS,
  requestOuraAuthorization,
  revokeOuraAccess,
  checkOuraStatus,
  OURA_PERMISSIONS,
  requestNHSAuthorization,
  revokeNHSAccess,
  checkNHSStatus,
  NHS_PERMISSIONS,
  requestABHAAuthorization,
  revokeABHAAccess,
  checkABHAStatus,
  ABHA_PERMISSIONS,
  requestMyHealthRecordAuthorization,
  revokeMyHealthRecordAccess,
  checkMyHealthRecordStatus,
  MY_HEALTH_RECORD_PERMISSIONS,
  syncHealthData,
  getLastSyncTime,
  getSyncFrequency,
  setSyncFrequency,
  SyncFrequency
} from '../services/healthKitService';

interface SettingsProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigate?: (route: AppRoute) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile, onNavigate, isDarkMode, toggleDarkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings State
  const [notifications, setNotifications] = useState(true);
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    'Apple Health': checkHealthKitStatus(),
    'Google Fit': checkGoogleFitStatus(),
    'Oura Ring': checkOuraStatus(),
    'NHS App': checkNHSStatus(),
    'ABHA (Health ID)': checkABHAStatus(),
    'My Health Record': checkMyHealthRecordStatus()
  });

  // Health Data Sync State
  const [lastSynced, setLastSynced] = useState<string | null>(getLastSyncTime());
  const [syncFreq, setSyncFreq] = useState<SyncFrequency>(getSyncFrequency());
  const [isSyncing, setIsSyncing] = useState(false);

  // Authorization Modal States
  const [isHealthKitModalOpen, setIsHealthKitModalOpen] = useState(false);
  const [isAuthorizingHK, setIsAuthorizingHK] = useState(false);
  
  const [isGoogleFitModalOpen, setIsGoogleFitModalOpen] = useState(false);
  const [isAuthorizingGF, setIsAuthorizingGF] = useState(false);

  // Regional/Other App Modal State
  const [selectedRegionalApp, setSelectedRegionalApp] = useState<string | null>(null);
  const [isAuthorizingRegional, setIsAuthorizingRegional] = useState(false);

  // Password Change State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswordToast, setShowPasswordToast] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Mock stored password for validation
  const MOCK_CURRENT_PASSWORD = 'password';

  // Derived Validation States
  const isCurrentPasswordCorrect = passwordForm.current === MOCK_CURRENT_PASSWORD;
  const isCurrentPasswordEmpty = passwordForm.current.length === 0;
  const isNewPasswordWeak = passwordForm.new.length > 0 && passwordForm.new.length < 8;
  const isNewPasswordValid = passwordForm.new.length >= 8;
  const doPasswordsMatch = passwordForm.new === passwordForm.confirm;
  const isConfirmNotEmpty = passwordForm.confirm.length > 0;

  const canSubmitPassword = isCurrentPasswordCorrect && isNewPasswordValid && doPasswordsMatch && isConfirmNotEmpty;

  // Region-based Services Logic
  const getServicesForCountry = (country: string = 'United States') => {
    const baseServices = ['Apple Health', 'Google Fit'];
    switch (country) {
      case 'United Kingdom':
        return [...baseServices, 'NHS App'];
      case 'India':
        return [...baseServices, 'ABHA (Health ID)'];
      case 'Australia':
        return [...baseServices, 'My Health Record'];
      case 'United States':
      case 'Canada':
      default:
        return [...baseServices, 'Oura Ring'];
    }
  };

  const currentServices = getServicesForCountry(profile.country);

  // Auto-update emergency number when country changes in form
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    const recommendedNumber = getRecommendedEmergencyNumber(newCountry);
    setFormData(prev => ({
      ...prev,
      country: newCountry,
      emergencyNumber: recommendedNumber
    }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmitPassword) {
      setIsPasswordModalOpen(false);
      setShowPasswordToast(true);
      // Reset form
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setShowPasswordToast(false), 3000);
    }
  };

  const toggleIntegration = async (serviceName: string) => {
    // Intercept Apple Health
    if (serviceName === 'Apple Health') {
      if (integrations['Apple Health']) {
        await revokeHealthKitAccess();
        setIntegrations(prev => ({ ...prev, [serviceName]: false }));
      } else {
        setIsHealthKitModalOpen(true);
      }
      return;
    }

    // Intercept Google Fit
    if (serviceName === 'Google Fit') {
      if (integrations['Google Fit']) {
        await revokeGoogleFitAccess();
        setIntegrations(prev => ({ ...prev, [serviceName]: false }));
      } else {
        setIsGoogleFitModalOpen(true);
      }
      return;
    }

    // Intercept Regional Apps
    if (integrations[serviceName]) {
       // Disconnect Logic
       if (serviceName === 'Oura Ring') await revokeOuraAccess();
       if (serviceName === 'NHS App') await revokeNHSAccess();
       if (serviceName === 'ABHA (Health ID)') await revokeABHAAccess();
       if (serviceName === 'My Health Record') await revokeMyHealthRecordAccess();
       
       setIntegrations(prev => ({ ...prev, [serviceName]: false }));
    } else {
       // Open Modal Logic
       setSelectedRegionalApp(serviceName);
    }
  };

  const confirmHealthKitAuthorization = async () => {
    setIsAuthorizingHK(true);
    try {
      const result = await requestHealthKitAuthorization();
      if (result.success) {
        setIntegrations(prev => ({ ...prev, 'Apple Health': true }));
        setIsHealthKitModalOpen(false);
        setSyncFreq(getSyncFrequency());
        handleManualSync();
      } else {
        alert('Permission denied.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthorizingHK(false);
    }
  };

  const confirmGoogleFitAuthorization = async () => {
    setIsAuthorizingGF(true);
    try {
      const result = await requestGoogleFitAuthorization();
      if (result.success) {
        setIntegrations(prev => ({ ...prev, 'Google Fit': true }));
        setIsGoogleFitModalOpen(false);
        setSyncFreq(getSyncFrequency());
        handleManualSync();
      } else {
        alert('Permission denied.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthorizingGF(false);
    }
  };

  const confirmRegionalAuthorization = async () => {
    if (!selectedRegionalApp) return;
    setIsAuthorizingRegional(true);
    try {
       let result = { success: false };
       if (selectedRegionalApp === 'Oura Ring') result = await requestOuraAuthorization();
       if (selectedRegionalApp === 'NHS App') result = await requestNHSAuthorization();
       if (selectedRegionalApp === 'ABHA (Health ID)') result = await requestABHAAuthorization();
       if (selectedRegionalApp === 'My Health Record') result = await requestMyHealthRecordAuthorization();

       if (result.success) {
          setIntegrations(prev => ({ ...prev, [selectedRegionalApp]: true }));
          setSelectedRegionalApp(null);
          setSyncFreq(getSyncFrequency());
          handleManualSync();
       }
    } catch (e) {
       console.error(e);
    } finally {
       setIsAuthorizingRegional(false);
    }
  };

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncHealthData();
      setLastSynced(getLastSyncTime());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFreqChange = (newFreq: SyncFrequency) => {
    setSyncFrequency(newFreq);
    setSyncFreq(newFreq);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const updatedProfile = { ...profile, photoUrl: result };
        onUpdateProfile(updatedProfile);
        setFormData(prev => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    const updatedProfile = { ...profile, photoUrl: undefined };
    onUpdateProfile(updatedProfile);
    setFormData(prev => ({ ...prev, photoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Icon Helper for Integrations
  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Apple Health':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-rose-500 text-white shadow-sm border border-rose-600/10">
            <Heart className="w-6 h-6 fill-current" />
          </div>
        );
      case 'Google Fit':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 dark:border-transparent dark:bg-slate-700 shadow-sm">
             <Activity className="w-6 h-6 text-blue-500" />
          </div>
        );
      case 'Oura Ring':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-900 text-white border border-slate-700 shadow-sm">
             <Circle className="w-6 h-6" />
          </div>
        );
      case 'NHS App':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-600 text-white font-bold text-xs shadow-sm">
             NHS
          </div>
        );
      case 'ABHA (Health ID)':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-500 text-white font-bold text-xs shadow-sm">
             ABHA
          </div>
        );
      case 'My Health Record':
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-600 text-white font-bold text-xs shadow-sm">
             MyHR
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-500">
             <Activity className="w-6 h-6" />
          </div>
        );
    }
  };

  // Regional Modal Configuration Helper
  const getRegionalModalConfig = () => {
     if (!selectedRegionalApp) return null;
     
     switch (selectedRegionalApp) {
        case 'Oura Ring':
           return {
              color: 'bg-slate-900',
              textColor: 'text-white',
              icon: <Circle className="w-12 h-12 mx-auto mb-2" />,
              description: 'MedSync needs access to your Oura daily readiness and sleep scores.',
              permissions: OURA_PERMISSIONS
           };
        case 'NHS App':
           return {
              color: 'bg-blue-600',
              textColor: 'text-white',
              icon: <span className="text-3xl font-bold block mb-2">NHS</span>,
              description: 'Connect to your NHS GP record for medications and history.',
              permissions: NHS_PERMISSIONS
           };
        case 'ABHA (Health ID)':
           return {
              color: 'bg-orange-500',
              textColor: 'text-white',
              icon: <span className="text-3xl font-bold block mb-2">ABHA</span>,
              description: 'Link your Ayushman Bharat Health Account for seamless records.',
              permissions: ABHA_PERMISSIONS
           };
        case 'My Health Record':
           return {
              color: 'bg-emerald-600',
              textColor: 'text-white',
              icon: <Activity className="w-12 h-12 mx-auto mb-2" />,
              description: 'Access your Australian digital health record summary securely.',
              permissions: MY_HEALTH_RECORD_PERMISSIONS
           };
        default:
           return null;
     }
  };

  const regionalConfig = getRegionalModalConfig();

  // Reusable Sync Controls Component
  const SyncControls = () => (
    <div className="flex flex-wrap items-center gap-3 mr-2 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500">Last Synced</span>
          <span className="text-xs text-slate-700 dark:text-slate-300">
            {lastSynced ? new Date(lastSynced).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
          </span>
      </div>
      
      <div className="relative group">
          <div className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 px-2 py-1.5 rounded-lg cursor-pointer">
            <Clock className="w-3 h-3 text-slate-500" />
            <select 
                value={syncFreq}
                onChange={(e) => handleFreqChange(e.target.value as SyncFrequency)}
                className="bg-transparent text-slate-700 dark:text-slate-300 outline-none appearance-none pr-4 cursor-pointer"
            >
                <option value="manual">Manual</option>
                <option value="15min">Every 15m</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
            </select>
            <ChevronRight className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none rotate-90" />
          </div>
      </div>

      <button 
        onClick={handleManualSync}
        disabled={isSyncing}
        className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 p-2 rounded-lg transition-colors disabled:opacity-50"
        title="Sync Now"
      >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500 relative">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your profile, devices, and preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500 dark:text-primary-400" />
            Profile Information
          </h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium transition-colors"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="relative group">
              {profile.photoUrl ? (
                <img 
                  src={profile.photoUrl} 
                  alt={profile.name} 
                  className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg flex-shrink-0 border-4 border-white dark:border-slate-700">
                  {profile.name.charAt(0)}
                </div>
              )}
              
              <button 
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 shadow-md text-slate-500 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all z-10"
                title="Update photo"
              >
                <Camera className="w-4 h-4" />
              </button>

              {profile.photoUrl && (
                <button 
                  onClick={handleRemovePhoto}
                  className="absolute top-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 shadow-md text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all z-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 duration-200"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase text-slate-500 font-bold">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase text-slate-500 font-bold">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase text-slate-500 font-bold">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase text-slate-500 font-bold">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase text-slate-500 font-bold">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase text-slate-500 font-bold">Country</label>
                  <select
                    value={formData.country}
                    onChange={handleCountryChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  >
                    {Object.keys(EMERGENCY_NUMBERS).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs uppercase text-slate-500 font-bold flex items-center gap-1">
                     Emergency # <span className="font-normal normal-case text-xs text-slate-400">(Editable)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyNumber}
                    onChange={(e) => setFormData({...formData, emergencyNumber: e.target.value})}
                    className="w-full bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2 text-rose-700 dark:text-rose-400 font-semibold"
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-2 rounded-lg transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">Full Name</label>
                  <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.name}</p>
                </div>
                <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">Email Address</label>
                  <p className="text-slate-900 dark:text-white font-medium text-lg truncate">{profile.email}</p>
                </div>
                <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">Age</label>
                  <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.age} years old</p>
                </div>
                <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">Gender</label>
                  <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.gender || 'Not specified'}</p>
                </div>
                <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">Country / Region</label>
                  <div className="flex items-center gap-2">
                     <Globe className="w-4 h-4 text-slate-400" />
                     <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.country || 'Not Set'}</p>
                  </div>
                </div>
                <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">Local Emergency</label>
                  <div className="flex items-center gap-2">
                     <Siren className="w-4 h-4 text-rose-500" />
                     <p className="text-rose-600 dark:text-rose-400 font-bold text-lg">
                       {profile.emergencyNumber || getRecommendedEmergencyNumber(profile.country || 'United States')}
                     </p>
                  </div>
                </div>
                {profile.phone && (
                  <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50">
                    <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">Phone</label>
                    <p className="text-slate-900 dark:text-white font-medium text-lg">{profile.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Integrations (Dynamic based on Country) */}
      <div className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            Connected Apps & Devices
            <span className="text-xs font-normal text-slate-500 ml-auto bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
               Region: {profile.country || 'Global'}
            </span>
          </h2>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {currentServices.map((app) => {
             const isConnected = integrations[app];
             return (
              <div key={app} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-4">
                  {getServiceIcon(app)}
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">{app}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sync data seamlessly</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Apple Health Specific Controls */}
                  {app === 'Apple Health' && isConnected && <SyncControls />}
                  
                  {/* Google Fit Specific Controls */}
                  {app === 'Google Fit' && isConnected && <SyncControls />}

                  {/* Regional/Other Apps Specific Controls */}
                  {['Oura Ring', 'NHS App', 'ABHA (Health ID)', 'My Health Record'].includes(app) && isConnected && <SyncControls />}

                  <button 
                    onClick={() => toggleIntegration(app)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isConnected
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
             );
          })}
        </div>
      </div>
      
      {/* Preferences & Security Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Push Notifications</span>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifications ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
            {toggleDarkMode && (
               <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-600 dark:text-slate-300">Dark Mode</span>
                  <button 
                    onClick={toggleDarkMode}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isDarkMode ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isDarkMode ? 'left-7' : 'left-1'
                    }`} />
                    {isDarkMode ? <Moon className="w-3 h-3 text-slate-500 absolute left-1 top-1.5 opacity-50" /> : <Sun className="w-3 h-3 text-yellow-500 absolute right-1 top-1.5 opacity-50" />}
                  </button>
               </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            Security
          </h2>
          <div className="space-y-3">
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <span className="text-slate-600 dark:text-slate-300">Change Password</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onNavigate && onNavigate(AppRoute.PRIVACY_POLICY)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <span className="text-slate-600 dark:text-slate-300">Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* HealthKit Permission Modal */}
      {isHealthKitModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
              <div className="bg-rose-500 p-6 text-white text-center">
                 <Heart className="w-12 h-12 mx-auto mb-2 fill-current" />
                 <h2 className="text-xl font-bold">Connect Apple Health</h2>
                 <p className="text-rose-100 text-sm mt-1">MedSync needs your permission to read health data.</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium">
                   We would like to access the following data to provide personalized insights:
                </p>
                <div className="space-y-3 mb-6">
                   {HEALTH_PERMISSIONS.map((perm) => (
                      <div key={perm.id} className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                           {perm.id === 'heart_rate' && <Activity className="w-4 h-4 text-rose-500" />}
                           {perm.id === 'steps' && <Activity className="w-4 h-4 text-emerald-500" />}
                           {perm.id === 'sleep_analysis' && <Moon className="w-4 h-4 text-indigo-500" />}
                           {perm.id === 'active_energy' && <Activity className="w-4 h-4 text-orange-500" />}
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{perm.name}</p>
                            <p className="text-xs text-slate-500">Read Access</p>
                         </div>
                         <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                      </div>
                   ))}
                </div>
                <div className="flex gap-3">
                   <button 
                      onClick={() => setIsHealthKitModalOpen(false)}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                   >
                      Don't Allow
                   </button>
                   <button 
                      onClick={confirmHealthKitAuthorization}
                      disabled={isAuthorizingHK}
                      className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-colors font-medium shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                   >
                      {isAuthorizingHK ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Allow'}
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Google Fit Permission Modal */}
      {isGoogleFitModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
              <div className="bg-blue-500 p-6 text-white text-center">
                 <Activity className="w-12 h-12 mx-auto mb-2" />
                 <h2 className="text-xl font-bold">Connect Google Fit</h2>
                 <p className="text-blue-100 text-sm mt-1">MedSync needs your permission to read health data.</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium">
                   We would like to access the following data to provide personalized insights:
                </p>
                <div className="space-y-3 mb-6">
                   {GOOGLE_FIT_PERMISSIONS.map((perm) => (
                      <div key={perm.id} className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                           {perm.id === 'heart_rate' && <Heart className="w-4 h-4 text-rose-500" />}
                           {perm.id === 'steps' && <Activity className="w-4 h-4 text-emerald-500" />}
                           {perm.id === 'sleep' && <Moon className="w-4 h-4 text-indigo-500" />}
                           {(perm.id === 'calories' || perm.id === 'distance') && <Activity className="w-4 h-4 text-orange-500" />}
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{perm.name}</p>
                            <p className="text-xs text-slate-500">Read Access</p>
                         </div>
                         <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                      </div>
                   ))}
                </div>
                <div className="flex gap-3">
                   <button 
                      onClick={() => setIsGoogleFitModalOpen(false)}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={confirmGoogleFitAuthorization}
                      disabled={isAuthorizingGF}
                      className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors font-medium shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                   >
                      {isAuthorizingGF ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authorize'}
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Regional App & Oura Ring Modal (Dynamic) */}
      {selectedRegionalApp && regionalConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden">
              <div className={`${regionalConfig.color} p-6 ${regionalConfig.textColor} text-center`}>
                 {regionalConfig.icon}
                 <h2 className="text-xl font-bold">Connect {selectedRegionalApp}</h2>
                 <p className="text-white/80 text-sm mt-1">{regionalConfig.description}</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium">
                   We would like to access the following data:
                </p>
                <div className="space-y-3 mb-6">
                   {regionalConfig.permissions.map((perm: any) => (
                      <div key={perm.id} className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                           <Activity className={`w-4 h-4 ${regionalConfig.color.replace('bg-', 'text-')}`} />
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{perm.name}</p>
                            <p className="text-xs text-slate-500">{perm.write ? 'Read & Write' : 'Read Access'}</p>
                         </div>
                         <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                      </div>
                   ))}
                </div>
                <div className="flex gap-3">
                   <button 
                      onClick={() => setSelectedRegionalApp(null)}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={confirmRegionalAuthorization}
                      disabled={isAuthorizingRegional}
                      className={`flex-1 px-4 py-2 rounded-xl text-white hover:opacity-90 transition-opacity font-medium shadow-lg flex items-center justify-center gap-2 ${regionalConfig.color}`}
                   >
                      {isAuthorizingRegional ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl relative">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
                 <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                        className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-lg pl-10 pr-10 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 ${
                           !isCurrentPasswordEmpty && !isCurrentPasswordCorrect 
                           ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' 
                           : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'
                        }`}
                        placeholder="Enter current password"
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                         {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {!isCurrentPasswordEmpty && !isCurrentPasswordCorrect && (
                       <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" /> Incorrect password
                       </p>
                    )}
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                    <input 
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                      placeholder="Min 8 characters"
                    />
                    {isNewPasswordWeak && (
                       <p className="text-xs text-amber-500 mt-1">Password is too short (min 8 chars)</p>
                    )}
                 </div>

                 <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                    <input 
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 ${
                         isConfirmNotEmpty && !doPasswordsMatch
                         ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                         : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'
                      }`}
                      placeholder="Re-enter new password"
                    />
                    {isConfirmNotEmpty && !doPasswordsMatch && (
                       <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" /> Passwords do not match
                       </p>
                    )}
                 </div>

                 <button 
                    type="submit" 
                    disabled={!canSubmitPassword}
                    className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors mt-2"
                 >
                    Update Password
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Success Toast */}
      {showPasswordToast && (
         <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-[60]">
            <CheckCircle className="w-6 h-6" />
            <div>
               <h4 className="font-bold text-sm">Success</h4>
               <p className="text-xs text-emerald-100">Password updated successfully</p>
            </div>
         </div>
      )}
    </div>
  );
};
