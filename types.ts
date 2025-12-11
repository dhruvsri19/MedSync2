
export interface HealthMetric {
  id: string;
  type: 'heart_rate' | 'steps' | 'sleep' | 'calories';
  value: number;
  unit: string;
  timestamp: string;
}

export interface LabReport {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'processing' | 'analyzed' | 'error';
  summary?: string;
  keyMetrics?: Record<string, string | number>;
  memberId?: string; // Optional: if belongs to a family member
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'alert';
  date: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'Once daily' | 'Twice daily' | 'Thrice daily' | 'Custom';
  startDate: string;
  endDate?: string;
  // Extended fields
  form?: string;
  manufacturedDate?: string;
  expiryDate?: string;
  manufacturer?: string;
  batchNumber?: string;
  notes?: string;
  photoUrl?: string; // Base64 or URL of the packaging
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  avatarColor: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionLabel?: string;
  actionRoute?: AppRoute;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  phone?: string;
  photoUrl?: string;
  country?: string;
  emergencyNumber?: string;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  TIMELINE = 'timeline',
  UPLOAD = 'upload',
  INSIGHTS = 'insights',
  MEDICATIONS = 'medications',
  FAMILY = 'family',
  QUICK_HELP = 'quick_help',
  SETTINGS = 'settings',
  LOGIN = 'login',
  SIGNUP = 'signup',
  PRIVACY_POLICY = 'privacy_policy',
  FORGOT_PASSWORD = 'forgot_password',
  EMAIL_VERIFICATION = 'email_verification'
}
