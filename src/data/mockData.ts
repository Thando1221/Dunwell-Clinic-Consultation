export interface Patient {
  id: number;
  name: string;
  surname: string;
  dob: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  idNumber: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  startTime: string;
  endTime?: string;
  status: 'Pending' | 'InPatient' | 'OutPatient' | 'Completed' | 'Cancelled';
  type: 'General' | 'Follow-up' | 'Emergency' | 'Consultation';
  notes?: string;
}

export interface Visit {
  visitId: number;
  appointId: number;
  patientId: number;
  patientName: string;
  examination: string;
  history: string;
  diagnoses: string;
  treatment: string;
  healthEducation: string;
  followUpPlan: string;
  endTime: string;
}

export const mockPatients: Patient[] = [
  { id: 1, name: 'John', surname: 'Doe', dob: '1990-05-15', gender: 'M', phone: '0821234567', email: 'john@email.com', idNumber: '9005155012089' },
  { id: 2, name: 'Jane', surname: 'Smith', dob: '1985-08-22', gender: 'F', phone: '0829876543', email: 'jane@email.com', idNumber: '8508220087089' },
  { id: 3, name: 'Michael', surname: 'Brown', dob: '1978-12-03', gender: 'M', phone: '0834567890', email: 'michael@email.com', idNumber: '7812035123083' },
  { id: 4, name: 'Emily', surname: 'Wilson', dob: '1995-03-18', gender: 'F', phone: '0847654321', email: 'emily@email.com', idNumber: '9503180456082' },
  { id: 5, name: 'David', surname: 'Taylor', dob: '1982-07-09', gender: 'M', phone: '0856789012', email: 'david@email.com', idNumber: '8207095789087' },
];

export const mockAppointments: Appointment[] = [
  { id: 1, patientId: 1, patientName: 'John Doe', startTime: '2026-01-08T09:00:00', status: 'InPatient', type: 'General' },
  { id: 2, patientId: 2, patientName: 'Jane Smith', startTime: '2026-01-08T09:30:00', status: 'Pending', type: 'Follow-up' },
  { id: 3, patientId: 3, patientName: 'Michael Brown', startTime: '2026-01-08T10:00:00', status: 'InPatient', type: 'Consultation' },
  { id: 4, patientId: 4, patientName: 'Emily Wilson', startTime: '2026-01-08T10:30:00', status: 'OutPatient', type: 'General' },
  { id: 5, patientId: 5, patientName: 'David Taylor', startTime: '2026-01-08T11:00:00', status: 'Pending', type: 'Emergency' },
  { id: 6, patientId: 1, patientName: 'John Doe', startTime: '2026-01-07T14:00:00', status: 'Completed', type: 'Follow-up' },
];

export const mockVisits: Visit[] = [
  {
    visitId: 1,
    appointId: 6,
    patientId: 1,
    patientName: 'John Doe',
    examination: 'Blood pressure: 120/80, Temperature: 36.5°C, Heart rate: 72 bpm',
    history: 'Previous visit for hypertension follow-up. No new complaints.',
    diagnoses: 'Essential hypertension, controlled. No complications.',
    treatment: 'Continue current medication: Amlodipine 5mg daily',
    healthEducation: 'Advised on low sodium diet, regular exercise, stress management',
    followUpPlan: 'Return in 3 months for blood pressure check',
    endTime: '2026-01-07T14:45:00',
  },
  {
    visitId: 2,
    appointId: 1,
    patientId: 1,
    patientName: 'John Doe',
    examination: 'Blood pressure: 118/78, Temperature: 36.8°C, General wellness check',
    history: 'Routine wellness visit. Reports feeling well.',
    diagnoses: 'No acute findings. Hypertension well controlled.',
    treatment: 'Continue current treatment plan',
    healthEducation: 'Discussed importance of medication adherence',
    followUpPlan: 'Annual physical in 12 months',
    endTime: '2026-01-08T09:30:00',
  },
  {
    visitId: 3,
    appointId: 3,
    patientId: 3,
    patientName: 'Michael Brown',
    examination: 'Temperature: 38.2°C, Throat inflammation noted',
    history: 'Presents with sore throat x 3 days, fever, difficulty swallowing',
    diagnoses: 'Acute pharyngitis, likely viral origin',
    treatment: 'Paracetamol 1g PRN for fever, Throat lozenges, Increased fluids',
    healthEducation: 'Rest, hydration, when to seek emergency care',
    followUpPlan: 'Return if symptoms worsen or persist beyond 7 days',
    endTime: '2026-01-08T10:25:00',
  },
];

export const getPatientVisits = (patientId: number): Visit[] => {
  return mockVisits.filter(v => v.patientId === patientId);
};

export const getTodayAppointments = (): Appointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return mockAppointments.filter(a => a.startTime.startsWith(today) || a.startTime.startsWith('2026-01-08'));
};

export const getInPatientCount = (): number => {
  return getTodayAppointments().filter(a => a.status === 'InPatient').length;
};

export const getOutPatientCount = (): number => {
  return getTodayAppointments().filter(a => a.status === 'OutPatient').length;
};

export const getPendingCount = (): number => {
  return getTodayAppointments().filter(a => a.status === 'Pending').length;
};
