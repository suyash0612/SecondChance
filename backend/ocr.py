"""
OCR utilities — extract plain text from PDFs and images.

Priority order:
  1. pdfplumber (native text from digital PDFs — fast, no dependencies)
  2. pytesseract on rendered pages (scanned / image-only PDFs)
  3. pytesseract directly on image uploads
"""

import io
import logging
from typing import List

logger = logging.getLogger(__name__)


def extract_text(file_bytes: bytes, mime_type: str, filename: str) -> str:
    """
    Extract text from a document file.
    Returns an empty string if nothing could be extracted.
    """
    name_lower = filename.lower()
    is_pdf = mime_type == "application/pdf" or name_lower.endswith(".pdf")
    is_image = mime_type.startswith("image/") or any(
        name_lower.endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp", ".webp")
    )

    if is_pdf:
        text = _extract_pdf_native(file_bytes)
        if text.strip():
            logger.info("PDF native extraction succeeded (%d chars)", len(text))
            return text
        # Fallback: scanned PDF → render pages → OCR
        logger.info("PDF has no selectable text — falling back to OCR")
        return _ocr_pdf_pages(file_bytes)

    if is_image:
        return _ocr_image(file_bytes)

    # Unknown type: try PDF first, then image OCR
    text = _extract_pdf_native(file_bytes)
    if text.strip():
        return text
    return _ocr_image(file_bytes)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_pdf_native(file_bytes: bytes) -> str:
    """Extract selectable text from a digital PDF using pdfplumber."""
    try:
        import pdfplumber
        parts: List[str] = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    parts.append(page_text)
        return "\n\n".join(parts)
    except Exception as exc:
        logger.warning("pdfplumber extraction failed: %s", exc)
        return ""


def _ocr_pdf_pages(file_bytes: bytes) -> str:
    """
    Convert each PDF page to an image then run Tesseract OCR.
    Requires: poppler (brew install poppler) + pytesseract + Tesseract.
    """
    try:
        import pdf2image
        import pytesseract

        images = pdf2image.convert_from_bytes(file_bytes, dpi=200)
        parts: List[str] = []
        for img in images:
            parts.append(pytesseract.image_to_string(img))
        text = "\n\n".join(parts)
        logger.info("PDF OCR extraction succeeded (%d chars, %d pages)", len(text), len(images))
        return text
    except Exception as exc:
        logger.warning("PDF OCR extraction failed: %s", exc)
        return ""


def _ocr_image(file_bytes: bytes) -> str:
    """Run Tesseract OCR on an image file."""
    try:
        import pytesseract
        from PIL import Image

        img = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(img)
        logger.info("Image OCR extraction succeeded (%d chars)", len(text))
        return text
    except Exception as exc:
        logger.warning("Image OCR extraction failed: %s", exc)
        return ""
