"""
VitaLink Backend — FastAPI application

Endpoints:
  GET  /health   → liveness check
  POST /extract  → upload a medical document, extract clinical data with Gemini Vision
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .claude_extract import extract_with_vision, extract_with_claude
from .models import ExtractionResponse
from .ocr import extract_text

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Second Opinion Backend",
    description="Gemini Vision-powered medical document extraction for Second Opinion",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
def root():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")

@app.get("/sample_pdf", include_in_schema=False)
def sample_pdf():
    from fastapi.responses import FileResponse
    import os
    path = os.path.join(os.path.dirname(__file__), "sample_medical_record.pdf")
    return FileResponse(path, media_type="application/pdf", filename="sample_medical_record.pdf")

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.1.0"}


@app.post("/extract", response_model=ExtractionResponse)
async def extract_document(
    file: UploadFile = File(..., description="Medical document — PDF or image"),
    doc_id: Optional[str] = Form(None, description="Optional pre-assigned document ID"),
):
    """
    Pipeline:
      1. Read uploaded file bytes
      2. Try pdfplumber for digital PDFs (fast, no AI cost)
      3. If no text found (scanned PDF / image) → Gemini Vision reads the file directly
      4. Return ExtractionResponse matching the frontend TypeScript types
    """
    assigned_doc_id = doc_id or f"doc-{uuid.uuid4().hex[:8]}"
    filename = file.filename or "document"
    mime_type = file.content_type or "application/octet-stream"

    # Normalise common browser mime types
    if mime_type == "application/octet-stream":
        name_lower = filename.lower()
        if name_lower.endswith(".pdf"):
            mime_type = "application/pdf"
        elif name_lower.endswith((".jpg", ".jpeg")):
            mime_type = "image/jpeg"
        elif name_lower.endswith(".png"):
            mime_type = "image/png"

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    logger.info("Received: %s (%s, %d bytes)", filename, mime_type, len(file_bytes))

    # ── Try native text extraction first (fast, free) ─────────────────────────
    ocr_text = extract_text(file_bytes, mime_type, filename)

    if ocr_text.strip():
        logger.info("Native text extraction: %d chars — using text pipeline", len(ocr_text))
        extracted = extract_with_claude(ocr_text, assigned_doc_id, filename)
    else:
        # Scanned PDF or image — send file directly to Gemini Vision
        logger.info("No native text found — switching to Gemini Vision pipeline")
        if mime_type not in (
            "application/pdf", "image/jpeg", "image/jpg",
            "image/png", "image/webp", "image/heic", "image/heif",
        ):
            raise HTTPException(
                status_code=422,
                detail=f"Unsupported file type '{mime_type}'. Upload a PDF or image (JPEG, PNG, WEBP).",
            )
        extracted = extract_with_vision(file_bytes, mime_type, assigned_doc_id, filename)

    logger.info(
        "Done — conditions:%d meds:%d labs:%d events:%d",
        len(extracted["conditions"]),
        len(extracted["medications"]),
        len(extracted["labs"]),
        len(extracted["events"]),
    )

    now = datetime.now(timezone.utc).isoformat()

    return ExtractionResponse(
        updated={
            "id":                assigned_doc_id,
            "fileName":          filename,
            "mimeType":          mime_type,
            "uploadedAt":        now,
            "classification":    extracted["classification"],
            "extractionStatus":  "completed",
            "extractedDate":     extracted["extractedDate"],
            "extractedProvider": extracted["extractedProvider"],
            "extractedFacility": extracted["extractedFacility"],
            "extractionPath":    "ai_extracted",
        },
        events=extracted["events"],
        medications=extracted["medications"],
        conditions=extracted["conditions"],
        allergies=extracted["allergies"],
        labs=extracted["labs"],
        encounters=extracted["encounters"],
        extractionPath="ai_extracted",
    )
