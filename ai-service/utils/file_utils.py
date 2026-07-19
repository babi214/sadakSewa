# utils/file_utils.py
#
# Small helper functions for handling temporary image files on disk.
# Keeping this logic out of the route/service files makes it reusable
# and keeps each file focused on a single responsibility.

import os
import uuid
from pathlib import Path

from fastapi import UploadFile

# Directory where uploaded images are temporarily stored before inference.
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"

# Only these file extensions are accepted for prediction.
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def is_allowed_file(filename: str) -> bool:
    """Check whether the uploaded file has an allowed image extension."""
    extension = Path(filename).suffix.lower()
    return extension in ALLOWED_EXTENSIONS


async def save_upload_file(upload_file: UploadFile) -> Path:
    """
    Save an incoming UploadFile to the uploads/ directory using a
    randomly generated filename (to avoid collisions), and return
    the path it was saved to.
    """
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    extension = Path(upload_file.filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{extension}"
    destination = UPLOAD_DIR / unique_name

    contents = await upload_file.read()
    with open(destination, "wb") as buffer:
        buffer.write(contents)

    return destination


def delete_file(file_path: Path) -> None:
    """
    Delete a file from disk if it exists.
    Used to clean up temporary uploaded images after inference,
    regardless of whether inference succeeded or failed.
    """
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except OSError:
        # If deletion fails, we don't want to crash the request —
        # this is best-effort cleanup.
        pass
