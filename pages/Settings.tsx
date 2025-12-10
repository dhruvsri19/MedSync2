import React, { useState } from 'react';
import { User, Mail, Calendar, Phone, Shield, Bell, Smartphone, Watch, Activity, ChevronRight, X, Lock, Eye } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  
  // Settings State
  const [notifications, setNotifications] = useState(true);
  const [integrations, setIntegrations] = useState({
    appleHealth: true,
    googleFit: false,
    oura: false
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const toggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your profile, devices, and preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary-400" />
            Profile Information
          </h2>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium"
          >
            Edit Profile
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Full Name</label>
                <p className="text-white font-medium mt-1 text-lg">{profile.name}</p>
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Email Address</label>
                <p className="text-white font-medium mt-1 text-lg">{profile.email}</p>
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Age</label>
                <p className="text-white font-medium mt-1 text-lg">{profile.age}</p>
              </div>
              <div>
                <label className="text-xs uppercase text-slate-500 font-semibold tracking-wider">Gender</label>
                <p className="text-white font-medium mt-1 text-lg">{profile.gender}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Integrations */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Connected Apps & Devices
          </h2>
        </div>
        <div className="divide-y divide-slate-700">
          <div className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                 {/* Apple Logo Placeholder */}
                 <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.5 1.3 0 2.52.87 3.31.87.76 0 2.16-1.09 3.63-.92 1.27.14 2.27.52 3.12 1.78-2.68 1.6-2.23 6 1.83 7.88zM13 3.5c.68-1.72 2.49-2.5 3.52-2.5C16.88 2.65 15.17 4.67 13 3.5z"/></svg>
              </div>
              <div>
                <h3 className="font-medium text-white">Apple Health</h3>
                <p className="text-sm text-slate-400">Sync steps, heart rate, and sleep</p>
              </div>
            </div>
            <button 
              onClick={() => toggleIntegration('appleHealth')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                integrations.appleHealth 
                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {integrations.appleHealth ? 'Connected' : 'Connect'}
            </button>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                 {/* Google Fit Logo Placeholder */}
                 <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M3.6 5.6l8.5-3.5c1.1-.5 2.5-.5 3.6 0l2 .8-5.3 9.3c-1.3 2.2-4.1 3-6.4 1.7L3.6 11c-1.3-2.2-.5-5 1.7-6.3.3-.2.6-.3 1-.4l-2.7 1.3zm1.1 8.8l5.3 3.1 3.5 6.2c-2.2 1.3-5 1.5-6.3.7-2.2-1.3-3-4.1-1.7-6.3.2-.4.5-.7.8-1l-1.6-2.7z" fill="#EA4335"/><path d="M15.4 12.7l5-8.7c1.3 2.2.5 5-1.7 6.3l-2.7 1.6-1.6-2.7 1 .3.4-3.5 4.5 2.6c2.2 1.3 3 4.1 1.7 6.3-.4.7-.9 1.3-1.6 1.7l-5-2.9z" fill="#FBBC05"/><path d="M8.2 4.4l3.1 1.8 1.9-3.4C12.4 2.2 11.2 2 10.1 2.5l-2 3.5-.6 2 2.3-1.3-.8-1.4.8-1.4.4.5z" fill="#34A853"/><path d="M12.9 22c-.6 0-1.1-.1-1.7-.4l-2-3.5 2.3-1.3 1.8 3.1c1.1.6 2.5.6 3.6 0l-2.3-4 2.3-1.3 2.3 4c-.9 1.9-2.8 3.1-4.9 3.4-.5.1-1 .1-1.4 0z" fill="#4285F4"/></svg>
              </div>
              <div>
                <h3 className="font-medium text-white">Google Fit</h3>
                <p className="text-sm text-slate-400">Sync activity and workout data</p>
              </div>
            </div>
            <button 
              onClick={() => toggleIntegration('googleFit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                integrations.googleFit
                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {integrations.googleFit ? 'Connected' : 'Connect'}
            </button>
          </div>

          <div className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black font-bold">
                 O
              </div>
              <div>
                <h3 className="font-medium text-white">Oura Ring</h3>
                <p className="text-sm text-slate-400">Sync sleep and readiness scores</p>
              </div>
            </div>
            <button 
              onClick={() => toggleIntegration('oura')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                integrations.oura
                  ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {integrations.oura ? 'Connected' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-amber-400" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Push Notifications</span>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  notifications ? 'bg-primary-600' : 'bg-slate-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Email Alerts</span>
              <div className="w-12 h-6 bg-slate-600 rounded-full relative opacity-50 cursor-not-allowed">
                <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-purple-400" />
            Privacy & Security
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4" />
                Change Password
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4" />
                Privacy Policy
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                    <input 
                      type="number" 
                      required
                      value={formData.age}
                      onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                  <input 
                    type="tel" 
                    value={formData.phone || ''}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};