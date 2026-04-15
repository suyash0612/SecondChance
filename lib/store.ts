import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Patient, MedDocument, Medication, Condition, Allergy,
  LabResult, Encounter, TimelineEvent, DoctorSummary, FilterCategory,
  AuthUser, Account, Vital, Appointment, DarkModePref,
} from "./types";
export { extractDocument as mockExtract } from "./extract";

// ════════════════════════════════════════════════════════════════
//  SEED DATA
// ════════════════════════════════════════════════════════════════

const PAT: Patient = {
  id: "p1", firstName: "Maria", lastName: "Santos",
  dateOfBirth: "1978-03-15", sex: "Female",
  bloodType: "O+",
  phone: "(555) 014-2389", email: "maria.santos@email.com",
  emergencyContact: { name: "Carlos Santos", phone: "(555) 014-2390", relationship: "Spouse" },
  insurance: "Blue Cross Blue Shield", memberId: "XYZ-12345678",
};

const DOCS: MedDocument[] = [
  { id: "d1", fileName: "annual_physical_2025.pdf", mimeType: "application/pdf", uploadedAt: "2025-11-02T09:30:00Z", classification: "Progress Note", extractionStatus: "completed", pages: 3, extractedDate: "2025-10-28", extractedProvider: "Dr. Sarah Chen", extractedFacility: "Downtown Family Medicine" },
  { id: "d2", fileName: "blood_work_oct2025.pdf", mimeType: "application/pdf", uploadedAt: "2025-11-01T14:15:00Z", classification: "Lab Report", extractionStatus: "completed", pages: 2, extractedDate: "2025-10-15", extractedProvider: "Dr. Sarah Chen", extractedFacility: "Quest Diagnostics" },
  { id: "d3", fileName: "cardiology_consult.pdf", mimeType: "application/pdf", uploadedAt: "2025-09-20T11:00:00Z", classification: "Consult Note", extractionStatus: "completed", pages: 4, extractedDate: "2025-09-15", extractedProvider: "Dr. James Miller", extractedFacility: "Mercy Heart Center" },
  { id: "d4", fileName: "mri_lumbar_spine.pdf", mimeType: "application/pdf", uploadedAt: "2024-09-10T16:45:00Z", classification: "Imaging Report", extractionStatus: "completed", pages: 2, extractedDate: "2024-09-06", extractedProvider: "Dr. Lisa Wong", extractedFacility: "Mercy General Radiology" },
  { id: "d5", fileName: "er_visit_back_pain.pdf", mimeType: "application/pdf", uploadedAt: "2024-09-08T10:20:00Z", classification: "Discharge Summary", extractionStatus: "completed", pages: 3, extractedDate: "2024-09-05", extractedProvider: "Dr. Robert Kim", extractedFacility: "Mercy General ER" },
  { id: "d6", fileName: "endocrinology_followup.pdf", mimeType: "application/pdf", uploadedAt: "2025-10-22T09:00:00Z", classification: "Progress Note", extractionStatus: "completed", pages: 2, extractedDate: "2025-10-20", extractedProvider: "Dr. Aisha Patel", extractedFacility: "Mercy Endocrine Clinic" },
];

const MEDS: Medication[] = [
  { id: "m1", name: "Metformin", dosage: "500mg", frequency: "Twice daily", status: "active", startDate: "2021-06-15", prescriber: "Dr. Aisha Patel", reason: "Type 2 Diabetes", source: "extracted", sourceDocId: "d6", confidence: 0.95 },
  { id: "m2", name: "Lisinopril", dosage: "10mg", frequency: "Once daily", status: "active", startDate: "2020-03-22", prescriber: "Dr. James Miller", reason: "Hypertension", source: "extracted", sourceDocId: "d3", confidence: 0.92 },
  { id: "m3", name: "Atorvastatin", dosage: "20mg", frequency: "At bedtime", status: "active", startDate: "2022-01-10", prescriber: "Dr. Sarah Chen", reason: "High cholesterol", source: "manual", confidence: 1.0 },
  { id: "m4", name: "Ibuprofen", dosage: "400mg", frequency: "As needed", status: "discontinued", startDate: "2024-09-05", endDate: "2024-11-15", prescriber: "Dr. Robert Kim", reason: "Back pain", source: "extracted", sourceDocId: "d5", confidence: 0.88 },
];

const CONDS: Condition[] = [
  { id: "c1", name: "Type 2 Diabetes Mellitus", icd10: "E11.9", status: "managed", onsetDate: "2021-06", diagnosedBy: "Dr. Aisha Patel", source: "extracted", sourceDocId: "d6", confidence: 0.97 },
  { id: "c2", name: "Essential Hypertension", icd10: "I10", status: "managed", onsetDate: "2020-03", diagnosedBy: "Dr. James Miller", source: "extracted", sourceDocId: "d3", confidence: 0.96 },
  { id: "c3", name: "Hyperlipidemia", icd10: "E78.5", status: "managed", onsetDate: "2022-01", diagnosedBy: "Dr. Sarah Chen", source: "extracted", sourceDocId: "d1", confidence: 0.91 },
  { id: "c4", name: "Low Back Pain", icd10: "M54.5", status: "resolved", onsetDate: "2024-08", resolvedDate: "2024-12", diagnosedBy: "Dr. Robert Kim", source: "extracted", sourceDocId: "d5", confidence: 0.82 },
];

const ALRG: Allergy[] = [
  { id: "a1", substance: "Penicillin", reaction: "Hives, throat swelling", severity: "severe", source: "manual" },
  { id: "a2", substance: "Sulfa drugs", reaction: "Rash", severity: "moderate", source: "extracted", sourceDocId: "d1" },
];

const LABS: LabResult[] = [
  { id: "l1", testName: "Hemoglobin A1c", value: "7.2", unit: "%", refLow: 4.0, refHigh: 5.6, flag: "high", date: "2025-10-15", provider: "Dr. Aisha Patel", source: "extracted", sourceDocId: "d2", confidence: 0.94 },
  { id: "l2", testName: "Hemoglobin A1c", value: "7.8", unit: "%", refLow: 4.0, refHigh: 5.6, flag: "high", date: "2025-04-10", provider: "Dr. Aisha Patel", source: "extracted", sourceDocId: "d2", confidence: 0.93 },
  { id: "l3", testName: "LDL Cholesterol", value: "142", unit: "mg/dL", refLow: 0, refHigh: 100, flag: "high", date: "2025-10-15", provider: "Dr. Sarah Chen", source: "extracted", sourceDocId: "d2", confidence: 0.96 },
  { id: "l4", testName: "Creatinine", value: "0.9", unit: "mg/dL", refLow: 0.6, refHigh: 1.2, flag: "normal", date: "2025-10-15", provider: "Dr. Sarah Chen", source: "extracted", sourceDocId: "d2", confidence: 0.98 },
  { id: "l5", testName: "TSH", value: "2.1", unit: "mIU/L", refLow: 0.4, refHigh: 4.0, flag: "normal", date: "2025-10-15", provider: "Dr. Sarah Chen", source: "extracted", sourceDocId: "d2", confidence: 0.97 },
  { id: "l6", testName: "Fasting Glucose", value: "138", unit: "mg/dL", refLow: 70, refHigh: 100, flag: "high", date: "2025-10-15", provider: "Dr. Sarah Chen", source: "extracted", sourceDocId: "d2", confidence: 0.95 },
];

const ENCS: Encounter[] = [
  { id: "e1", date: "2025-10-28", type: "office_visit", complaint: "Annual physical", summary: "Routine exam. BP 134/86. Discussed statin adjustment for LDL.", provider: "Dr. Sarah Chen", facility: "Downtown Family Medicine", source: "extracted", sourceDocId: "d1" },
  { id: "e2", date: "2025-10-20", type: "office_visit", complaint: "Diabetes follow-up", summary: "A1c improved 7.8→7.2. Continue metformin.", provider: "Dr. Aisha Patel", facility: "Mercy Endocrine Clinic", source: "extracted", sourceDocId: "d6" },
  { id: "e3", date: "2025-09-15", type: "office_visit", complaint: "Cardiology consult", summary: "BP at target on lisinopril. Echo normal.", provider: "Dr. James Miller", facility: "Mercy Heart Center", source: "extracted", sourceDocId: "d3" },
  { id: "e4", date: "2024-09-06", type: "imaging", complaint: "Lumbar MRI", summary: "Mild L4-L5 disc bulge, no stenosis.", provider: "Dr. Lisa Wong", facility: "Mercy General Radiology", source: "extracted", sourceDocId: "d4" },
  { id: "e5", date: "2024-09-05", type: "er", complaint: "Severe back pain", summary: "Acute low back pain. No neuro deficits. Discharged with ibuprofen.", provider: "Dr. Robert Kim", facility: "Mercy General ER", source: "extracted", sourceDocId: "d5" },
];

const TL: TimelineEvent[] = [
  { id: "t01", date: "2025-10-28", type: "encounter", title: "Annual Physical — Dr. Chen", description: "Routine exam. BP 134/86. Statin adjustment discussed.", importance: "routine", isMilestone: false, source: "extracted", sourceDocId: "d1", provider: "Dr. Sarah Chen", facility: "Downtown Family Medicine", bodySystem: "general" },
  { id: "t02", date: "2025-10-20", type: "encounter", title: "Diabetes Follow-Up", description: "A1c improved 7.8→7.2%. Continue current regimen.", importance: "notable", isMilestone: false, source: "extracted", sourceDocId: "d6", provider: "Dr. Aisha Patel", facility: "Mercy Endocrine Clinic", bodySystem: "endocrine" },
  { id: "t03", date: "2025-10-15", type: "lab_result", title: "A1c: 7.2% (Improving)", description: "Down from 7.8%. Still above target 4.0–5.6%.", importance: "notable", isMilestone: false, source: "extracted", sourceDocId: "d2", bodySystem: "endocrine", meta: { value: "7.2%", flag: "high" } },
  { id: "t04", date: "2025-10-15", type: "lab_result", title: "LDL: 142 mg/dL (High)", description: "Above target <100. Statin adjustment discussed.", importance: "significant", isMilestone: false, source: "extracted", sourceDocId: "d2", bodySystem: "cardiovascular" },
  { id: "t05", date: "2025-10-15", type: "lab_result", title: "Fasting Glucose: 138 mg/dL", description: "Elevated. Normal range 70–100.", importance: "notable", isMilestone: false, source: "extracted", sourceDocId: "d2", bodySystem: "endocrine" },
  { id: "t06", date: "2025-09-15", type: "encounter", title: "Cardiology Consult", description: "BP management review. Echo normal. Continue lisinopril.", importance: "notable", isMilestone: false, source: "extracted", sourceDocId: "d3", provider: "Dr. James Miller", facility: "Mercy Heart Center", bodySystem: "cardiovascular" },
  { id: "t07", date: "2025-04-10", type: "lab_result", title: "A1c: 7.8% (High)", description: "Above target. Led to treatment review.", importance: "significant", isMilestone: false, source: "extracted", sourceDocId: "d2", bodySystem: "endocrine" },
  { id: "t08", date: "2024-09-06", type: "imaging", title: "Lumbar MRI — Mild Disc Bulge", description: "L4-L5 disc bulge, no stenosis.", importance: "notable", isMilestone: false, source: "extracted", sourceDocId: "d4", provider: "Dr. Lisa Wong", bodySystem: "musculoskeletal" },
  { id: "t09", date: "2024-09-05", type: "er_visit", title: "ER Visit — Severe Back Pain", description: "Acute low back pain, unable to walk. Discharged with ibuprofen.", importance: "critical", isMilestone: true, source: "extracted", sourceDocId: "d5", provider: "Dr. Robert Kim", facility: "Mercy General ER", bodySystem: "musculoskeletal" },
  { id: "t10", date: "2022-01-10", type: "medication_start", title: "Started Atorvastatin 20mg", description: "Statin initiated for hyperlipidemia.", importance: "notable", isMilestone: false, source: "manual", bodySystem: "cardiovascular", provider: "Dr. Sarah Chen" },
  { id: "t11", date: "2022-01-05", type: "diagnosis", title: "Diagnosed: Hyperlipidemia", description: "E78.5 — Based on lipid panel.", importance: "significant", isMilestone: true, source: "extracted", sourceDocId: "d1", bodySystem: "cardiovascular", provider: "Dr. Sarah Chen" },
  { id: "t12", date: "2021-06-15", type: "medication_start", title: "Started Metformin 500mg", description: "Initiated for Type 2 Diabetes.", importance: "notable", isMilestone: false, source: "extracted", bodySystem: "endocrine", provider: "Dr. Aisha Patel" },
  { id: "t13", date: "2021-06-01", type: "diagnosis", title: "Diagnosed: Type 2 Diabetes", description: "E11.9 — Started on metformin.", importance: "critical", isMilestone: true, source: "extracted", bodySystem: "endocrine", provider: "Dr. Aisha Patel" },
  { id: "t14", date: "2020-03-22", type: "medication_start", title: "Started Lisinopril 10mg", description: "ACE inhibitor for blood pressure.", importance: "notable", isMilestone: false, source: "extracted", bodySystem: "cardiovascular", provider: "Dr. James Miller" },
  { id: "t15", date: "2020-03-15", type: "diagnosis", title: "Diagnosed: Hypertension", description: "I10 — Started on lisinopril.", importance: "significant", isMilestone: true, source: "extracted", bodySystem: "cardiovascular", provider: "Dr. James Miller" },
];

const VITALS_DEMO: Vital[] = [
  { id: "v1", type: "bp", value: "134", value2: "86", unit: "mmHg", date: "2025-10-28", note: "After annual physical" },
  { id: "v2", type: "bp", value: "128", value2: "82", unit: "mmHg", date: "2025-10-15" },
  { id: "v3", type: "bp", value: "136", value2: "88", unit: "mmHg", date: "2025-09-15" },
  { id: "v4", type: "glucose", value: "138", unit: "mg/dL", date: "2025-10-15", note: "Fasting" },
  { id: "v5", type: "glucose", value: "145", unit: "mg/dL", date: "2025-09-20", note: "Fasting" },
  { id: "v6", type: "hr", value: "72", unit: "bpm", date: "2025-10-28" },
  { id: "v7", type: "weight", value: "168", unit: "lbs", date: "2025-10-28" },
  { id: "v8", type: "weight", value: "171", unit: "lbs", date: "2025-09-15" },
];

const APPTS_DEMO: Appointment[] = [
  { id: "ap1", date: "2026-05-12", time: "10:30", provider: "Dr. Aisha Patel", specialty: "Endocrinology", facility: "Mercy Endocrine Clinic", reason: "Diabetes 6-month follow-up", status: "upcoming" },
  { id: "ap2", date: "2026-06-03", time: "14:00", provider: "Dr. Sarah Chen", specialty: "Primary Care", facility: "Downtown Family Medicine", reason: "Annual wellness visit", status: "upcoming" },
  { id: "ap3", date: "2025-10-28", time: "09:00", provider: "Dr. Sarah Chen", specialty: "Primary Care", facility: "Downtown Family Medicine", reason: "Annual physical", status: "completed" },
];

const DISCLAIMER = "Auto-generated from patient-uploaded records by Second Opinion. Not medical advice. Verify with your clinician.";

const sortTL = (a: TimelineEvent[]) => [...a].sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());

// ── Demo account (pre-seeded) ─────────────────────────────────────────────────
const DEMO_ACCOUNT: Account = {
  email: "maria.santos@email.com",
  password: "demo1234",
  patient: PAT,
  docs: DOCS,
  meds: MEDS,
  conditions: CONDS,
  allergies: ALRG,
  labs: LABS,
  encounters: ENCS,
  timeline: sortTL(TL),
  vitals: VITALS_DEMO,
  appointments: APPTS_DEMO,
  hasSeenOnboarding: true,
};

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function makeSummary(s: Pick<Store, "conditions" | "meds" | "allergies" | "labs" | "encounters">): DoctorSummary {
  return {
    id: `s-${Date.now()}`, generatedAt: new Date().toISOString(),
    visitProvider: "Dr. James Miller", visitSpecialty: "Cardiology",
    visitReason: "Blood pressure management, elevated LDL follow-up",
    conditions: s.conditions.filter((c) => c.status !== "resolved").map((c) => ({ name: c.name, onset: c.onsetDate, docId: c.sourceDocId })),
    medications: s.meds.filter((m) => m.status === "active").map((m) => ({ name: m.name, dosage: m.dosage, freq: m.frequency, reason: m.reason, docId: m.sourceDocId })),
    allergies: s.allergies.map((a) => ({ substance: a.substance, reaction: a.reaction, severity: a.severity })),
    abnormalLabs: s.labs.filter((l) => l.flag !== "normal").slice(0, 5).map((l) => ({ test: l.testName, value: l.value, unit: l.unit, range: l.refLow != null && l.refHigh != null ? `${l.refLow}–${l.refHigh} ${l.unit}` : "", date: fmtDate(l.date), docId: l.sourceDocId })),
    encounters: s.encounters.slice(0, 3).map((e) => ({ date: fmtDate(e.date), type: e.type === "office_visit" ? "Office Visit" : e.type, provider: e.provider, summary: e.summary, docId: e.sourceDocId })),
    procedures: [{ name: "Lumbar MRI", date: "Sep 6, 2024", docId: "d4" }, { name: "Echocardiogram", date: "Sep 15, 2025", docId: "d3" }],
    questions: ["Should I increase my statin dose for LDL?", "Is my blood pressure well-controlled?", "Do I need additional cardiac screening?"],
    gaps: ["No diabetic eye exam documented", "No records from PCP prior to 2020", "Limited lipid trend data"],
    disclaimer: DISCLAIMER,
  };
}

// ════════════════════════════════════════════════════════════════
//  STORE
// ════════════════════════════════════════════════════════════════

interface Store {
  // Auth
  authUser: AuthUser | null;
  accounts: Account[];
  login: (email: string, password: string) => boolean;
  signup: (data: { firstName: string; lastName: string; email: string; password: string; dateOfBirth: string; sex: string; phone: string }) => boolean;
  logout: () => void;
  markOnboardingSeen: () => void;

  // Patient data
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
  summary: DoctorSummary | null;
  filter: FilterCategory;
  search: string;
  darkMode: DarkModePref;

  // Actions
  loadDemo: () => void;
  addDoc: (d: MedDocument) => void;
  replaceDoc: (id: string, d: MedDocument) => void;
  deleteDoc: (id: string) => void;
  addEvents: (e: TimelineEvent[]) => void;
  addMeds: (m: Medication[]) => void;
  addConditions: (c: Condition[]) => void;
  addAllergies: (a: Allergy[]) => void;
  addLabs: (l: LabResult[]) => void;
  addEncounters: (e: Encounter[]) => void;

  // Manual CRUD
  addMedManual: (m: Omit<Medication, "id" | "source" | "confidence">) => void;
  deleteMed: (id: string) => void;
  addConditionManual: (c: Omit<Condition, "id" | "source" | "confidence">) => void;
  deleteCondition: (id: string) => void;
  addAllergyManual: (a: Omit<Allergy, "id" | "source">) => void;
  deleteAllergy: (id: string) => void;

  // Vitals
  addVital: (v: Omit<Vital, "id">) => void;
  deleteVital: (id: string) => void;

  // Appointments
  addAppointment: (a: Omit<Appointment, "id">) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  // Settings
  setDarkMode: (pref: DarkModePref) => void;
  setFilter: (f: FilterCategory) => void;
  setSearch: (s: string) => void;
  genSummary: () => void;
  filtered: () => TimelineEvent[];
}

function syncAccount(s: { authUser: AuthUser | null; accounts: Account[] }, patch: Partial<Account>): Account[] {
  if (!s.authUser) return s.accounts;
  return s.accounts.map((acc) =>
    acc.email === s.authUser!.email ? { ...acc, ...patch } : acc,
  );
}

const EMPTY_PATIENT: Patient = {
  id: "", firstName: "", lastName: "", dateOfBirth: "", sex: "", phone: "", email: "",
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Auth state
      authUser: null,
      accounts: [DEMO_ACCOUNT],

      login: (email, password) => {
        const acc = get().accounts.find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
        );
        if (!acc) return false;
        set({
          authUser: { email: acc.email },
          patient: acc.patient,
          docs: acc.docs,
          meds: acc.meds,
          conditions: acc.conditions,
          allergies: acc.allergies,
          labs: acc.labs,
          encounters: acc.encounters,
          timeline: acc.timeline,
          vitals: acc.vitals ?? [],
          appointments: acc.appointments ?? [],
          summary: null,
        });
        return true;
      },

      signup: (data) => {
        const exists = get().accounts.find((a) => a.email.toLowerCase() === data.email.toLowerCase());
        if (exists) return false;
        const newPatient: Patient = {
          id: `p-${Date.now()}`,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          sex: data.sex,
          phone: data.phone,
          email: data.email,
        };
        const newAccount: Account = {
          email: data.email,
          password: data.password,
          patient: newPatient,
          docs: [], meds: [], conditions: [], allergies: [], labs: [], encounters: [], timeline: [],
          vitals: [], appointments: [], hasSeenOnboarding: false,
        };
        set((s) => ({
          accounts: [...s.accounts, newAccount],
          authUser: { email: data.email },
          patient: newPatient,
          docs: [], meds: [], conditions: [], allergies: [], labs: [], encounters: [], timeline: [],
          vitals: [], appointments: [],
          summary: null,
        }));
        return true;
      },

      logout: () => set({
        authUser: null,
        patient: EMPTY_PATIENT,
        docs: [], meds: [], conditions: [], allergies: [], labs: [], encounters: [], timeline: [],
        vitals: [], appointments: [],
        summary: null,
      }),

      markOnboardingSeen: () => set((s) => ({
        accounts: syncAccount(s, { hasSeenOnboarding: true }),
      })),

      // Patient data
      patient: EMPTY_PATIENT, docs: [], meds: [], conditions: [], allergies: [],
      labs: [], encounters: [], timeline: [], vitals: [], appointments: [], summary: null,
      filter: "all", search: "", darkMode: "system",

      loadDemo: () => set({
        patient: PAT, docs: DOCS, meds: MEDS, conditions: CONDS,
        allergies: ALRG, labs: LABS, encounters: ENCS,
        timeline: sortTL(TL), vitals: VITALS_DEMO, appointments: APPTS_DEMO,
        summary: makeSummary({ conditions: CONDS, meds: MEDS, allergies: ALRG, labs: LABS, encounters: ENCS }),
      }),

      addDoc: (d) => set((s) => {
        const docs = [d, ...s.docs];
        return { docs, accounts: syncAccount(s, { docs }) };
      }),
      replaceDoc: (id, d) => set((s) => {
        const docs = s.docs.map((x) => x.id === id ? d : x);
        return { docs, accounts: syncAccount(s, { docs }) };
      }),
      deleteDoc: (id) => set((s) => {
        const docs = s.docs.filter((d) => d.id !== id);
        return { docs, accounts: syncAccount(s, { docs }) };
      }),
      addEvents: (e) => set((s) => {
        const timeline = sortTL([...e, ...s.timeline]);
        return { timeline, accounts: syncAccount(s, { timeline }) };
      }),
      addMeds: (m) => set((s) => {
        const meds = [...m, ...s.meds];
        return { meds, accounts: syncAccount(s, { meds }) };
      }),
      addConditions: (c) => set((s) => {
        const conditions = [...c, ...s.conditions];
        return { conditions, accounts: syncAccount(s, { conditions }) };
      }),
      addAllergies: (a) => set((s) => {
        const allergies = [...a, ...s.allergies];
        return { allergies, accounts: syncAccount(s, { allergies }) };
      }),
      addLabs: (l) => set((s) => {
        const labs = [...l, ...s.labs];
        return { labs, accounts: syncAccount(s, { labs }) };
      }),
      addEncounters: (e) => set((s) => {
        const encounters = [...e, ...s.encounters];
        return { encounters, accounts: syncAccount(s, { encounters }) };
      }),

      // Manual CRUD
      addMedManual: (m) => set((s) => {
        const med: Medication = { ...m, id: `m-${Date.now()}`, source: "manual", confidence: 1.0 };
        const meds = [med, ...s.meds];
        return { meds, accounts: syncAccount(s, { meds }) };
      }),
      deleteMed: (id) => set((s) => {
        const meds = s.meds.filter((m) => m.id !== id);
        return { meds, accounts: syncAccount(s, { meds }) };
      }),
      addConditionManual: (c) => set((s) => {
        const cond: Condition = { ...c, id: `c-${Date.now()}`, source: "manual", confidence: 1.0 };
        const conditions = [cond, ...s.conditions];
        return { conditions, accounts: syncAccount(s, { conditions }) };
      }),
      deleteCondition: (id) => set((s) => {
        const conditions = s.conditions.filter((c) => c.id !== id);
        return { conditions, accounts: syncAccount(s, { conditions }) };
      }),
      addAllergyManual: (a) => set((s) => {
        const allergy: Allergy = { ...a, id: `a-${Date.now()}`, source: "manual" };
        const allergies = [allergy, ...s.allergies];
        return { allergies, accounts: syncAccount(s, { allergies }) };
      }),
      deleteAllergy: (id) => set((s) => {
        const allergies = s.allergies.filter((a) => a.id !== id);
        return { allergies, accounts: syncAccount(s, { allergies }) };
      }),

      // Vitals
      addVital: (v) => set((s) => {
        const vital: Vital = { ...v, id: `v-${Date.now()}` };
        const vitals = [vital, ...s.vitals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { vitals, accounts: syncAccount(s, { vitals }) };
      }),
      deleteVital: (id) => set((s) => {
        const vitals = s.vitals.filter((v) => v.id !== id);
        return { vitals, accounts: syncAccount(s, { vitals }) };
      }),

      // Appointments
      addAppointment: (a) => set((s) => {
        const appt: Appointment = { ...a, id: `ap-${Date.now()}` };
        const appointments = [...s.appointments, appt].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return { appointments, accounts: syncAccount(s, { appointments }) };
      }),
      updateAppointment: (id, patch) => set((s) => {
        const appointments = s.appointments.map((a) => a.id === id ? { ...a, ...patch } : a);
        return { appointments, accounts: syncAccount(s, { appointments }) };
      }),
      deleteAppointment: (id) => set((s) => {
        const appointments = s.appointments.filter((a) => a.id !== id);
        return { appointments, accounts: syncAccount(s, { appointments }) };
      }),

      setDarkMode: (pref) => set({ darkMode: pref }),
      setFilter: (f) => set({ filter: f }),
      setSearch: (s) => set({ search: s }),

      genSummary: () => { const s = get(); set({ summary: makeSummary(s) }); },

      filtered: () => {
        const { timeline, filter, search } = get();
        let r = timeline;
        if (filter !== "all") {
          const map: Record<string, string[]> = {
            visits: ["encounter", "er_visit"], diagnoses: ["diagnosis"],
            medications: ["medication_start", "medication_stop"],
            labs: ["lab_result"], procedures: ["procedure", "surgery"], imaging: ["imaging"],
          };
          r = r.filter((e) => (map[filter] || []).includes(e.type));
        }
        if (search) {
          const q = search.toLowerCase();
          r = r.filter((e) => e.title.toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q) || (e.provider || "").toLowerCase().includes(q));
        }
        return r;
      },
    }),
    {
      name: "second-opinion-v1",
      storage: createJSONStorage(() => {
        // Use localStorage on web, fallback to memory on native
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage;
        }
        // In-memory fallback
        const mem: Record<string, string> = {};
        return { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; }, removeItem: (k) => { delete mem[k]; } };
      }),
      partialize: (state) => ({
        authUser: state.authUser,
        accounts: state.accounts,
        patient: state.patient,
        docs: state.docs,
        meds: state.meds,
        conditions: state.conditions,
        allergies: state.allergies,
        labs: state.labs,
        encounters: state.encounters,
        timeline: state.timeline,
        vitals: state.vitals,
        appointments: state.appointments,
        darkMode: state.darkMode,
      }),
    }
  )
);
