"""
VitaLink Backend — FastAPI application

Endpoints:
  GET  /health           → liveness check
  POST /extract          → upload a medical document, OCR it, extract with Claude
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from claude_extract import extract_with_claude
from models import ExtractionResponse
from ocr import extract_text

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="VitaLink Backend",
    description="OCR + Claude-powered medical document extraction for Second Opinion / VitaLink",
    version="1.0.0",
)

# Allow the Expo dev server (and any origin during dev) to call this API.
# Restrict origins in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/extract", response_model=ExtractionResponse)
async def extract_document(
    file: UploadFile = File(..., description="Medical document — PDF or image"),
    doc_id: Optional[str] = Form(None, description="Optional pre-assigned document ID"),
):
    """
    Pipeline:
      1. Read uploaded file bytes
      2. OCR → plain text  (pdfplumber for digital PDFs, Tesseract for scans/images)
      3. Claude API        → structured clinical entities + timeline events
      4. Return ExtractionResponse matching the frontend TypeScript types
    """
    assigned_doc_id = doc_id or f"doc-{uuid.uuid4().hex[:8]}"
    filename = file.filename or "document"
    mime_type = file.content_type or "application/octet-stream"

    # ── 1. Read file ──────────────────────────────────────────────────────────
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    logger.info("Received file: %s (%s, %d bytes)", filename, mime_type, len(file_bytes))

    # ── 2. OCR ────────────────────────────────────────────────────────────────
    ocr_text = extract_text(file_bytes, mime_type, filename)
    if not ocr_text.strip():
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not extract any text from the document. "
                "Make sure the file is a readable PDF or a clear image."
            ),
        )

    logger.info("OCR extracted %d characters", len(ocr_text))

    # ── 3. Claude extraction ──────────────────────────────────────────────────
    extracted = extract_with_claude(ocr_text, assigned_doc_id, filename)

    logger.info(
        "Extraction complete — conditions: %d, meds: %d, labs: %d, events: %d",
        len(extracted["conditions"]),
        len(extracted["medications"]),
        len(extracted["labs"]),
        len(extracted["events"]),
    )

    # ── 4. Build response ─────────────────────────────────────────────────────
    now = datetime.now(timezone.utc).isoformat()

    return ExtractionResponse(
        updated={
            "id":               assigned_doc_id,
            "fileName":         filename,
            "mimeType":         mime_type,
            "uploadedAt":       now,
            "classification":   extracted["classification"],
            "extractionStatus": "completed",
            "extractedDate":    extracted["extractedDate"],
            "extractedProvider": extracted["extractedProvider"],
            "extractedFacility": extracted["extractedFacility"],
            "extractionPath":   "ai_extracted",
        },
        events=extracted["events"],
        medications=extracted["medications"],
        conditions=extracted["conditions"],
        allergies=extracted["allergies"],
        labs=extracted["labs"],
        encounters=extracted["encounters"],
        extractionPath="ai_extracted",
    )
