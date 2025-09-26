export interface Patient {
  id: string;
  uhid: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  contactNumber: string;
  email: string;
  address: string;
  abhaId?: string;
  patientType: "OPD" | "IPD" | "Emergency";
  visitType: "Appointment" | "Walk-in";
  paymentMethod: "Cash" | "Card" | "Insurance" | "Online";
  consultationPackage: string;
  preferredLanguage: string;
  doctorAssigned: string;
  chronicConditions: string[];
  waitTime?: number;
  status: "Waiting" | "In Progress" | "Completed";
  createdAt: any;
  token: string;
}

export interface Vitals {
  patientId: string;
  weight: number;
  height: number;
  bmi: number;
  pulse: number;
  bloodPressure: string;
  temperature: number;
  spo2: number;
  respiratoryRate: number;
  riskFlags: {
    diabetes: boolean;
    heartDisease: boolean;
    kidney: boolean;
  };
  recordedAt: string;
  recordedBy: string;
}

export interface VitalsState {
  weight: string;
  height: string;
  bmi: string;
  pulse: string;
  bloodPressure: string;
  temperature: string;
  spo2: string;
  respiratoryRate: string;
  riskFlags: {
    diabetes: boolean;
    heartDisease: boolean;
    kidney: boolean;
  };
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  symptoms: string[];
  duration: string;
  aggravatingFactors: string[];
  examination: {
    general: string[];
    systemic: string[];
  };
  investigations: string[];
  diagnosis: string;
  prescriptions: Prescription[];
  advice: string[];
  followUp?: {
    duration: number;
    unit: "Days" | "Months" | "Years";
  };
  createdAt: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Payment {
  id: string;
  patientId: string;
  uhid: string;
  services: string[];
  amount: number;
  paymentMode: "Cash" | "Card" | "Insurance" | "Online";
  status: "Paid" | "Pending" | "Partial";
  date: string;
}

export interface Analytics {
  dailyAppointments: number;
  totalPatients: number;
  completedConsultations: number;
  pendingPayments: number;
  topSymptoms: { name: string; count: number }[];
  topDiagnoses: { name: string; count: number }[];
  topMedications: { name: string; count: number }[];
  labTests: { name: string; count: number }[];
  revenue: {
    today: number;
    thisMonth: number;
    trend: number;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export type NavigationItem =
  | "dashboard"
  | "registration"
  | "queue"
  | "vitals"
  | "doctor"
  | "prescription"
  | "pharmacy"
  | "billing"
  | "analytics";
