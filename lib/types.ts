export type Source = "uploaded" | "extracted" | "manual" | "generated";

export interface AuthUser {
  email: string;
}

export interface Account {
  email: string;
  password: string;
  patient: Patient;
  docs: MedDocument[];
  meds: Medication[];
  conditions: Condition[];
  allergies: Allergy[];
  labs: LabResult[];
  encounters: Encounter[];
  timeline: TimelineEvent[];
  vitals: Vital[];
  appointments: Appointment[];
  hasSeenOnboarding?: boolean;
}
export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";
export type Importance = "routine" | "notable" | "significant" | "critical";
export type AbnormalFlag = "normal" | "low" | "high" | "critical_low" | "critical_high";
export type FilterCategory = "all" | "visits" | "diagnoses" | "medications" | "labs" | "procedures" | "imaging";
export type VitalType = "bp" | "hr" | "weight" | "glucose" | "temp" | "spo2";
export type DarkModePref = "system" | "light" | "dark";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  phone: string;
  email: string;
  bloodType?: string;
  emergencyContact?: { name: string; phone: string; relationship: string };
  insurance?: string;
  memberId?: string;
}

export interface MedDocument {
  id: string;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
  classification: string;
  extractionStatus: ExtractionStatus;
  pages?: number;
  extractedDate?: string;
  extractedProvider?: string;
  extractedFacility?: string;
  extractionPath?: "mock" | "ocr_stub";
  fileUri?: string; // blob URL for in-app viewer
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  status: "active" | "discontinued";
  startDate: string;
  endDate?: string;
  prescriber?: string;
  reason?: string;
  source: Source;
  sourceDocId?: string;
  confidence: number;
  reminderTime?: string; // "08:00" format
}

export interface Condition {
  id: string;
  name: string;
  icd10?: string;
  status: "active" | "resolved" | "managed";
  onsetDate?: string;
  resolvedDate?: string;
  diagnosedBy?: string;
  source: Source;
  sourceDocId?: string;
  confidence: number;
}

export interface Allergy {
  id: string;
  substance: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe";
  source: Source;
  sourceDocId?: string;
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  unit: string;
  refLow?: number;
  refHigh?: number;
  flag: AbnormalFlag;
  date: string;
  provider?: string;
  source: Source;
  sourceDocId?: string;
  confidence: number;
}

export interface Encounter {
  id: string;
  date: string;
  type: string;
  complaint?: string;
  summary?: string;
  provider?: string;
  facility?: string;
  source: Source;
  sourceDocId?: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  description?: string;
  importance: Importance;
  isMilestone: boolean;
  source: Source;
  sourceDocId?: string;
  provider?: string;
  facility?: string;
  bodySystem?: string;
  meta?: Record<string, string>;
}

export interface Vital {
  id: string;
  type: VitalType;
  value: string;
  value2?: string; // diastolic for BP
  unit: string;
  date: string;
  time?: string;
  note?: string;
}

export interface Appointment {
  id: string;
  date: string;
  time?: string;
  provider: string;
  specialty?: string;
  facility?: string;
  reason: string;
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
}

export interface DoctorSummary {
  id: string;
  generatedAt: string;
  visitProvider?: string;
  visitSpecialty?: string;
  visitReason?: string;
  conditions: { name: string; onset?: string; docId?: string }[];
  medications: { name: string; dosage: string; freq: string; reason?: string; docId?: string }[];
  allergies: { substance: string; reaction: string; severity: string }[];
  abnormalLabs: { test: string; value: string; unit: string; range: string; date: string; docId?: string }[];
  encounters: { date: string; type: string; provider?: string; summary?: string; docId?: string }[];
  procedures: { name: string; date: string; docId?: string }[];
  questions: string[];
  gaps: string[];
  disclaimer: string;
}
