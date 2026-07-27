import os
import shutil
from pathlib import Path
from dotenv import load_dotenv
from roboflow import Roboflow

load_dotenv(Path(__file__).parent / ".env")

API_KEY = os.getenv("ROBOFLOW_API_KEY")
if not API_KEY:
    raise ValueError("Set ROBOFLOW_API_KEY in ai-service/training/.env")

rf = Roboflow(api_key=API_KEY)

BASE = Path("C:/Users/ACER/sadakSewa/ai-service")
DATASET = BASE / "dataset"
DOWNLOAD_DIR = BASE / "roboflow_downloads"

OUR_CLASSES = {
    0: "longitudinal_crack",
    1: "transverse_crack",
    2: "alligator_crack",
    3: "pothole",
    4: "landslide",
    5: "garbage",
    6: "fire_smoke",
}

DATASETS = [
    {
        "workspace": "fire-and-smoke-detection-yolo",
        "project": "fire-and-smoke-detection-yolo",
        "version": 1,
        "our_class": 6,
        "prefix": "fire",
        "download_classes": ["fire", "smoke", "Fire", "Smoke", "fire_smoke"],
    },
    {
        "workspace": "pothole-detection-ip2o4",
        "project": "ai-pothole-detection-using-yolo",
        "version": 1,
        "our_class": 3,
        "prefix": "pothole",
        "download_classes": ["pothole", "Pothole", "POTHOLE"],
    },
    {
        "workspace": "pothole",
        "project": "pothole-detection-2",
        "version": 1,
        "our_class": 3,
        "prefix": "pothole2",
        "download_classes": ["pothole", "Pothole", "POTHOLE"],
    },
    {
        "workspace": "material-identification",
        "project": "garbage-classification-3",
        "version": 2,
        "our_class": 5,
        "prefix": "garbage",
        "download_classes": ["plastic", "cardboard", "glass", "metal", "paper", "biodegradable",
                             "Garbage", "garbage", "trash", "Plastic", "Cardboard"],
    },
]


def download_dataset(info):
    workspace = rf.workspace(info["workspace"])
    project = workspace.project(info["project"])
    version = project.version(info["version"])

    dest = DOWNLOAD_DIR / info["prefix"]
    if dest.exists():
        print(f"  Already downloaded: {dest}")
        return dest

    print(f"  Downloading {info['workspace']}/{info['project']} v{info['version']}...")
    dataset = version.download("yolov8")
    dataset.location = str(dest)
    return dest


def get_source_class_id(label_path, class_names):
    for cls_id, name in class_names.items():
        if name.lower() in [c.lower() for c in class_names.values()]:
            pass
    return class_names


def merge_into_dataset(download_dir, info):
    our_class = info["our_class"]
    prefix = info["prefix"]

    split_map = {"train": "train", "valid": "val", "test": "test"}

    for src_split, tgt_split in split_map.items():
        img_dir = download_dir / src_split / "images"
        lbl_dir = download_dir / src_split / "labels"

        if not img_dir.exists():
            print(f"  Skipping {src_split} (no images)")
            continue

        tgt_img = DATASET / "images" / tgt_split
        tgt_lbl = DATASET / "labels" / tgt_split
        tgt_img.mkdir(parents=True, exist_ok=True)
        tgt_lbl.mkdir(parents=True, exist_ok=True)

        yaml_path = download_dir / "data.yaml"
        src_class_names = {}
        if yaml_path.exists():
            for line in yaml_path.read_text().splitlines():
                if ":" in line and line.strip().startswith(("0:", "1:", "2:", "3:", "4:", "5:", "6:", "7:", "8:", "9:")):
                    parts = line.split(":")
                    cls_id = int(parts[0].strip())
                    cls_name = parts[1].strip().strip('"').strip("'")
                    src_class_names[cls_id] = cls_name

        count = 0
        for img_path in img_dir.iterdir():
            if img_path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".bmp"):
                continue
            lbl_path = lbl_dir / f"{img_path.stem}.txt"
            if not lbl_path.exists():
                continue

            lines = lbl_path.read_text().strip().splitlines()
            new_lines = []
            for line in lines:
                parts = line.strip().split()
                if len(parts) < 5:
                    continue
                old_cls = int(parts[0])
                parts[0] = str(our_class)
                new_lines.append(" ".join(parts))

            if not new_lines:
                continue

            dst_name = f"{prefix}_{img_path.name}"
            dst_img = tgt_img / dst_name
            if not dst_img.exists():
                shutil.copy2(str(img_path), str(dst_img))

            dst_lbl = tgt_lbl / f"{dst_img.stem}.txt"
            dst_lbl.write_text("\n".join(new_lines))
            count += 1

        print(f"  {src_split} -> {tgt_split}: {count} images")


if __name__ == "__main__":
    DOWNLOAD_DIR.mkdir(exist_ok=True)

    for info in DATASETS:
        print(f"\n{'='*50}")
        print(f"Dataset: {info['prefix']} -> class {info['our_class']} ({OUR_CLASSES[info['our_class']]})")
        print(f"{'='*50}")

        try:
            download_dir = download_dataset(info)
            merge_into_dataset(download_dir, info)
        except Exception as e:
            print(f"  ERROR: {e}")
            print(f"  Skipping this dataset")

    print("\n\nDone! Run validation to see improved accuracy:")
    print('  python -c "from ultralytics import YOLO; m = YOLO(r\'ai-service/weights/full.pt\'); m.val(data=r\'ai-service/training/data.yaml\', imgsz=640, batch=8)"')
