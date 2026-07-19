from pathlib import Path
from typing import List, Tuple
import base64
import io

import cv2
import numpy as np
from ultralytics import YOLO
from PIL import Image

WEIGHTS_DIR = Path(__file__).resolve().parent.parent / "weights"
ROAD_MODEL_PATH = WEIGHTS_DIR / "best.pt"
FULL_MODEL_PATH = WEIGHTS_DIR / "full.pt"

CONFIDENCE_THRESHOLD = 0.15
GARBAGE_CONFIDENCE_THRESHOLD = 0.35
LANDSLIDE_CONFIDENCE_THRESHOLD = 0.10


CLASS_NAMES = {
    0: "longitudinal_crack",
    1: "transverse_crack",
    2: "alligator_crack",
    3: "pothole",
    4: "landslide",
    5: "garbage",
    6: "fire_smoke",
}

ROAD_DAMAGE_CLASSES = {0, 1, 2, 3}
NEW_CLASSES = {4, 5, 6}

_road_model: YOLO | None = None
_full_model: YOLO | None = None


def load_models() -> None:
    global _road_model, _full_model
    if _road_model is None:
        _road_model = YOLO(str(ROAD_MODEL_PATH))
    if _full_model is None:
        _full_model = YOLO(str(FULL_MODEL_PATH))
    warmup = np.zeros((640, 640, 3), dtype=np.uint8)
    _road_model.predict(warmup, verbose=False)
    _full_model.predict(warmup, verbose=False)


def get_road_model() -> YOLO:
    if _road_model is None:
        raise RuntimeError("Road model not loaded. Call load_models() first.")
    return _road_model


def get_full_model() -> YOLO:
    if _full_model is None:
        raise RuntimeError("Full model not loaded. Call load_models() first.")
    return _full_model


def _is_tall_box(bbox: List[float], max_ratio: float) -> bool:
    x1, y1, x2, y2 = bbox
    h = y2 - y1
    w = x2 - x1
    return w > 0 and (h / w) > max_ratio


def _image_to_base64(image: np.ndarray) -> str:
    pil_img = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


def _collect_detections(model, results, allowed_classes, threshold=CONFIDENCE_THRESHOLD, max_aspect_ratio=None, class_thresholds=None) -> List[dict]:
    detections = []
    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue
        for box in boxes:
            confidence = float(box.conf[0])
            if confidence < threshold:
                continue
            class_id = int(box.cls[0])
            if class_id not in allowed_classes:
                continue
            if class_thresholds and class_id in class_thresholds:
                if confidence < class_thresholds[class_id]:
                    continue
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            if max_aspect_ratio is not None:
                box_h = y2 - y1
                box_w = x2 - x1
                if box_w > 0 and (box_h / box_w) > max_aspect_ratio:
                    continue
            class_name = CLASS_NAMES.get(class_id, model.names.get(class_id, "unknown"))
            bbox = [round(coord, 2) for coord in (x1, y1, x2, y2)]
            detections.append({
                "type": class_name,
                "confidence": round(confidence, 4),
                "bbox": bbox,
            })
    return detections


def run_inference(image_path: Path) -> Tuple[List[dict], str, str]:
    road_model = get_road_model()
    full_model = get_full_model()

    road_results = road_model.predict(source=str(image_path), verbose=False)
    full_results = full_model.predict(source=str(image_path), verbose=False, conf=0.01)

    road_detections = _collect_detections(road_model, road_results, ROAD_DAMAGE_CLASSES)
    new_detections = _collect_detections(full_model, full_results, NEW_CLASSES, class_thresholds={4: LANDSLIDE_CONFIDENCE_THRESHOLD, 5: GARBAGE_CONFIDENCE_THRESHOLD})
    new_detections = [d for d in new_detections if not (d["type"] == "garbage" and _is_tall_box(d["bbox"], 1.5))]

    detections = road_detections + new_detections

    road_status = "damaged" if len(road_detections) > 0 else "good"

    annotated_b64 = ""
    if road_results:
        img = road_results[0].plot()
        for det in new_detections:
            x1, y1, x2, y2 = [int(round(v)) for v in det["bbox"]]
            label = f"{det['type']} {det['confidence']:.2f}"
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 2)
            (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            cv2.rectangle(img, (x1, y1 - th - 6), (x1 + tw + 4, y1), (0, 0, 255), -1)
            cv2.putText(img, label, (x1 + 2, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        annotated_b64 = _image_to_base64(img)

    return detections, road_status, annotated_b64
