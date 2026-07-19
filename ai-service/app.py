# app.py
#
# Entry point for the SadakSewa AI microservice.
# This file only wires things together: it creates the FastAPI app,
# registers routers, and loads the YOLO model once on startup.
# No inference logic lives here — see services/inference_service.py.

from fastapi import FastAPI

from routes.predict import router as predict_router
from services.inference_service import load_models
from models.schemas import HealthResponse

app = FastAPI(
    title="SadakSewa AI Service",
    description="Standalone Python microservice for image-based object detection.",
    version="1.0.0",
)


@app.on_event("startup")
async def on_startup() -> None:
    """
    Runs once when the server starts. Loading the YOLO model here
    (rather than per-request) means the weights are read from disk
    only once and reused for every /predict call, which is far faster.
    """
    load_models()


@app.get("/", response_model=HealthResponse)
async def health_check():
    """Simple health check endpoint to confirm the service is running."""
    return HealthResponse(success=True, message="SadakSewa AI Service Running")


# Register the /predict route defined in routes/predict.py
app.include_router(predict_router)
