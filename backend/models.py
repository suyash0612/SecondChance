from pydantic import BaseModel
from typing import Optional, List, Literal, Dict, Any


# ── Document ──────────────────────────────────────────────────────────────────

class MedDocumentOut(BaseModel):
    id: str
    fileName: str
    mimeType: str
    uploadedAt: str
    classification: str
    extractionStatus: Literal["pending", "processing", "completed", "failed"]
    pages: Optional[int] = None
    extractedDate: Optional[str] = None
    extractedProvider: Optional[str] = None
    extractedFacility: Optional[str] = None
    extractionPath: Literal["mock", "ocr_stub", "ai_extracted"]


# ── Timeline ──────────────────────────────────────────────────────────────────

class TimelineEventOut(BaseModel):
    id: str
    date: str
    type: str
    title: str
    description: Optional[str] = None
    importance: Literal["routine", "notable", "significant", "critical"]
    isMilestone: bool
    source: Literal["uploaded", "extracted", "manual", "generated"]
    sourceDocId: Optional[str] = None
    provider: Optional[str] = None
    facility: Optional[str] = None
    bodySystem: Optional[str] = None
    meta: Optional[Dict[str, str]] = None


# ── Clinical entities ─────────────────────────────────────────────────────────

class MedicationOut(BaseModel):
    id: str
    name: str
    dosage: str
    frequency: str
    status: Literal["active", "discontinued"]
    startDate: str
    endDate: Optional[str] = None
    prescriber: Optional[str] = None
    reason: Optional[str] = None
    source: Literal["uploaded", "extracted", "manual", "generated"]
    sourceDocId: Optional[str] = None
    confidence: float


class ConditionOut(BaseModel):
    id: str
    name: str
    icd10: Optional[str] = None
    status: Literal["active", "resolved", "managed"]
    onsetDate: Optional[str] = None
    resolvedDate: Optional[str] = None
    diagnosedBy: Optional[str] = None
    source: Literal["uploaded", "extracted", "manual", "generated"]
    sourceDocId: Optional[str] = None
    confidence: float


class AllergyOut(BaseModel):
    id: str
    substance: str
    reaction: str
    severity: Literal["mild", "moderate", "severe"]
    source: Literal["uploaded", "extracted", "manual", "generated"]
    sourceDocId: Optional[str] = None


class LabResultOut(BaseModel):
    id: str
    testName: str
    value: str
    unit: str
    refLow: Optional[float] = None
    refHigh: Optional[float] = None
    flag: Literal["normal", "low", "high", "critical_low", "critical_high"]
    date: str
    provider: Optional[str] = None
    source: Literal["uploaded", "extracted", "manual", "generated"]
    sourceDocId: Optional[str] = None
    confidence: float


class EncounterOut(BaseModel):
    id: str
    date: str
    type: str
    complaint: Optional[str] = None
    summary: Optional[str] = None
    provider: Optional[str] = None
    facility: Optional[str] = None
    source: Literal["uploaded", "extracted", "manual", "generated"]
    sourceDocId: Optional[str] = None


# ── API response ──────────────────────────────────────────────────────────────

class ExtractionResponse(BaseModel):
    updated: MedDocumentOut
    events: List[TimelineEventOut]
    medications: List[MedicationOut]
    conditions: List[ConditionOut]
    allergies: List[AllergyOut]
    labs: List[LabResultOut]
    encounters: List[EncounterOut]
    extractionPath: str
