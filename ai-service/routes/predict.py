from fastapi import APIRouter, UploadFile, File, HTTPException

from models.schemas import PredictResponse, Detection
from services.inference_service import run_inference
from utils.file_utils import save_upload_file, delete_file, is_allowed_file

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
async def predict(file: UploadFile = File(...)):
    if not file.filename or not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a JPG, PNG, BMP, or WEBP image.",
        )

    saved_path = None
    try:
        saved_path = await save_upload_file(file)

        detections, road_status, annotated_b64 = run_inference(saved_path)

        damage_detected = road_status == "damaged"
        landslide_detected = any(d["type"] == "landslide" for d in detections)
        garbage_detected = any(d["type"] == "garbage" for d in detections)
        fire_smoke_detected = any(d["type"] == "fire_smoke" for d in detections)

        detection_objects = [
            Detection(type=d["type"], confidence=d["confidence"], bbox=d["bbox"])
            for d in detections
        ]

        return PredictResponse(
            road_status=road_status,
            damage_detected=damage_detected,
            landslide_detected=landslide_detected,
            garbage_detected=garbage_detected,
            fire_smoke_detected=fire_smoke_detected,
            detections=detection_objects,
            annotated_image=annotated_b64,
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Inference failed: {str(exc)}",
        )
    finally:
        if saved_path is not None:
            delete_file(saved_path)
