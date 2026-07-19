# SadakSewa AI Service — Phase 1

A standalone Python microservice for the SadakSewa civic-reporting platform.
This service is independent of the Node/Express backend and communicates
with it over REST APIs (integration comes in a later phase).

## Phase 1 Scope

- FastAPI project with a clean, modular folder structure
- Health check endpoint (`GET /`)
- Pretrained YOLO11n model, auto-downloaded and loaded once at startup
- `POST /predict` endpoint that accepts an image and returns detected
  object classes + confidence scores (no bounding boxes yet)
- Temporary uploaded images are deleted automatically after inference

Not included yet (future phases): Express integration, EXIF extraction,
custom-trained model, MongoDB.

## Folder Structure

```
ai-service/
├── app.py                     # FastAPI app creation + startup wiring
├── requirements.txt           # Python dependencies
├── routes/
│   └── predict.py             # POST /predict route (HTTP layer only)
├── services/
│   └── inference_service.py   # YOLO model loading + inference logic
├── models/
│   └── schemas.py             # Pydantic request/response schemas
├── utils/
│   └── file_utils.py          # Save/delete temporary uploaded images
├── uploads/                   # Temporary storage for incoming images
├── outputs/                   # Reserved for future use (e.g. annotated images)
├── weights/                   # YOLO model weights are downloaded here
└── README.md
```

## Setup

1. Create and activate a virtual environment (recommended):

   ```bash
   python3 -m venv venv
   source venv/bin/activate      # Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

## Running the Service

```bash
uvicorn app:app --reload
```

The service will start at `http://127.0.0.1:8000`.

On first startup, Ultralytics will automatically download the `yolo11n.pt`
weights file into the `weights/` folder — this only happens once.

## Endpoints

### `GET /`

Health check.

```json
{
  "success": true,
  "message": "SadakSewa AI Service Running"
}
```

### `POST /predict`

Accepts `multipart/form-data` with a single field `file` (an image).

Example using `curl`:

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -F "file=@/path/to/image.jpg"
```

Example response:

```json
{
  "success": true,
  "detections": [
    { "class": "traffic light", "confidence": 0.94 },
    { "class": "car", "confidence": 0.98 }
  ]
}
```

Interactive API docs are also available at `http://127.0.0.1:8000/docs`
once the server is running.
