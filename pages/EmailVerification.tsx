
import React, { useState, useEffect, useRef } from 'react';
import { Mail, RefreshCw, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerifySuccess: () => void;
  onResendCode: () => void;
  onBack: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ email, onVerifySuccess, onResendCode, onBack }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      // Mock validation - accept '123456' or any code for demo purposes
      if (code === "123456" || code.length === 6) {
        setIsLoading(false);
        onVerifySuccess();
      } else {
        setIsLoading(false);
        setError("Invalid code. Please try again.");
      }
    }, 1500);
  };

  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(30);
      onResendCode();
      setOtp(new Array(6).fill(""));
      if (inputRefs.current[0]) inputRefs.current[0].focus();
      setError(null);
    }
  };

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4 shadow-sm">
                <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                We've sent a 6-digit verification code to <br/>
                <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
            </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((data, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        maxLength={1}
                        value={data}
                        onChange={(e) => handleChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-slate-900 dark:text-white shadow-sm"
                    />
                ))}
            </div>

            {error && (
                <div className="flex items-center justify-center gap-2 text-rose-500 text-sm bg-rose-50 dark:bg-rose-900/20 py-2 rounded-lg border border-rose-100 dark:border-rose-900/50">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify Account"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Didn't receive the code?{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timeLeft > 0}
                        className={`font-medium transition-colors ${
                            timeLeft > 0 
                                ? 'text-slate-400 cursor-not-allowed' 
                                : 'text-primary-600 dark:text-primary-400 hover:text-primary-500'
                        }`}
                    >
                        {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Click to resend'}
                    </button>
                </p>
                <div className="mt-4 text-xs text-slate-400">
                   (Demo Code: 123456)
                </div>
            </div>
        </form>
    </div>
  );
};
