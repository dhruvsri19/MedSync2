
/**
 * HealthKit & Google Fit Service
 * 
 * Since this is a web application, we cannot directly access Apple's HealthKit 
 * or Google Fit native APIs.
 * 
 * This service mocks the permission request flow and data retrieval 
 * that would normally occur via a Native Bridge (like React Native or Capacitor).
 */

export const HEALTH_PERMISSIONS = [
  { id: 'heart_rate', name: 'Heart Rate', read: true, write: false },
  { id: 'steps', name: 'Steps', read: true, write: false },
  { id: 'sleep_analysis', name: 'Sleep Analysis', read: true, write: false },
  { id: 'active_energy', name: 'Active Energy (Calories)', read: true, write: false },
];

export const GOOGLE_FIT_PERMISSIONS = [
  { id: 'heart_rate', name: 'Heart Rate', read: true, write: false },
  { id: 'steps', name: 'Steps', read: true, write: false },
  { id: 'calories', name: 'Calories Expended', read: true, write: false },
  { id: 'distance', name: 'Distance', read: true, write: false },
  { id: 'sleep', name: 'Sleep', read: true, write: false },
];

export const OURA_PERMISSIONS = [
  { id: 'readiness', name: 'Readiness Score', read: true, write: false },
  { id: 'sleep', name: 'Sleep Score', read: true, write: false },
  { id: 'activity', name: 'Activity Score', read: true, write: false },
  { id: 'spo2', name: 'SpO2 Average', read: true, write: false },
];

export const NHS_PERMISSIONS = [
  { id: 'gp_records', name: 'GP Health Record', read: true, write: false },
  { id: 'prescriptions', name: 'Prescriptions', read: true, write: false },
  { id: 'appointments', name: 'Appointments', read: true, write: true },
  { id: 'organ_donation', name: 'Organ Donation Status', read: true, write: false },
];

export const ABHA_PERMISSIONS = [
  { id: 'health_records', name: 'Personal Health Records', read: true, write: false },
  { id: 'lab_reports', name: 'Diagnostic Reports', read: true, write: false },
  { id: 'prescriptions', name: 'Doctor Prescriptions', read: true, write: false },
  { id: 'cowin', name: 'Vaccination Status', read: true, write: false },
];

export const MY_HEALTH_RECORD_PERMISSIONS = [
  { id: 'clinical_docs', name: 'Clinical Documents', read: true, write: false },
  { id: 'medicines', name: 'Medicine Information', read: true, write: false },
  { id: 'immunisations', name: 'Immunisation History', read: true, write: false },
  { id: 'organ_donor', name: 'Organ Donor Decision', read: true, write: false },
];

export type SyncFrequency = 'manual' | '15min' | 'hourly' | 'daily';

// Helper to simulate request
const mockRequest = (key: string, permissions: any[]) => {
  console.log(`Requesting authorization for ${key}:`, permissions.map(p => p.name));
  return new Promise<{success: boolean}>((resolve) => {
    setTimeout(() => {
      localStorage.setItem(key, 'granted');
      if (!getSyncFrequency()) {
        setSyncFrequency('hourly');
      }
      resolve({ success: true });
    }, 1500);
  });
};

const mockRevoke = (key: string) => {
    return new Promise<void>((resolve) => {
    setTimeout(() => {
      localStorage.removeItem(key);
      resolve();
    }, 500);
  });
};

// --- Apple HealthKit ---

export const requestHealthKitAuthorization = async (): Promise<{ success: boolean; error?: string }> => {
  console.log("Requesting HealthKit authorization for:", HEALTH_PERMISSIONS.map(p => p.name));
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccess = true; 
      if (isSuccess) {
        localStorage.setItem('medsync_healthkit_consent', 'granted');
        if (!getSyncFrequency()) {
          setSyncFrequency('hourly');
        }
        resolve({ success: true });
      } else {
        resolve({ success: false, error: 'User denied permission' });
      }
    }, 1500);
  });
};

export const checkHealthKitStatus = (): boolean => {
  return localStorage.getItem('medsync_healthkit_consent') === 'granted';
};

export const revokeHealthKitAccess = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('medsync_healthkit_consent');
      // Only clear global sync settings if no other provider is connected
      if (!checkGoogleFitStatus() && !checkOuraStatus()) {
        localStorage.removeItem('medsync_last_sync');
        localStorage.removeItem('medsync_sync_freq');
      }
      resolve();
    }, 500);
  });
};

// --- Google Fit ---

export const requestGoogleFitAuthorization = async (): Promise<{ success: boolean; error?: string }> => {
  console.log("Requesting Google Fit authorization for:", GOOGLE_FIT_PERMISSIONS.map(p => p.name));
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccess = true; 
      if (isSuccess) {
        localStorage.setItem('medsync_googlefit_consent', 'granted');
        if (!getSyncFrequency()) {
          setSyncFrequency('hourly');
        }
        resolve({ success: true });
      } else {
        resolve({ success: false, error: 'User denied permission' });
      }
    }, 1500);
  });
};

export const checkGoogleFitStatus = (): boolean => {
  return localStorage.getItem('medsync_googlefit_consent') === 'granted';
};

export const revokeGoogleFitAccess = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.removeItem('medsync_googlefit_consent');
      if (!checkHealthKitStatus() && !checkOuraStatus()) {
        localStorage.removeItem('medsync_last_sync');
        localStorage.removeItem('medsync_sync_freq');
      }
      resolve();
    }, 500);
  });
};

// --- Other Integrations ---

export const requestOuraAuthorization = () => mockRequest('medsync_oura_consent', OURA_PERMISSIONS);
export const revokeOuraAccess = () => mockRevoke('medsync_oura_consent');
export const checkOuraStatus = () => localStorage.getItem('medsync_oura_consent') === 'granted';

export const requestNHSAuthorization = () => mockRequest('medsync_nhs_consent', NHS_PERMISSIONS);
export const revokeNHSAccess = () => mockRevoke('medsync_nhs_consent');
export const checkNHSStatus = () => localStorage.getItem('medsync_nhs_consent') === 'granted';

export const requestABHAAuthorization = () => mockRequest('medsync_abha_consent', ABHA_PERMISSIONS);
export const revokeABHAAccess = () => mockRevoke('medsync_abha_consent');
export const checkABHAStatus = () => localStorage.getItem('medsync_abha_consent') === 'granted';

export const requestMyHealthRecordAuthorization = () => mockRequest('medsync_myhr_consent', MY_HEALTH_RECORD_PERMISSIONS);
export const revokeMyHealthRecordAccess = () => mockRevoke('medsync_myhr_consent');
export const checkMyHealthRecordStatus = () => localStorage.getItem('medsync_myhr_consent') === 'granted';


// --- Sync Features ---

export const getSyncFrequency = (): SyncFrequency => {
  return (localStorage.getItem('medsync_sync_freq') as SyncFrequency) || 'manual';
};

export const setSyncFrequency = (freq: SyncFrequency) => {
  localStorage.setItem('medsync_sync_freq', freq);
};

export const getLastSyncTime = (): string | null => {
  return localStorage.getItem('medsync_last_sync');
};

export const syncHealthData = async (): Promise<{ success: boolean; newRecords: number }> => {
  const connected = checkHealthKitStatus() || checkGoogleFitStatus() || checkOuraStatus() || checkNHSStatus() || checkABHAStatus() || checkMyHealthRecordStatus();

  if (!connected) {
    return { success: false, newRecords: 0 };
  }

  // Simulate Native Bridge Call to fetch Data
  return new Promise((resolve) => {
    console.log(`Starting Sync...`);
    setTimeout(() => {
      const now = new Date().toISOString();
      localStorage.setItem('medsync_last_sync', now);
      
      // Simulate finding "new" records
      const newRecordsCount = Math.floor(Math.random() * 15) + 1;
      console.log(`Sync Complete. ${newRecordsCount} new records found from all sources.`);
      
      resolve({ success: true, newRecords: newRecordsCount });
    }, 2000); // 2 second delay to feel like a real network/disk op
  });
};
