// Raw color values for each theme — used to inject CSS custom properties
export const LIGHT_VALS = {
  pri: "#0D5E56", priLt: "#1A8A7D", priMut: "#B8D8D3", priFaint: "#E8F4F2",
  bg: "#FAFAF7", card: "#FFFFFF", bgAlt: "#F5F4F0", bgDark: "#0F2D2A",
  t1: "#1A1D1C", t2: "#5E6664", t3: "#8F9694", tInv: "#FAFAF7",
  ok: "#2D8659", okBg: "#E7F5ED",
  warn: "#C07D2B", warnBg: "#FEF3E2",
  err: "#C0392B", errBg: "#FDECEB",
  info: "#2874A6", infoBg: "#E8F1F8",
  uploaded: "#5B7FCC", extracted: "#8E6BBF", manual: "#C07D2B", generated: "#2D8659",
  encounter: "#2874A6", diagnosis: "#9B4D96", medication: "#2D8659",
  labResult: "#C07D2B", procedure: "#C0392B", imaging: "#5B7FCC",
  erVisit: "#E74C3C", immunization: "#27AE60", allergy: "#E67E22",
  brd: "#E2E0DB", brdLt: "#F0EFEB", shadow: "#0F2D2A",
} as const;

export const DARK_VALS = {
  pri: "#4DB8AF", priLt: "#6ECFC7", priMut: "#2A6B64", priFaint: "#1A3330",
  bg: "#0F1512", card: "#1A2220", bgAlt: "#161E1C", bgDark: "#0A0F0E",
  t1: "#E8EAE9", t2: "#A8B5B2", t3: "#6B7C79", tInv: "#0F1512",
  ok: "#4ACA7E", okBg: "#0F2A1A",
  warn: "#E8A94A", warnBg: "#2A1F0A",
  err: "#E05C4A", errBg: "#2A100D",
  info: "#5AABDB", infoBg: "#0A1E2A",
  uploaded: "#7899E8", extracted: "#B08BE8", manual: "#E8A94A", generated: "#4ACA7E",
  encounter: "#5AABDB", diagnosis: "#C47AC0", medication: "#4ACA7E",
  labResult: "#E8A94A", procedure: "#E05C4A", imaging: "#7899E8",
  erVisit: "#F06A58", immunization: "#4ACA7E", allergy: "#F09060",
  brd: "#2A3530", brdLt: "#1E2B28", shadow: "#000000",
} as const;

// C uses CSS custom properties (with light-mode fallbacks).
// On web, injecting :root { --so-bg: ...; } updates ALL StyleSheets instantly.
// On native the fallback value is used directly.
export const C = {
  pri:      "var(--so-pri, #0D5E56)",
  priLt:    "var(--so-priLt, #1A8A7D)",
  priMut:   "var(--so-priMut, #B8D8D3)",
  priFaint: "var(--so-priFaint, #E8F4F2)",
  bg:       "var(--so-bg, #FAFAF7)",
  card:     "var(--so-card, #FFFFFF)",
  bgAlt:    "var(--so-bgAlt, #F5F4F0)",
  bgDark:   "var(--so-bgDark, #0F2D2A)",
  t1:       "var(--so-t1, #1A1D1C)",
  t2:       "var(--so-t2, #5E6664)",
  t3:       "var(--so-t3, #8F9694)",
  tInv:     "var(--so-tInv, #FAFAF7)",
  ok:       "var(--so-ok, #2D8659)",
  okBg:     "var(--so-okBg, #E7F5ED)",
  warn:     "var(--so-warn, #C07D2B)",
  warnBg:   "var(--so-warnBg, #FEF3E2)",
  err:      "var(--so-err, #C0392B)",
  errBg:    "var(--so-errBg, #FDECEB)",
  info:     "var(--so-info, #2874A6)",
  infoBg:   "var(--so-infoBg, #E8F1F8)",
  uploaded: "var(--so-uploaded, #5B7FCC)",
  extracted:"var(--so-extracted, #8E6BBF)",
  manual:   "var(--so-manual, #C07D2B)",
  generated:"var(--so-generated, #2D8659)",
  encounter:"var(--so-encounter, #2874A6)",
  diagnosis:"var(--so-diagnosis, #9B4D96)",
  medication:"var(--so-medication, #2D8659)",
  labResult:"var(--so-labResult, #C07D2B)",
  procedure:"var(--so-procedure, #C0392B)",
  imaging:  "var(--so-imaging, #5B7FCC)",
  erVisit:  "var(--so-erVisit, #E74C3C)",
  immunization:"var(--so-immunization, #27AE60)",
  allergy:  "var(--so-allergy, #E67E22)",
  brd:      "var(--so-brd, #E2E0DB)",
  brdLt:    "var(--so-brdLt, #F0EFEB)",
  shadow:   "var(--so-shadow, #0F2D2A)",
} as const;

// Keep CD for backwards compat (used by useTheme.ts)
export const CD = DARK_VALS;

export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const F = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24 } as const;
export const R = { sm: 6, md: 10, lg: 14, xl: 18, pill: 999 } as const;

export const shadow = {
  shadowColor: "#0F2D2A",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.07,
  shadowRadius: 4,
  elevation: 2,
} as const;

// Build a CSS string of :root overrides for the given palette
export function buildThemeCSS(vals: Record<string, string>): string {
  return `:root {\n${
    Object.keys(vals).map((k) => `  --so-${k}: ${vals[k]};`).join("\n")
  }\n}`;
}

const EVT_COLOR: Record<string, string> = {
  encounter: "#2874A6", diagnosis: "#9B4D96",
  medication_start: "#2D8659", medication_stop: "#2D8659",
  lab_result: "#C07D2B", procedure: "#C0392B", surgery: "#C0392B",
  imaging: "#5B7FCC", er_visit: "#E74C3C", immunization: "#27AE60",
  allergy: "#E67E22",
};
export const eventColor = (t: string) => EVT_COLOR[t] || "#8F9694";

const EVT_LABEL: Record<string, string> = {
  encounter: "Visit", diagnosis: "Diagnosis",
  medication_start: "Rx Started", medication_stop: "Rx Stopped",
  lab_result: "Lab", procedure: "Procedure", surgery: "Surgery",
  imaging: "Imaging", er_visit: "ER Visit", immunization: "Vaccine",
  allergy: "Allergy",
};
export const eventLabel = (t: string) => EVT_LABEL[t] || t;

const SRC_COLOR: Record<string, string> = { uploaded: "#5B7FCC", extracted: "#8E6BBF", manual: "#C07D2B", generated: "#2D8659" };
export const sourceColor = (s: string) => SRC_COLOR[s] || "#8F9694";

const SRC_LABEL: Record<string, string> = { uploaded: "Uploaded", extracted: "AI Extracted", manual: "Patient Entered", generated: "Generated" };
export const sourceLabel = (s: string) => SRC_LABEL[s] || s;
