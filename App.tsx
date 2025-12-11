
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Timeline } from './pages/Timeline';
import { Upload } from './pages/Upload';
import { Insights } from './pages/Insights';
import { Medications } from './pages/Medications';
import { FamilyHealth } from './pages/FamilyHealth';
import { Settings } from './pages/Settings';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ForgotPassword } from './pages/ForgotPassword';
import { EmailVerification } from './pages/EmailVerification';
import { QuickHelp } from './pages/QuickHelp';
import { AppRoute, HealthMetric, LabReport, Medication, FamilyMember, UserProfile } from './types';
import { MOCK_METRICS, MOCK_REPORTS, MOCK_MEDICATIONS, MOCK_FAMILY_MEMBERS, MOCK_FAMILY_REPORTS, MOCK_USER_PROFILE } from './services/mockData';
import { HeartPulse, User, Mail, Lock, Calendar, ArrowRight, Menu } from 'lucide-react';
import { initializeGoogleSignIn, renderGoogleButton, decodeJwt, GoogleUser } from './services/authService';
import { GoogleAuthDiagnostics } from './components/GoogleAuthDiagnostics';
import { getSyncFrequency, syncHealthData } from './services/healthKitService';
import { getRecommendedEmergencyNumber, detectCountryFromTimeZone } from './services/emergencyService';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [metrics] = useState<HealthMetric[]>(MOCK_METRICS);
  const [reports, setReports] = useState<LabReport[]>(MOCK_REPORTS);
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Family State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [familyReports, setFamilyReports] = useState<LabReport[]>(MOCK_FAMILY_REPORTS);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER_PROFILE);

  // Insights Action State
  const [initialInsightAction, setInitialInsightAction] = useState<string | null>(null);

  // Mobile Menu State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Signup State
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male'
  });

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Session Management: Check localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('medsync_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserProfile(parsedUser);
        // If currently on auth pages, redirect to dashboard
        if (currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.SIGNUP || currentRoute === AppRoute.FORGOT_PASSWORD) {
          setCurrentRoute(AppRoute.DASHBOARD);
        }
      } catch (e) {
        console.error("Failed to parse stored user session", e);
        localStorage.removeItem('medsync_user');
      }
    }
  }, []);

  // Background Sync Service
  useEffect(() => {
    // Determine interval based on setting
    const freq = getSyncFrequency();
    let intervalMs = 0;

    switch (freq) {
      case '15min': intervalMs = 15 * 60 * 1000; break;
      case 'hourly': intervalMs = 60 * 60 * 1000; break;
      case 'daily': intervalMs = 24 * 60 * 60 * 1000; break;
      case 'manual': 
      default:
        intervalMs = 0;
    }

    if (intervalMs > 0) {
      console.log(`Starting background health sync every ${freq}`);
      const timer = setInterval(() => {
        syncHealthData().then(result => {
           if (result.success && result.newRecords > 0) {
             console.log(`Background Sync: ${result.newRecords} new records synced.`);
             // In a real app, this would dispatch to store to update 'metrics' state
           }
        });
      }, intervalMs);

      return () => clearInterval(timer);
    }
  }, []); // Run once on mount to set up the timer (in a real app, listen to settings changes)

  // Initialize Google Sign-In when on Login page
  useEffect(() => {
    if (currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.SIGNUP) {
      // Delay slightly to ensure DOM element exists and script loads
      const timer = setTimeout(() => {
        try {
          initializeGoogleSignIn(handleGoogleCredentialResponse);
          renderGoogleButton("googleSignInDiv");
        } catch (e) {
          console.error("Google Sign-In Init Failed", e);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentRoute]);

  const handleGoogleCredentialResponse = (response: any) => {
    if (response.credential) {
      const userData: GoogleUser | null = decodeJwt(response.credential);
      if (userData) {
        // 1. Determine Country (Try Google Locale first, then Browser Location/Timezone)
        let country = 'United States';
        
        // Attempt to extract from Google Locale (e.g., "en-GB")
        if (userData.locale) {
          try {
            const regionCode = userData.locale.split('-')[1];
            if (regionCode) {
              const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
              const mappedCountry = displayNames.of(regionCode);
              if (mappedCountry) country = mappedCountry;
            }
          } catch (e) {
            console.warn("Could not determine country from locale", userData.locale);
          }
        } else {
          // Fallback to location/timezone detection
          const detectedCountry = detectCountryFromTimeZone();
          if (detectedCountry) country = detectedCountry;
        }

        // 2. Map Google data to UserProfile
        // Note: 'age' and 'gender' are often not in the basic ID token scope without additional People API calls.
        // We set defaults or placeholders to allow user editing later.
        const newProfile: UserProfile = {
          id: userData.sub,
          name: userData.name,
          email: userData.email,
          photoUrl: userData.picture,
          // If we had a backend call to People API, we would populate these:
          age: 30, // Default, user can edit in settings
          gender: 'Not specified', // Default, user can edit in settings
          country: country, 
          emergencyNumber: getRecommendedEmergencyNumber(country)
        };
        
        setUserProfile(newProfile);
        // Persist session
        localStorage.setItem('medsync_user', JSON.stringify(newProfile));
        setCurrentRoute(AppRoute.DASHBOARD);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Use MOCK_USER_PROFILE for demo login
    setUserProfile(MOCK_USER_PROFILE);
    localStorage.setItem('medsync_user', JSON.stringify(MOCK_USER_PROFILE));
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('medsync_user');
    
    // Revoke Google token if possible/needed (optional for basic flow)
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }

    setCurrentRoute(AppRoute.LOGIN);
    // Reset to mock profile structure (or empty) to avoid null checks failing in UI before redirect completes
    setUserProfile(MOCK_USER_PROFILE);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-detect country/location if possible during manual signup
    let country = 'United States';
    const detected = detectCountryFromTimeZone();
    if (detected) country = detected;

    // Create temporary profile state
    setUserProfile({
      id: `u-${Date.now()}`,
      name: signupData.name,
      email: signupData.email,
      age: parseInt(signupData.age) || 0,
      gender: signupData.gender,
      phone: '',
      country: country,
      emergencyNumber: getRecommendedEmergencyNumber(country)
    });
    // Redirect to Email Verification instead of Dashboard
    setCurrentRoute(AppRoute.EMAIL_VERIFICATION);
  };

  const handleNavigate = (route: AppRoute, action?: string) => {
    setCurrentRoute(route);
    setIsSidebarOpen(false); // Close sidebar on navigation (mobile)
    if (action && route === AppRoute.INSIGHTS) {
      setInitialInsightAction(action);
    } else {
      setInitialInsightAction(null);
    }
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

  const handleUpdateFamilyMember = (updatedMember: FamilyMember) => {
    setFamilyMembers(familyMembers.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleRemoveFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
  };

  const handleAddFamilyReport = (report: LabReport) => {
    setFamilyReports([report, ...familyReports]);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    // Update storage if profile changes
    localStorage.setItem('medsync_user', JSON.stringify(updatedProfile));
  };

  // Handle Forgot Password Route
  if (currentRoute === AppRoute.FORGOT_PASSWORD) {
    return <ForgotPassword onNavigate={setCurrentRoute} />;
  }

  // Render Auth Screens (Login, Signup, or Email Verification)
  if (currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.SIGNUP || currentRoute === AppRoute.EMAIL_VERIFICATION) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-y-auto transition-colors duration-300">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200 dark:bg-primary-600/20 rounded-full blur-3xl opacity-50 dark:opacity-100"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-200 dark:bg-emerald-600/10 rounded-full blur-3xl opacity-50 dark:opacity-100"></div>
        
        <div className="bg-white/70 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300 my-8">
          
          {/* Header (Only for Login/Signup) */}
          {(currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.SIGNUP) && (
            <div className="flex flex-col items-center mb-8">
              <div className="bg-primary-600 p-3 rounded-2xl mb-4 shadow-lg shadow-primary-900/50">
                <HeartPulse className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {currentRoute === AppRoute.LOGIN ? 'Welcome to MedSync' : 'Create Account'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-center">
                {currentRoute === AppRoute.LOGIN 
                  ? 'Your unified health timeline powered by AI.' 
                  : 'Start your journey to better health management.'}
              </p>
            </div>
          )}
          
          {currentRoute === AppRoute.LOGIN ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="email" 
                    defaultValue="alex@example.com"
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="password" 
                    defaultValue="password"
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    type="button"
                    onClick={() => setCurrentRoute(AppRoute.FORGOT_PASSWORD)}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
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
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
                </div>
              </div>
              
              {/* Google Sign In Button Container */}
              <div className="min-h-[44px]">
                 <div id="googleSignInDiv" className="w-full h-full"></div>
              </div>
              
              {/* Troubleshooting Diagnostics */}
              <GoogleAuthDiagnostics />

            </form>
          ) : currentRoute === AppRoute.SIGNUP ? (
            /* SIGNUP FORM */
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    required
                    value={signupData.name}
                    onChange={e => setSignupData({...signupData, name: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="email" 
                    required
                    value={signupData.email}
                    onChange={e => setSignupData({...signupData, email: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="password" 
                    required
                    value={signupData.password}
                    onChange={e => setSignupData({...signupData, password: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="Create a password"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Age</label>
                   <div className="relative">
                     <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
                     <input 
                       type="number" 
                       required
                       value={signupData.age}
                       onChange={e => setSignupData({...signupData, age: e.target.value})}
                       className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                       placeholder="Age"
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Gender</label>
                   <select
                     value={signupData.gender}
                     onChange={e => setSignupData({...signupData, gender: e.target.value})}
                     className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 appearance-none transition-colors"
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
          ) : (
            /* EMAIL VERIFICATION */
            <EmailVerification 
              email={userProfile.email}
              onVerifySuccess={() => {
                // Persist the new user upon successful verification
                localStorage.setItem('medsync_user', JSON.stringify(userProfile));
                setCurrentRoute(AppRoute.DASHBOARD);
              }}
              onResendCode={() => console.log('Resent code to', userProfile.email)}
              onBack={() => setCurrentRoute(AppRoute.SIGNUP)}
            />
          )}

          {(currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.SIGNUP) && (
            <div className="mt-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                {currentRoute === AppRoute.LOGIN ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setCurrentRoute(currentRoute === AppRoute.LOGIN ? AppRoute.SIGNUP : AppRoute.LOGIN)}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium transition-colors"
                >
                  {currentRoute === AppRoute.LOGIN ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Main Application
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen relative transition-colors duration-300">
      {/* Background Ambient Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200/40 dark:bg-primary-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-200/40 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive classes */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar 
          currentRoute={currentRoute} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
          onClose={() => setIsSidebarOpen(false)}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      </div>
      
      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 md:ml-64 w-full overflow-x-hidden relative`}>
        {/* Mobile Header */}
        <div className="md:hidden p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="text-slate-900 dark:text-white p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Menu className="w-6 h-6" />
             </button>
             <span className="text-lg font-bold text-slate-900 dark:text-white">MedSync</span>
          </div>
          {userProfile.photoUrl ? (
            <img 
              src={userProfile.photoUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
               {userProfile.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
          {currentRoute === AppRoute.DASHBOARD && (
            <Dashboard 
              metrics={metrics} 
              onNavigate={handleNavigate} 
              isDarkMode={isDarkMode} 
              userName={userProfile.name}
            />
          )}
          {currentRoute === AppRoute.TIMELINE && (
            <Timeline metrics={metrics} isDarkMode={isDarkMode} />
          )}
          {currentRoute === AppRoute.QUICK_HELP && (
            <QuickHelp userProfile={userProfile} />
          )}
          {currentRoute === AppRoute.UPLOAD && (
            <Upload 
              onAddReport={(report) => setReports([report, ...reports])} 
              reports={reports} 
            />
          )}
          {currentRoute === AppRoute.INSIGHTS && (
            <Insights 
              metrics={metrics} 
              reports={reports} 
              initialAction={initialInsightAction}
              onNavigate={handleNavigate}
            />
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
               onUpdateMember={handleUpdateFamilyMember}
               onRemoveMember={handleRemoveFamilyMember}
             />
          )}
          {currentRoute === AppRoute.SETTINGS && (
             <Settings 
               profile={userProfile}
               onUpdateProfile={handleUpdateProfile}
               onNavigate={handleNavigate}
               isDarkMode={isDarkMode}
               toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
             />
          )}
          {currentRoute === AppRoute.PRIVACY_POLICY && (
            <PrivacyPolicy onNavigate={handleNavigate} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
