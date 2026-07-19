from typing import List
from pydantic import BaseModel


class HealthResponse(BaseModel):
    success: bool
    message: str


class Detection(BaseModel):
    type: str
    confidence: float
    bbox: List[float]


class PredictResponse(BaseModel):
    road_status: str
    damage_detected: bool
    landslide_detected: bool = False
    garbage_detected: bool = False
    fire_smoke_detected: bool = False
    detections: List[Detection]
    annotated_image: str
