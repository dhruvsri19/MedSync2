
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Timeline } from './pages/Timeline';
import { Upload } from './pages/Upload';
import { Insights } from './pages/Insights';
import { Medications } from './pages/Medications';
import { FamilyHealth } from './pages/FamilyHealth';
import { Settings } from './pages/Settings';
import { AppRoute, HealthMetric, LabReport, Medication, FamilyMember, UserProfile } from './types';
import { MOCK_METRICS, MOCK_REPORTS, MOCK_MEDICATIONS, MOCK_FAMILY_MEMBERS, MOCK_FAMILY_REPORTS, MOCK_USER_PROFILE } from './services/mockData';
import { HeartPulse, User, Mail, Lock, Calendar, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [metrics] = useState<HealthMetric[]>(MOCK_METRICS);
  const [reports, setReports] = useState<LabReport[]>(MOCK_REPORTS);
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  
  // Family State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [familyReports, setFamilyReports] = useState<LabReport[]>(MOCK_FAMILY_REPORTS);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);

  // Signup State
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male'
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API
    setUserProfile({
      id: `u-${Date.now()}`,
      name: signupData.name,
      email: signupData.email,
      age: parseInt(signupData.age) || 0,
      gender: signupData.gender,
      phone: ''
    });
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const handleAddMedication = (med: Medication) => {
    setMedications([...medications, med]);
  };

  const handleUpdateMedication = (updatedMed: Medication) => {
    setMedications(medications.map(m => m.id === updatedMed.id ? updatedMed : m));
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const handleAddFamilyMember = (member: FamilyMember) => {
    setFamilyMembers([...familyMembers, member]);
  };

  const handleAddFamilyReport = (report: LabReport) => {
    setFamilyReports([report, ...familyReports]);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  // Render Auth Screens (Login or Signup)
  if (currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.SIGNUP) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
        
        <div className="bg-slate-800/50 border border-slate-700 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary-600 p-3 rounded-2xl mb-4 shadow-lg shadow-primary-900/50">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {currentRoute === AppRoute.LOGIN ? 'Welcome to MedSync' : 'Create Account'}
            </h1>
            <p className="text-slate-400 text-center">
              {currentRoute === AppRoute.LOGIN 
                ? 'Your unified health timeline powered by AI.' 
                : 'Start your journey to better health management.'}
            </p>
          </div>
          
          {currentRoute === AppRoute.LOGIN ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    defaultValue="alex@example.com"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input 
                    type="password" 
                    defaultValue="password"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-900/50 hover:shadow-primary-900/80 mt-2 flex items-center justify-center gap-2 group"
              >
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                </div>
              </div>

              <button 
                type="button"
                className="w-full bg-white text-slate-900 font-semibold py-3.5 rounded-xl transition-all hover:bg-slate-100 flex items-center justify-center gap-2"
                onClick={() => setCurrentRoute(AppRoute.DASHBOARD)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" 
                    required
                    value={signupData.name}
                    onChange={e => setSignupData({...signupData, name: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" 
                    required
                    value={signupData.email}
                    onChange={e => setSignupData({...signupData, email: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input 
                    type="password" 
                    required
                    value={signupData.password}
                    onChange={e => setSignupData({...signupData, password: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Create a password"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-slate-300 text-sm font-medium mb-2">Age</label>
                   <div className="relative">
                     <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                     <input 
                       type="number" 
                       required
                       value={signupData.age}
                       onChange={e => setSignupData({...signupData, age: e.target.value})}
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                       placeholder="Age"
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-slate-300 text-sm font-medium mb-2">Gender</label>
                   <select
                     value={signupData.gender}
                     onChange={e => setSignupData({...signupData, gender: e.target.value})}
                     className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 appearance-none"
                   >
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                     <option value="Other">Other</option>
                   </select>
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-900/50 hover:shadow-primary-900/80 mt-2 flex items-center justify-center gap-2 group"
              >
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-400">
              {currentRoute === AppRoute.LOGIN ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setCurrentRoute(currentRoute === AppRoute.LOGIN ? AppRoute.SIGNUP : AppRoute.LOGIN)}
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                {currentRoute === AppRoute.LOGIN ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Main Application
  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar 
        currentRoute={currentRoute} 
        onNavigate={setCurrentRoute} 
        onLogout={() => setCurrentRoute(AppRoute.LOGIN)}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {currentRoute === AppRoute.DASHBOARD && (
            <Dashboard metrics={metrics} onNavigate={setCurrentRoute} />
          )}
          {currentRoute === AppRoute.TIMELINE && (
            <Timeline metrics={metrics} />
          )}
          {currentRoute === AppRoute.UPLOAD && (
            <Upload 
              onAddReport={(report) => setReports([report, ...reports])} 
              reports={reports} 
            />
          )}
          {currentRoute === AppRoute.INSIGHTS && (
            <Insights metrics={metrics} reports={reports} />
          )}
          {currentRoute === AppRoute.MEDICATIONS && (
             <Medications 
               medications={medications}
               onAdd={handleAddMedication}
               onUpdate={handleUpdateMedication}
               onDelete={handleDeleteMedication}
             />
          )}
          {currentRoute === AppRoute.FAMILY && (
             <FamilyHealth 
               members={familyMembers}
               reports={familyReports}
               onAddMember={handleAddFamilyMember}
               onAddReport={handleAddFamilyReport}
             />
          )}
          {currentRoute === AppRoute.SETTINGS && (
             <Settings 
               profile={userProfile}
               onUpdateProfile={handleUpdateProfile}
             />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
