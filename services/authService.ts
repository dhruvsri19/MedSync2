

/**
 * Auth Service
 * Handles Google Sign-In integration using Google Identity Services (GIS).
 * Supports both Credential (ID Token) flow for SPAs and Auth Code flow for Backend apps.
 */

declare global {
  interface Window {
    google: any;
  }
}

// Helper to safely get env var
const getEnvVar = (key: string) => {
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env) {
    // @ts-ignore
    return process.env[key];
  }
  return "";
};

// Allow runtime override for debugging/diagnostics
const getRuntimeClientId = () => {
  const stored = localStorage.getItem('medsync_debug_client_id');
  if (stored) return stored;
  
  return getEnvVar('REACT_APP_GOOGLE_CLIENT_ID') || "128787074502-k50i85ul8qhdcql9r75vel41cnnj904o.apps.googleusercontent.com";
};

export const setRuntimeClientId = (id: string) => {
  if (!id) {
    localStorage.removeItem('medsync_debug_client_id');
  } else {
    localStorage.setItem('medsync_debug_client_id', id);
  }
  window.location.reload(); // Reload to re-init Google script with new ID
};

const GOOGLE_CLIENT_ID = getRuntimeClientId();

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google User ID
  given_name?: string;
  family_name?: string;
  locale?: string;
}

export interface AuthDiagnostics {
  isClientIdSet: boolean;
  isOriginSecure: boolean; // Localhost or HTTPS
  currentOrigin: string;
  clientId: string;
  isRuntimeOverride: boolean;
}

/**
 * Decodes the JWT token returned by Google to extract user info.
 */
export const decodeJwt = (token: string): GoogleUser | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT", error);
    return null;
  }
};

/**
 * Helper to wait for the Google script to load
 */
const waitForGoogle = (callback: () => void) => {
  if (window.google && window.google.accounts && window.google.accounts.id) {
    callback();
    return;
  }
  const checkInterval = setInterval(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      clearInterval(checkInterval);
      callback();
    }
  }, 100);
  
  // Timeout after 10s to stop checking
  setTimeout(() => clearInterval(checkInterval), 10000);
};

/**
 * Runs diagnostics on the current configuration to help debug "Access Blocked" errors.
 */
export const diagnoseGoogleConfig = (): AuthDiagnostics => {
  const currentOrigin = window.location.origin;
  const isLocal = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');
  const isHttps = currentOrigin.startsWith('https://');

  return {
    isClientIdSet: !!GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID"),
    isOriginSecure: isLocal || isHttps,
    currentOrigin,
    clientId: GOOGLE_CLIENT_ID,
    isRuntimeOverride: !!localStorage.getItem('medsync_debug_client_id')
  };
};

/**
 * Initializes the Google Sign-In client (Sign In With Google button).
 * Uses the Credential Response flow (ID Token) which is standard for SPAs.
 */
export const initializeGoogleSignIn = (callbackFunction: (response: any) => void) => {
  const clientId = getRuntimeClientId();
  if (!clientId) {
    console.warn("Google Client ID is missing. Skipping initialization.");
    return;
  }

  waitForGoogle(() => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: callbackFunction,
        auto_select: false,
        cancel_on_tap_outside: true,
        // ux_mode: 'popup', // Default. Use 'redirect' only if you have a backend route to handle it.
        // allowed_parent_origin: window.location.origin // Optional security measure
      });
    } catch (e) {
      console.error("Error initializing Google Sign-In:", e);
    }
  });
};

/**
 * Renders the Google Sign-In button into a specific HTML element.
 */
export const renderGoogleButton = (elementId: string) => {
  const clientId = getRuntimeClientId();
  if (!clientId) return;

  waitForGoogle(() => {
    const element = document.getElementById(elementId);
    if (element) {
      try {
        window.google.accounts.id.renderButton(element, {
          theme: "outline",
          size: "large",
          width: "100%", // Responsive width
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left"
        });
      } catch (e) {
        console.error("Error rendering Google Button:", e);
      }
    } else {
      console.warn(`Google Auth: Element with ID ${elementId} not found`);
    }
  });
};

/**
 * Initialize Authorization Code Flow (For Backend Exchange).
 * Call this if you need an 'access_token' or 'refresh_token' on your backend.
 * 
 * Usage:
 * const login = useGoogleLogin({ ... });
 */
export const initAuthCodeFlow = (callback: (response: any) => void) => {
   const clientId = getRuntimeClientId();
   if (!clientId || !window.google) return null;
   
   return window.google.accounts.oauth2.initCodeClient({
     client_id: clientId,
     scope: 'openid email profile', 
     ux_mode: 'popup',
     callback: (response: any) => {
        if (response.code) {
           // Send this code to your backend
           callback(response.code);
        }
     },
   });
};
