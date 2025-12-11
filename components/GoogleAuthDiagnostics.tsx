
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Copy, ExternalLink, HelpCircle, Save, RotateCw } from 'lucide-react';
import { diagnoseGoogleConfig, setRuntimeClientId } from '../services/authService';

export const GoogleAuthDiagnostics: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [manualId, setManualId] = useState('');
  const config = diagnoseGoogleConfig();

  // Auto-open if there is a critical configuration error
  React.useEffect(() => {
    if (!config.isClientIdSet || !config.isOriginSecure) {
      setIsOpen(true);
    }
  }, [config.isClientIdSet, config.isOriginSecure]);

  if (config.isClientIdSet && config.isOriginSecure && !isOpen) {
    // Render a tiny hidden trigger for developers who might need to debug later
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[10px] text-slate-300 dark:text-slate-700 hover:text-slate-500 mx-auto block mt-4"
      >
        Diagnostics
      </button>
    ); 
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Visual feedback handled by user interaction usually
  };

  const handleSaveId = () => {
    if (manualId.trim()) {
      setRuntimeClientId(manualId.trim());
    }
  };

  const handleClearId = () => {
    setRuntimeClientId("");
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden transition-all shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${config.isClientIdSet && config.isOriginSecure ? 'text-emerald-500' : 'text-amber-600'}`} />
          <span className="font-semibold text-slate-900 dark:text-white text-sm">
            Google Sign-In Configuration
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-black/20 text-sm space-y-4">
          <p className="text-slate-700 dark:text-slate-300">
            Troubleshoot "Access Blocked" or missing button errors here.
          </p>

          <div className="space-y-4">
            {/* Client ID Check */}
            <div className="flex items-start gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              {config.isClientIdSet ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">Client ID</p>
                {config.isClientIdSet ? (
                  <div className="space-y-1">
                    <p className="text-emerald-600 dark:text-emerald-400 text-xs">Configured {config.isRuntimeOverride && '(Manual Override)'}</p>
                    <code className="block text-[10px] text-slate-500 break-all bg-slate-100 dark:bg-slate-900 p-1 rounded">
                      {config.clientId}
                    </code>
                    {config.isRuntimeOverride && (
                      <button 
                        onClick={handleClearId}
                        className="text-xs text-rose-500 hover:underline flex items-center gap-1 mt-1"
                      >
                        <RotateCw className="w-3 h-3" /> Reset to Env Var
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-rose-600 dark:text-rose-400 text-xs">Missing</p>
                    <p className="text-xs text-slate-500">
                      Set <code>REACT_APP_GOOGLE_CLIENT_ID</code> in .env, or paste it below to test immediately:
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        placeholder="Paste Client ID here"
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs"
                      />
                      <button 
                        onClick={handleSaveId}
                        disabled={!manualId}
                        className="bg-primary-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-500 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Origin Check */}
            <div className="flex items-start gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              {config.isOriginSecure ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">Authorized Origin</p>
                <div className="flex items-center gap-2 mt-1 bg-slate-100 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                  <code className="text-xs font-mono break-all">{config.currentOrigin}</code>
                  <button onClick={() => copyToClipboard(config.currentOrigin)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Add this URI to <strong>Authorized JavaScript origins</strong> in Google Cloud Console.
                  <span className="block mt-1 text-rose-500 font-medium">Do NOT add a trailing slash!</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              Troubleshooting Checklist
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
              <li>Open <strong>Google Cloud Console {'>'} APIs & Services {'>'} Credentials</strong>.</li>
              <li>Ensure <strong>Authorized JavaScript origins</strong> matches the URL above exactly.</li>
              <li>Ensure you are using a <strong>Web Application</strong> client type (not Android/iOS/Desktop).</li>
              <li>If seeing "Access Blocked", add your email to <strong>OAuth Consent Screen {'>'} Test Users</strong>.</li>
              <li>Clear browser cache or try Incognito mode if changes don't appear immediately.</li>
            </ul>
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium hover:underline text-xs"
            >
              Go to Google Cloud Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
