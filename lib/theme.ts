export const C = {
  pri: "#0D5E56",
  priLt: "#1A8A7D",
  priMut: "#B8D8D3",
  priFaint: "#E8F4F2",
  bg: "#FAFAF7",
  card: "#FFFFFF",
  bgAlt: "#F5F4F0",
  bgDark: "#0F2D2A",
  t1: "#1A1D1C",
  t2: "#5E6664",
  t3: "#8F9694",
  tInv: "#FAFAF7",
  ok: "#2D8659",
  okBg: "#E7F5ED",
  warn: "#C07D2B",
  warnBg: "#FEF3E2",
  err: "#C0392B",
  errBg: "#FDECEB",
  info: "#2874A6",
  infoBg: "#E8F1F8",
  uploaded: "#5B7FCC",
  extracted: "#8E6BBF",
  manual: "#C07D2B",
  generated: "#2D8659",
  encounter: "#2874A6",
  diagnosis: "#9B4D96",
  medication: "#2D8659",
  labResult: "#C07D2B",
  procedure: "#C0392B",
  imaging: "#5B7FCC",
  erVisit: "#E74C3C",
  immunization: "#27AE60",
  allergy: "#E67E22",
  brd: "#E2E0DB",
  brdLt: "#F0EFEB",
  shadow: "#0F2D2A",
} as const;

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const F = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24 } as const;
export const R = { sm: 6, md: 10, lg: 14, xl: 18, pill: 999 } as const;

export const shadow = {
  shadowColor: C.shadow,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.07,
  shadowRadius: 4,
  elevation: 2,
} as const;

const EVT_COLOR: Record<string, string> = {
  encounter: C.encounter, diagnosis: C.diagnosis,
  medication_start: C.medication, medication_stop: C.medication,
  lab_result: C.labResult, procedure: C.procedure, surgery: C.procedure,
  imaging: C.imaging, er_visit: C.erVisit, immunization: C.immunization,
  allergy: C.allergy,
};
export const eventColor = (t: string) => EVT_COLOR[t] || C.t3;

const EVT_LABEL: Record<string, string> = {
  encounter: "Visit", diagnosis: "Diagnosis",
  medication_start: "Rx Started", medication_stop: "Rx Stopped",
  lab_result: "Lab", procedure: "Procedure", surgery: "Surgery",
  imaging: "Imaging", er_visit: "ER Visit", immunization: "Vaccine",
  allergy: "Allergy",
};
export const eventLabel = (t: string) => EVT_LABEL[t] || t;

const SRC_COLOR: Record<string, string> = { uploaded: C.uploaded, extracted: C.extracted, manual: C.manual, generated: C.generated };
export const sourceColor = (s: string) => SRC_COLOR[s] || C.t3;

const SRC_LABEL: Record<string, string> = { uploaded: "Uploaded", extracted: "AI Extracted", manual: "Patient Entered", generated: "Generated" };
export const sourceLabel = (s: string) => SRC_LABEL[s] || s;
