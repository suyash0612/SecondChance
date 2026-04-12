import type { MedDocument, TimelineEvent } from "./types";

// ── Return shape ──────────────────────────────────────────────────────────────
export interface ExtractionResult {
  updated: MedDocument;
  events: TimelineEvent[];
  extractionPath: "mock" | "ocr_stub";
}

// ── Classification map ────────────────────────────────────────────────────────
const EXT: Record<string, { cls: string; ev: Omit<TimelineEvent, "id" | "sourceDocId"> }> = {
  lab:   { cls: "Lab Report",       ev: { date: "", type: "lab_result",       title: "Lab Results Received",    description: "Lab panel processed.",    importance: "routine", isMilestone: false, source: "extracted", bodySystem: "general" } },
  rx:    { cls: "Prescription",     ev: { date: "", type: "medication_start", title: "New Prescription",        description: "Medication prescribed.",  importance: "notable", isMilestone: false, source: "extracted", bodySystem: "general" } },
  img:   { cls: "Imaging Report",   ev: { date: "", type: "imaging",          title: "Imaging Study",           description: "Imaging report uploaded.",importance: "notable", isMilestone: false, source: "extracted", bodySystem: "general" } },
  visit: { cls: "Progress Note",    ev: { date: "", type: "encounter",        title: "Office Visit Documented", description: "Visit note processed.",   importance: "routine", isMilestone: false, source: "extracted", bodySystem: "general" } },
  def:   { cls: "Medical Document", ev: { date: "", type: "encounter",        title: "Record Uploaded",         description: "Document stored.",        importance: "routine", isMilestone: false, source: "uploaded",  bodySystem: "general" } },
};

// ── Classifiers ───────────────────────────────────────────────────────────────
function classifyByFilename(name: string): string {
  const lo = name.toLowerCase();
  if (/lab|blood|test|result|cbc|panel/.test(lo))      return "lab";
  if (/rx|presc|med/.test(lo))                         return "rx";
  if (/mri|xray|ct|imag|radio|scan/.test(lo))         return "img";
  if (/visit|note|consult|physical|follow/.test(lo))   return "visit";
  return "def";
}

function classifyByOcrText(text: string): string {
  const lo = text.toLowerCase();
  if (/lab result|hemoglobin|cholesterol|glucose|panel|quest diagnostic/.test(lo)) return "lab";
  if (/prescription|prescribed|sig:|refill/.test(lo))                              return "rx";
  if (/mri|ct scan|x-ray|radiology|imaging|radiologist/.test(lo))                 return "img";
  if (/progress note|office visit|chief complaint|assessment|provider/.test(lo))  return "visit";
  return "def";
}

// ── OCR field parser ──────────────────────────────────────────────────────────
// Simulates structured LLM extraction using targeted regex on OCR text.
// Returns only fields successfully parsed; caller merges with safe defaults.
interface ParsedFields {
  provider?: string;
  facility?: string;
  date?: string;
  description?: string;
}

function parseOcrFields(text: string, key: string): ParsedFields {
  try {
    const out: ParsedFields = {};

    if (key === "lab") {
      // Facility: "PATIENT LAB RESULTS - <Facility>"
      const facMatch = text.match(/lab results?\s*[-–]\s*([^\n]+)/i);
      if (facMatch) out.facility = facMatch[1].trim();

      // Provider: "Ordering Physician: Dr. ..."
      const provMatch = text.match(/ordering physician[:\s]+([^\n]+)/i);
      if (provMatch) out.provider = provMatch[1].trim();

      // Labs: lines matching "<Test>: <value> <unit> HIGH|LOW"
      const labLines: string[] = [];
      for (const m of text.matchAll(/^([A-Za-z][^\n:]+):\s*([\d.]+\s*\S+)\s*(HIGH|LOW|CRITICAL)?/gim)) {
        const name = m[1].trim();
        const val  = m[2].trim();
        const flag = m[3] ? ` (${m[3]})` : "";
        if (!/patient|dob|physician|ordering/i.test(name)) {
          labLines.push(`${name}: ${val}${flag}`);
        }
      }
      if (labLines.length) out.description = labLines.join(" · ");
    }

    if (key === "visit") {
      // Facility: "PROGRESS NOTE - <Facility>"
      const facMatch = text.match(/progress note\s*[-–]\s*([^\n]+)/i);
      if (facMatch) out.facility = facMatch[1].trim();

      // Provider: "Provider: Dr. ..."
      const provMatch = text.match(/^provider[:\s]+([^\n]+)/im);
      if (provMatch) out.provider = provMatch[1].replace(/\bMD\b|\bDO\b/i, "").trim();

      // Date: "Date of Visit: MM/DD/YYYY"
      const dateMatch = text.match(/date of visit[:\s]+([\d/]+)/i);
      if (dateMatch) {
        const parts = dateMatch[1].split("/");
        if (parts.length === 3) out.date = `${parts[2]}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`;
      }

      // Description from complaint + assessment
      const complaint  = text.match(/chief complaint[:\s]+([^\n]+)/i)?.[1]?.trim();
      const assessment = text.match(/assessment[:\s]+([^\n]+)/i)?.[1]?.trim();
      const parts = [complaint, assessment].filter(Boolean);
      if (parts.length) out.description = parts.join(" — ");
    }

    return out;
  } catch {
    return {}; // silent fallback
  }
}

// ── Main extraction entry point ───────────────────────────────────────────────
export async function extractDocument(
  doc: MedDocument,
  ocrText?: string,
): Promise<ExtractionResult> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

  const today    = new Date().toISOString().split("T")[0];
  const usingOcr = Boolean(ocrText?.trim());
  const key      = usingOcr ? classifyByOcrText(ocrText!) : classifyByFilename(doc.fileName);
  const match    = EXT[key] ?? EXT["def"];
  const path: "mock" | "ocr_stub" = usingOcr ? "ocr_stub" : "mock";

  // Parsed fields (empty object when not OCR or parsing yields nothing)
  const parsed = usingOcr ? parseOcrFields(ocrText!, key) : {};

  return {
    extractionPath: path,
    updated: {
      ...doc,
      classification:    match.cls,
      extractionStatus:  "completed",
      extractedDate:     parsed.date     ?? today,
      extractedProvider: parsed.provider ?? "Provider (extracted)",
      extractedFacility: parsed.facility ?? "Facility (extracted)",
      extractionPath:    path,
    },
    events: [
      {
        ...match.ev,
        date:        today,
        id:          `tl-${Date.now()}`,
        sourceDocId: doc.id,
        ...(parsed.description ? { description: parsed.description } : {}),
        ...(parsed.provider    ? { provider:    parsed.provider }    : {}),
        ...(parsed.facility    ? { facility:    parsed.facility }    : {}),
      },
    ],
  };
}
