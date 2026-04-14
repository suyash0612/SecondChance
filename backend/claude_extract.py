"""
Gemini-powered clinical entity extraction.

Takes raw OCR text from a medical document and returns a fully structured
payload (conditions, medications, allergies, labs, encounters, timeline events)
that matches the TypeScript data model in lib/types.ts.
"""

import json
import logging
import os
import uuid
from datetime import date
from typing import Any, Dict, List, Optional

from google import genai
from dotenv import load_dotenv
import sys
from pathlib import Path

# Load .env from backend directory
backend_dir = Path(__file__).parent
load_dotenv(backend_dir / '.env')

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# ── Shared instructions (used by both text and vision pipelines) ──────────────

_SYSTEM_INSTRUCTIONS = """\
Output ONLY a single valid JSON object — no markdown fences, no explanation.

Required top-level keys (use empty arrays [] when nothing is found):

{
  "classification": "<one of: Lab Report | Progress Note | Discharge Summary | Consult Note | Imaging Report | Prescription | Medical Document>",
  "extractedDate":     "<YYYY-MM-DD — date of the visit/test/report; today if unknown>",
  "extractedProvider": "<full name with title, e.g. Dr. Jane Smith>",
  "extractedFacility": "<clinic or hospital name>",

  "conditions": [
    {
      "name":        "<condition name>",
      "icd10":       "<ICD-10 code if present, else null>",
      "status":      "<active | resolved | managed>",
      "onsetDate":   "<YYYY-MM or YYYY-MM-DD, null if unknown>",
      "diagnosedBy": "<provider name, null if unknown>"
    }
  ],

  "medications": [
    {
      "name":       "<drug name>",
      "dosage":     "<e.g. 500 mg>",
      "frequency":  "<e.g. twice daily>",
      "status":     "<active | discontinued>",
      "startDate":  "<YYYY-MM-DD, use document date if unknown>",
      "endDate":    "<YYYY-MM-DD or null>",
      "prescriber": "<provider name or null>",
      "reason":     "<indication or null>"
    }
  ],

  "allergies": [
    {
      "substance": "<allergen>",
      "reaction":  "<reaction description>",
      "severity":  "<mild | moderate | severe>"
    }
  ],

  "labs": [
    {
      "testName": "<test name>",
      "value":    "<numeric or text result>",
      "unit":     "<unit of measure>",
      "refLow":   <numeric lower bound or null>,
      "refHigh":  <numeric upper bound or null>,
      "flag":     "<normal | low | high | critical_low | critical_high>",
      "date":     "<YYYY-MM-DD>"
    }
  ],

  "encounters": [
    {
      "date":      "<YYYY-MM-DD>",
      "type":      "<office_visit | er | imaging | procedure | surgery>",
      "complaint": "<chief complaint or reason for visit>",
      "summary":   "<one-sentence clinical summary>",
      "provider":  "<provider name>",
      "facility":  "<facility name>"
    }
  ]
}

Rules:
- Only include entities you can confidently identify.
- For lab flags: use reference ranges or HIGH/LOW/CRITICAL annotations.
- Dates must be ISO format YYYY-MM-DD (or YYYY-MM if day unknown).
- Do not invent data. Do not include patient name or DOB.
"""

_PROMPT_PREFIX = (
    "You are a clinical data extraction engine. Read the OCR text from the medical "
    "document below and extract all clinical entities.\n\n"
    + _SYSTEM_INSTRUCTIONS
)


# ── Vision extraction (scanned PDFs + images) ────────────────────────────────

def extract_with_vision(file_bytes: bytes, mime_type: str, doc_id: str, file_name: str) -> Dict[str, Any]:
    """
    Send the raw file directly to Gemini Vision — no OCR step needed.
    Works for scanned PDFs, JPEGs, PNGs, and any image Gemini can read.
    """
    from google.genai import types as gtypes

    vision_prompt = (
        "You are a clinical data extraction engine. Look at this medical document image or PDF "
        "and extract all clinical information. " + _SYSTEM_INSTRUCTIONS
    )

    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            gtypes.Part.from_bytes(data=file_bytes, mime_type=mime_type),
            vision_prompt,
        ],
    )

    return _parse_and_build(response.text.strip(), doc_id, file_name)


# ── Text extraction function ───────────────────────────────────────────────────

def extract_with_claude(ocr_text: str, doc_id: str, file_name: str) -> Dict[str, Any]:
    """Call Gemini to extract structured clinical data from OCR text."""
    prompt = _PROMPT_PREFIX + f'\n<document filename="{file_name}">\n{ocr_text}\n</document>'
    response = _client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return _parse_and_build(response.text.strip(), doc_id, file_name)


# ── Shared JSON parser + entity builder ───────────────────────────────────────

def _parse_and_build(raw: str, doc_id: str, file_name: str) -> Dict[str, Any]:
    """Parse Gemini JSON output and build the full entity + timeline payload."""
    today = date.today().isoformat()

    # Strip markdown fences if model wraps output anyway
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    logger.info("Gemini output: %d chars", len(raw))
    data = json.loads(raw)

    classification = data.get("classification", "Medical Document")
    extracted_date = data.get("extractedDate") or today
    provider       = data.get("extractedProvider") or "Unknown Provider"
    facility       = data.get("extractedFacility") or "Unknown Facility"

    conditions = [
        {
            "id": _uid("c"), "name": c["name"], "icd10": c.get("icd10"),
            "status": c.get("status", "active"), "onsetDate": c.get("onsetDate"),
            "diagnosedBy": c.get("diagnosedBy") or provider,
            "source": "extracted", "sourceDocId": doc_id, "confidence": 0.85,
        }
        for c in data.get("conditions", []) if c.get("name")
    ]

    medications = [
        {
            "id": _uid("m"), "name": m["name"], "dosage": m.get("dosage") or "",
            "frequency": m.get("frequency") or "", "status": m.get("status", "active"),
            "startDate": m.get("startDate") or today, "endDate": m.get("endDate"),
            "prescriber": m.get("prescriber") or provider, "reason": m.get("reason"),
            "source": "extracted", "sourceDocId": doc_id, "confidence": 0.85,
        }
        for m in data.get("medications", []) if m.get("name")
    ]

    allergies = [
        {
            "id": _uid("a"), "substance": a["substance"],
            "reaction": a.get("reaction") or "", "severity": a.get("severity", "moderate"),
            "source": "extracted", "sourceDocId": doc_id,
        }
        for a in data.get("allergies", []) if a.get("substance")
    ]

    labs = [
        {
            "id": _uid("l"), "testName": l["testName"], "value": str(l.get("value", "")),
            "unit": l.get("unit") or "", "refLow": _to_float(l.get("refLow")),
            "refHigh": _to_float(l.get("refHigh")), "flag": l.get("flag", "normal"),
            "date": l.get("date") or extracted_date, "provider": provider,
            "source": "extracted", "sourceDocId": doc_id, "confidence": 0.90,
        }
        for l in data.get("labs", []) if l.get("testName")
    ]

    encounters = [
        {
            "id": _uid("e"), "date": e.get("date") or extracted_date,
            "type": e.get("type", "office_visit"), "complaint": e.get("complaint"),
            "summary": e.get("summary"), "provider": e.get("provider") or provider,
            "facility": e.get("facility") or facility,
            "source": "extracted", "sourceDocId": doc_id,
        }
        for e in data.get("encounters", [])
    ]

    events: List[dict] = []
    _TYPE_LABELS = {"office_visit": "Office Visit", "er": "ER Visit", "imaging": "Imaging Study", "procedure": "Procedure", "surgery": "Surgery"}

    for enc in encounters:
        t = enc["type"]
        events.append({
            "id": _uid("t"), "date": enc["date"], "type": t,
            "title": f"{_TYPE_LABELS.get(t, t.replace('_',' ').title())} — {enc.get('provider', provider)}",
            "description": enc.get("summary") or enc.get("complaint"),
            "importance": "critical" if t == "er" else "routine",
            "isMilestone": t == "er", "source": "extracted", "sourceDocId": doc_id,
            "provider": enc.get("provider", provider), "facility": enc.get("facility", facility),
            "bodySystem": "general",
        })

    for lab in labs[:6]:
        flag = lab["flag"]
        suffix = f" ({flag.upper().replace('_',' ')})" if flag != "normal" else ""
        importance = "critical" if "critical" in flag else "significant" if flag != "normal" else "routine"
        ref = f"{lab['refLow']}–{lab['refHigh']} {lab['unit']}" if lab.get("refLow") is not None and lab.get("refHigh") is not None else None
        events.append({
            "id": _uid("t"), "date": lab["date"], "type": "lab_result",
            "title": f"{lab['testName']}: {lab['value']} {lab['unit']}{suffix}",
            "description": f"Reference: {ref}" if ref else None,
            "importance": importance, "isMilestone": False,
            "source": "extracted", "sourceDocId": doc_id, "provider": provider,
            "bodySystem": "general", "meta": {"value": f"{lab['value']} {lab['unit']}", "flag": flag},
        })

    for cond in conditions:
        events.append({
            "id": _uid("t"), "date": cond.get("onsetDate") or extracted_date,
            "type": "diagnosis",
            "title": "Diagnosed: " + cond["name"] + (f" ({cond['icd10']})" if cond.get("icd10") else ""),
            "description": f"Status: {cond['status']}", "importance": "significant",
            "isMilestone": True, "source": "extracted", "sourceDocId": doc_id,
            "provider": cond.get("diagnosedBy", provider), "bodySystem": "general",
        })

    for med in medications:
        active = med["status"] == "active"
        events.append({
            "id": _uid("t"), "date": med["startDate"],
            "type": "medication_start" if active else "medication_stop",
            "title": f"{'Started' if active else 'Discontinued'}: {med['name']} {med['dosage']}".strip(),
            "description": med.get("reason"), "importance": "notable", "isMilestone": False,
            "source": "extracted", "sourceDocId": doc_id,
            "provider": med.get("prescriber", provider), "bodySystem": "general",
        })

    if not events:
        events.append({
            "id": _uid("t"), "date": extracted_date, "type": "encounter",
            "title": f"{classification} Uploaded",
            "description": f"Processed from {facility}. Provider: {provider}.",
            "importance": "routine", "isMilestone": False,
            "source": "extracted", "sourceDocId": doc_id,
            "provider": provider, "facility": facility, "bodySystem": "general",
        })

    return {
        "classification": classification, "extractedDate": extracted_date,
        "extractedProvider": provider, "extractedFacility": facility,
        "conditions": conditions, "medications": medications,
        "allergies": allergies, "labs": labs, "encounters": encounters, "events": events,
    }


# ── Utilities ─────────────────────────────────────────────────────────────────

def _uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def _to_float(val: Any) -> Optional[float]:
    if val is None:
        return None
    try:
        return float(val)
    except (TypeError, ValueError):
        return None
