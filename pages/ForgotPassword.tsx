
import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, ArrowLeft, Lock, CheckCircle, KeyRound, AlertCircle, RefreshCw, Eye, EyeOff, ShieldCheck, Smartphone, HelpCircle } from 'lucide-react';
import { AppRoute } from '../types';

interface ForgotPasswordProps {
  onNavigate: (route: AppRoute) => void;
}

type Step = 'EMAIL' | 'PHONE' | 'OTP' | 'RESET' | 'SUCCESS';
type Method = 'EMAIL' | 'PHONE';

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<Step>('EMAIL');
  const [method, setMethod] = useState<Method>('EMAIL');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // OTP State
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);
  
  // Reset Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Simulated Backend Logic (Rate Limiting & OTP)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);
  // --- STEP 1: REQUEST OTP (EMAIL) ---
  const handleRequestEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // Basic Validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    // SIMULATE API CALL
    setTimeout(() => {
      setIsLoading(false);
      setMethod('EMAIL');
      setStep('OTP');
      setCooldown(60); // 60s cooldown
      setMessage(`We've sent a 6-digit code to ${email}. It expires in 10 minutes.`);
    }, 1500);
  };
  // --- STEP 1.5: REQUEST OTP (SMS) ---
  const handleRequestSmsOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // Basic Validation (Simple international regex)
    if (!phone.match(/^\+?[1-9]\d{1,14}$/)) {
      setError("Please enter a valid phone number with country code (e.g. +15550000000).");
      setIsLoading(false);
      return;
    }

    // SIMULATE API CALL
    setTimeout(() => {
      setIsLoading(false);
      setMethod('PHONE');
      setStep('OTP');
      setCooldown(60);
      setMessage(`We've sent a 6-digit code to your phone ending in ${phone.slice(-4)}. It expires in 10 minutes.`);
    }, 1500);
  };

  // --- STEP 2: VERIFY OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      setIsLoading(false);
      return;
    }

    // SIMULATE API CALL
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') { // Mock OTP
        setStep('RESET');
        setMessage(null);
      } else {
        setError("Invalid or expired code. Please try again.");
      }
    }, 1500);
  };

  const handleResendOtp = () => {
    if (cooldown > 0) return;
    setCooldown(60);
    const destination = method === 'EMAIL' ? email : `phone ending in ${phone.slice(-4)}`;
    setMessage(`A new code has been sent to ${destination}.`);
  };

  // --- STEP 3: RESET PASSWORD ---
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.match(/[A-Z]/)) score++;
    if (pass.match(/[0-9]/)) score++;
    if (pass.match(/[^A-Za-z0-9]/)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);
  const isStrongEnough = strengthScore >= 3;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isStrongEnough || !doPasswordsMatch) {
       setError("Please ensure passwords match and meet strength requirements.");
       setIsLoading(false);
       return;
    }

    // SIMULATE API CALL
    setTimeout(() => {
      setIsLoading(false);
      setStep('SUCCESS');
    }, 1500);
  };

  // --- RENDER HELPERS ---
  const renderStepEmail = () => (
    <form onSubmit={handleRequestEmailOtp} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div>
        <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="email" 
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            placeholder="name@example.com"
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-slate-500">
            We'll send a code to this email.
          </p>
          <button 
            type="button"
            onClick={() => { setError(null); setStep('PHONE'); }}
            className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors flex items-center gap-1"
          >
            Try via SMS <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </button>
    </form>
  );

  const renderStepPhone = () => (
    <form onSubmit={handleRequestSmsOtp} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div>
        <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Phone Number</label>
        <div className="relative">
          <Smartphone className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="tel" 
            required
            autoFocus
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            placeholder="+1 555 123 4567"
          />
        </div>
        <div className="flex justify-between items-center mt-2">
           <p className="text-xs text-slate-500">
            Standard SMS rates may apply.
          </p>
          <button 
            type="button"
            onClick={() => { setError(null); setStep('EMAIL'); }}
            className="text-xs font-medium text-primary-600 hover:text-primary-500 transition-colors flex items-center gap-1"
          >
             <ArrowLeft className="w-3 h-3" /> Use Email instead
          </button>
        </div>
      </div>

      <button 
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Send SMS Code'}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </button>
    </form>
  );

  const renderStepOtp = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="text-slate-900 dark:text-white font-medium">Enter Secure Code</h3>
        <p className="text-slate-500 text-sm mt-1">
          Sent to{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {method === 'EMAIL' ? email : phone}
          </span>
        </p>
      </div>

      <div>
        <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2 sr-only">OTP Code</label>
        <input 
          type="text" 
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          autoFocus
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
          className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:tracking-normal"
          placeholder="000000"
        />
        <p className="text-xs text-center text-slate-400 mt-3">
          (Demo Code: 123456)
        </p>
      </div>

      <button 
        type="submit"
        disabled={isLoading || otp.length !== 6}
        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify Code'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={cooldown > 0}
          className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive it? Resend"}
        </button>
      </div>
      
      <div className="text-center mt-2">
        <button
          type="button"
          onClick={() => { setStep(method); setOtp(''); setError(null); }}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Change {method === 'EMAIL' ? 'email' : 'phone number'}
        </button>
      </div>
    </form>
  );

  const renderStepReset = () => (
    <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
      <div>
        <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type={showPassword ? "text" : "password"}
            required
            autoFocus
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            placeholder="At least 8 characters"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {/* Strength Meter */}
        <div className="mt-2 flex gap-1 h-1">
          {[1, 2, 3, 4].map((level) => (
             <div 
               key={level} 
               className={`flex-1 rounded-full transition-colors duration-300 ${
                 strengthScore >= level 
                  ? (strengthScore <= 2 ? 'bg-rose-500' : strengthScore === 3 ? 'bg-amber-500' : 'bg-emerald-500')
                  : 'bg-slate-200 dark:bg-slate-700'
               }`} 
             />
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Use 8+ chars, mixed case, numbers & symbols.
        </p>
      </div>

      <div>
        <label className="block text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full bg-white dark:bg-slate-900/50 border rounded-xl pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${
               confirmPassword.length > 0 && !doPasswordsMatch
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500'
            }`}
            placeholder="Re-enter password"
          />
        </div>
        {confirmPassword.length > 0 && !doPasswordsMatch && (
          <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Passwords do not match
          </p>
        )}
      </div>

      <button 
        type="submit"
        disabled={isLoading || !isStrongEnough || !doPasswordsMatch}
        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Reset Password'}
      </button>
    </form>
  );

  const renderSuccess = () => (
    <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password Reset!</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">
        Your password has been successfully updated. You can now log in with your new credentials.
      </p>
      <button 
        onClick={() => onNavigate(AppRoute.LOGIN)}
        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-900/20"
      >
        Return to Login
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-200 dark:bg-primary-600/10 rounded-full blur-3xl opacity-50 dark:opacity-100 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-200 dark:bg-indigo-600/10 rounded-full blur-3xl opacity-50 dark:opacity-100 animate-pulse" style={{ animationDuration: '10s' }}></div>

      <div className="bg-white/80 dark:bg-slate-800/60 border border-white/50 dark:border-slate-700 backdrop-blur-xl p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10">
        
        {/* Header */}
        {step !== 'SUCCESS' && (
          <div className="mb-8">
            <button 
              onClick={() => {
                if (step === 'EMAIL' || step === 'PHONE') onNavigate(AppRoute.LOGIN);
                else if (step === 'OTP') setStep(method);
                else if (step === 'RESET') setStep('OTP');
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {step === 'EMAIL' ? 'Forgot Password?' : step === 'PHONE' ? 'SMS Verification' : step === 'OTP' ? 'Verify Identity' : 'Create New Password'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {step === 'EMAIL' 
                ? 'Enter your email to receive a reset code.' 
                : step === 'PHONE' 
                ? 'Enter your mobile number to receive a code.' 
                : step === 'OTP' 
                ? 'Enter the secure code sent to you.' 
                : 'Choose a strong password for your account.'}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-2 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Info Message */}
        {message && !error && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-2 text-sm animate-in fade-in slide-in-from-top-2">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            {message}
          </div>
        )}

        {/* Active Step Content */}
        {step === 'EMAIL' && renderStepEmail()}
        {step === 'PHONE' && renderStepPhone()}
        {step === 'OTP' && renderStepOtp()}
        {step === 'RESET' && renderStepReset()}
        {step === 'SUCCESS' && renderSuccess()}
      </div>

      {/* Backend API & Security Notes (Mock Documentation) */}
      {/* 
        === BACKEND IMPLEMENTATION GUIDE ===
        
        1. API Endpoints Required:
           - POST /api/auth/forgot-password/email
             Body: { email: string }
           
           - POST /api/auth/forgot-password/sms
             Body: { phone: string }
             Action: Verify phone registered -> Generate OTP -> Send via SMS Provider (Twilio/AWS SNS)
             Note: Use "silent" failures if phone not found to prevent enumeration.

           - POST /api/auth/verify-otp
             Body: { target: string, otp: string, method: 'email'|'sms' }
             
           - POST /api/auth/reset-password
             Body: { token: string, new_password: string }

        2. Security Best Practices:
           - SMS OTP: 6 digits, 10 min expiry.
           - Throttle SMS requests per IP and per Phone Number (e.g., 5 per hour).
           - Do not return user existence errors to the frontend.
      */}
    </div>
  );
};
