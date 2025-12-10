import { HealthMetric, LabReport, Insight, Medication, FamilyMember, UserProfile } from '../types';

export const MOCK_METRICS: HealthMetric[] = Array.from({ length: 30 }).map((_, i): HealthMetric => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    id: `m-${i}`,
    type: 'heart_rate',
    value: 65 + Math.floor(Math.random() * 15),
    unit: 'bpm',
    timestamp: date.toISOString(),
  };
}).concat(
  Array.from({ length: 30 }).map((_, i): HealthMetric => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      id: `s-${i}`,
      type: 'steps',
      value: 6000 + Math.floor(Math.random() * 5000),
      unit: 'steps',
      timestamp: date.toISOString(),
    };
  })
);

export const MOCK_REPORTS: LabReport[] = [
  {
    id: 'r-1',
    fileName: 'Blood_Work_Jan_2024.pdf',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    status: 'analyzed',
    summary: 'Normal CBC. Slight vitamin D deficiency noted.',
    keyMetrics: {
      'Hemoglobin': '14.2 g/dL',
      'Vitamin D': '28 ng/mL'
    }
  }
];

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'i-1',
    title: 'Heart Rate Spike',
    description: 'Your average heart rate was higher than normal last Tuesday.',
    severity: 'warning',
    date: new Date().toISOString()
  },
  {
    id: 'i-2',
    title: 'Good Activity Level',
    description: 'You achieved your step goal 5 times this week.',
    severity: 'info',
    date: new Date().toISOString()
  }
];

export const MOCK_MEDICATIONS: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    startDate: '2023-01-01',
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2023-02-15',
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    startDate: '2023-03-10',
  }
];

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'f1', name: 'Sarah', relation: 'Spouse', age: 32, avatarColor: 'bg-rose-500' },
  { id: 'f2', name: 'Leo', relation: 'Son', age: 8, avatarColor: 'bg-blue-500' },
  { id: 'f3', name: 'Grandma May', relation: 'Mother', age: 74, avatarColor: 'bg-purple-500' },
];

export const MOCK_FAMILY_REPORTS: LabReport[] = [
  {
    id: 'fr-1',
    memberId: 'f3',
    fileName: 'Cardiology_Checkup.pdf',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: 'analyzed',
    summary: 'ECG shows normal sinus rhythm. Blood pressure managed well with current medication.',
    keyMetrics: {
      'BP Systolic': '128 mmHg',
      'BP Diastolic': '82 mmHg',
      'Heart Rate': '72 bpm'
    }
  }
];

export const MOCK_USER_PROFILE: UserProfile = {
  id: 'u-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  age: 34,
  gender: 'Male',
  phone: '+1 (555) 123-4567'
};