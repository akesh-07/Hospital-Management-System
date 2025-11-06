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

// UPDATED: Vitals interface now includes all assessment fields as strings to match Firestore structure
export interface Vitals {
  patientId: string;
  patientUhid: string; // ADDED: To support querying by UHID
  weight: string;
  height: string;
  bmi: string;
  pulse: string;
  bpSystolic: string;
  bpDiastolic: string;
  temperature: string;
  spo2: string;
  respiratoryRate: string;
  painScore: string;
  gcsE: string;
  gcsV: string;
  gcsM: string;
  map: string;
  riskFlags: {
    diabetes: boolean;
    heartDisease: boolean;
    kidney: boolean;
  };
  recordedAt: any;
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

// --- NEW/UPDATED TYPES FOR PRE-OPD CHECKLIST ---

export interface MedicationDetails {
  id: string;
  name: string; // Medication Name (Generic/Brand)
  dose: string; // e.g., "500 mg", "10 u"
  frequency: string; // e.g., "OD", "BD", "TDS"
  route: string; // e.g., "Oral", "SC", "Inhaled"
  duration: { years: number; months: number } | "Unknown";
  compliance: string; // e.g., "Taking", "Missed"
  notes: string; // short text <= 160 chars
}

export interface ChronicCondition {
  id: string;
  name: string; // Condition Name (select+typeahead)
  duration: { years: number; months: number } | "Unknown";
  onMedication: "Yes" | "No" | "Unknown";
  medications: MedicationDetails[];
}

export interface Complaint {
  id: string;
  complaint: string; // Complaint (select+typeahead)
  severity: "Mild" | "Moderate" | "Severe" | string; // enum
  duration: { value: string; unit: "h" | "d" | "w" | "mo" | "yr" | "Unknown" }; // structured: value + unit
  specialty: string; // auto-derived
  redFlagTriggered: boolean; // auto
}

export interface Allergy {
  hasAllergies: boolean; // toggle (Default No)
  type: ("Drug" | "Food" | "Other")[]; // multi-select chips
  substance: string; // text/autosuggest
  reaction: string; // short text <= 160 chars
  severity: "Mild" | "Moderate" | "Severe" | string; // enum
}

export interface PastHistory {
  illnesses: string[]; // short list (max 5)
  surgeries: { name: string; year: string }[]; // short list (max 5) with year
  hospitalizations: { reason: string; year: string }[]; // short list (max 5) with year
  currentMedications: MedicationDetails[]; // table
  overallCompliance: "Compliant" | "Missed" | "Ran out" | "Unknown" | string; // enum
}

export interface PreOPDIntakeData {
  complaints: Complaint[];
  chronicConditions: ChronicCondition[];
  allergies: Allergy;
  pastHistory: PastHistory;
}

// Keeping original consultation/prescription for other modules
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
