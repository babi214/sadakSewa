from pathlib import Path
from ultralytics import YOLO
import torch


def main():
    if torch.cuda.is_available():
        print(f"Using GPU: {torch.cuda.get_device_name(0)}")
        device = 0
    else:
        print("CUDA not available. Using CPU.")
        device = "cpu"

    weights_path = Path(__file__).resolve().parent.parent.parent / "runs" / "detect" / "runs" / "sadaksewa_full" / "weights" / "best.pt"
    model = YOLO(str(weights_path))

    data_yaml = Path(__file__).parent / "data.yaml"

    model.train(
        data=str(data_yaml),
        epochs=100,
        imgsz=640,
        batch=8,
        patience=30,
        workers=2,
        cache=False,
        device=device,
        project="runs/trained",
        name="sadaksewa_full",
        exist_ok=True,
        pretrained=True,
        verbose=True,
    )

    print("\nTraining completed!")

    best_weights = Path(__file__).resolve().parent.parent / "runs" / "detect" / "runs" / "trained" / "sadaksewa_full" / "weights" / "best.pt"
    if best_weights.exists():
        best_model = YOLO(str(best_weights))
        metrics = best_model.val()
        print("\n========== Validation Metrics ==========")
        print(metrics)
        print("========================================")
    else:
        print("No best.pt found for validation.")


if __name__ == "__main__":
    main()