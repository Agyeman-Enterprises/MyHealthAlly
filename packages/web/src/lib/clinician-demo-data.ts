export type VitalSnapshot = {
  timestamp: string; // ISO
  heartRate: number;
  systolic: number;
  diastolic: number;
  hrvMs: number;
  bmi: number;
};

export type HRVTrendPoint = {
  date: string; // e.g. 'Tue'
  hrvMs: number;
};

export type PatientSummary = {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  avatarUrl?: string;
  lastVisit: string;
  nextVisit?: string;
  primaryDx?: string;
  riskLevel: 'low' | 'moderate' | 'high';
  devices: string[]; // e.g. ['Apple Watch', 'Oura Ring']
  latestVitals: VitalSnapshot;
  hrvTrend: HRVTrendPoint[];
};

export type ClinicianTask = {
  id: string;
  patientId?: string;
  patientName?: string;
  title: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'done';
  category: 'follow_up' | 'lab_review' | 'meds' | 'admin';
};

export type MessageSummary = {
  id: string;
  patientId: string;
  patientName: string;
  lastMessageSnippet: string;
  lastMessageTime: string;
  unreadCount: number;
  channel: 'portal' | 'sms' | 'call';
};

export type VisitSummary = {
  id: string;
  patientId: string;
  patientName: string;
  startTime: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  visitType: 'virtual' | 'in_person';
  reason: string;
};

export type LabResult = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  test: string;
  result: string;
  flag: 'normal' | 'abnormal';
  status: 'unreviewed' | 'reviewed';
};

// Mock Data
const mockPatients: PatientSummary[] = [
  {
    id: '1',
    name: 'John Davis',
    age: 52,
    sex: 'M',
    lastVisit: '2024-01-15T10:00:00Z',
    nextVisit: '2024-01-22T14:00:00Z',
    primaryDx: 'Hypertension',
    riskLevel: 'high',
    devices: ['Apple Watch', 'Oura Ring'],
    latestVitals: {
      timestamp: '2024-01-20T08:00:00Z',
      heartRate: 72,
      systolic: 145,
      diastolic: 92,
      hrvMs: 42,
      bmi: 28.5,
    },
    hrvTrend: [
      { date: 'Mon', hrvMs: 38 },
      { date: 'Tue', hrvMs: 40 },
      { date: 'Wed', hrvMs: 42 },
      { date: 'Thu', hrvMs: 41 },
      { date: 'Fri', hrvMs: 43 },
      { date: 'Sat', hrvMs: 45 },
      { date: 'Sun', hrvMs: 42 },
    ],
  },
  {
    id: '2',
    name: 'Maria Torres',
    age: 45,
    sex: 'F',
    lastVisit: '2024-01-18T09:30:00Z',
    nextVisit: '2024-01-25T10:00:00Z',
    primaryDx: 'Type 2 Diabetes',
    riskLevel: 'moderate',
    devices: ['Fitbit', 'Garmin'],
    latestVitals: {
      timestamp: '2024-01-20T07:30:00Z',
      heartRate: 68,
      systolic: 128,
      diastolic: 78,
      hrvMs: 55,
      bmi: 26.2,
    },
    hrvTrend: [
      { date: 'Mon', hrvMs: 52 },
      { date: 'Tue', hrvMs: 54 },
      { date: 'Wed', hrvMs: 53 },
      { date: 'Thu', hrvMs: 55 },
      { date: 'Fri', hrvMs: 56 },
      { date: 'Sat', hrvMs: 54 },
      { date: 'Sun', hrvMs: 55 },
    ],
  },
  {
    id: '3',
    name: 'Samir Patel',
    age: 38,
    sex: 'M',
    lastVisit: '2024-01-10T11:00:00Z',
    nextVisit: '2024-01-24T15:00:00Z',
    primaryDx: 'Weight Management',
    riskLevel: 'low',
    devices: ['Apple Watch'],
    latestVitals: {
      timestamp: '2024-01-20T06:00:00Z',
      heartRate: 65,
      systolic: 118,
      diastolic: 72,
      hrvMs: 68,
      bmi: 24.8,
    },
    hrvTrend: [
      { date: 'Mon', hrvMs: 65 },
      { date: 'Tue', hrvMs: 67 },
      { date: 'Wed', hrvMs: 66 },
      { date: 'Thu', hrvMs: 68 },
      { date: 'Fri', hrvMs: 69 },
      { date: 'Sat', hrvMs: 70 },
      { date: 'Sun', hrvMs: 68 },
    ],
  },
  {
    id: '4',
    name: 'Keisha Bannister',
    age: 34,
    sex: 'F',
    lastVisit: '2024-01-19T13:00:00Z',
    nextVisit: undefined,
    primaryDx: 'Mood & Sleep',
    riskLevel: 'moderate',
    devices: ['Oura Ring'],
    latestVitals: {
      timestamp: '2024-01-20T09:00:00Z',
      heartRate: 70,
      systolic: 122,
      diastolic: 75,
      hrvMs: 48,
      bmi: 23.1,
    },
    hrvTrend: [
      { date: 'Mon', hrvMs: 45 },
      { date: 'Tue', hrvMs: 47 },
      { date: 'Wed', hrvMs: 46 },
      { date: 'Thu', hrvMs: 48 },
      { date: 'Fri', hrvMs: 49 },
      { date: 'Sat', hrvMs: 50 },
      { date: 'Sun', hrvMs: 48 },
    ],
  },
];

const mockTasks: ClinicianTask[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Davis',
    title: 'Review elevated BP readings',
    dueDate: '2024-01-21',
    priority: 'high',
    status: 'open',
    category: 'follow_up',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Maria Torres',
    title: 'Review glucose trends',
    dueDate: '2024-01-22',
    priority: 'medium',
    status: 'open',
    category: 'lab_review',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Samir Patel',
    title: 'Follow up on weight loss progress',
    dueDate: '2024-01-23',
    priority: 'low',
    status: 'in_progress',
    category: 'follow_up',
  },
  {
    id: '4',
    patientName: 'System',
    title: 'Complete monthly report',
    dueDate: '2024-01-25',
    priority: 'medium',
    status: 'open',
    category: 'admin',
  },
  {
    id: '5',
    patientId: '4',
    patientName: 'Keisha Bannister',
    title: 'Review sleep pattern changes',
    dueDate: '2024-01-20',
    priority: 'medium',
    status: 'done',
    category: 'follow_up',
  },
];

const mockMessages: MessageSummary[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Davis',
    lastMessageSnippet: 'My blood pressure has been higher than usual...',
    lastMessageTime: '2024-01-20T14:30:00Z',
    unreadCount: 2,
    channel: 'portal',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Maria Torres',
    lastMessageSnippet: 'Thank you for the medication adjustment',
    lastMessageTime: '2024-01-20T10:15:00Z',
    unreadCount: 0,
    channel: 'sms',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Samir Patel',
    lastMessageSnippet: 'I have a question about my exercise plan',
    lastMessageTime: '2024-01-19T16:45:00Z',
    unreadCount: 1,
    channel: 'portal',
  },
];

const mockVisits: VisitSummary[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Davis',
    startTime: '2024-01-21T10:00:00Z',
    status: 'scheduled',
    visitType: 'virtual',
    reason: 'Follow-up on BP management',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Maria Torres',
    startTime: '2024-01-21T14:00:00Z',
    status: 'scheduled',
    visitType: 'in_person',
    reason: 'Diabetes check-in',
  },
  {
    id: '3',
    patientId: '4',
    patientName: 'Keisha Bannister',
    startTime: '2024-01-21T09:00:00Z',
    status: 'in_progress',
    visitType: 'virtual',
    reason: 'Sleep consultation',
  },
];

const mockLabs: LabResult[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Davis',
    date: '2024-01-18',
    test: 'Lipid Panel',
    result: 'Total Cholesterol: 245 mg/dL',
    flag: 'abnormal',
    status: 'unreviewed',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Maria Torres',
    date: '2024-01-17',
    test: 'HbA1c',
    result: '7.2%',
    flag: 'abnormal',
    status: 'unreviewed',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Samir Patel',
    date: '2024-01-15',
    test: 'CBC',
    result: 'All values within normal range',
    flag: 'normal',
    status: 'reviewed',
  },
];

// Helper functions
export function getClinicianPatients(): PatientSummary[] {
  return mockPatients;
}

export function getPatientById(id: string): PatientSummary | undefined {
  return mockPatients.find((p) => p.id === id);
}

export function getTasks(filter?: {
  status?: 'open' | 'in_progress' | 'done';
  patientId?: string;
}): ClinicianTask[] {
  let tasks = [...mockTasks];
  if (filter?.status) {
    tasks = tasks.filter((t) => t.status === filter.status);
  }
  if (filter?.patientId) {
    tasks = tasks.filter((t) => t.patientId === filter.patientId);
  }
  return tasks;
}

export function getMessages(): MessageSummary[] {
  return mockMessages;
}

export function getVisitsToday(): VisitSummary[] {
  const today = new Date().toISOString().split('T')[0];
  return mockVisits.filter((v) => v.startTime.startsWith(today));
}

export function getHighRiskPatients(): PatientSummary[] {
  return mockPatients.filter((p) => p.riskLevel === 'high');
}

export function getLabs(filter?: {
  status?: 'unreviewed' | 'reviewed';
  flag?: 'normal' | 'abnormal';
}): LabResult[] {
  let labs = [...mockLabs];
  if (filter?.status) {
    labs = labs.filter((l) => l.status === filter.status);
  }
  if (filter?.flag) {
    labs = labs.filter((l) => l.flag === filter.flag);
  }
  return labs;
}

export function getVisitById(id: string): VisitSummary | undefined {
  return mockVisits.find((v) => v.id === id);
}

