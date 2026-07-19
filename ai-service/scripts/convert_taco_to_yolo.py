import json, shutil
from pathlib import Path

TACO_ANNOTATIONS = Path("C:/Users/ACER/sadakSewa/ai-service/taco/TACO/data/annotations.json")
TACO_IMAGES_DIR = Path("C:/Users/ACER/sadakSewa/ai-service/taco/TACO/data")
OUTPUT_DIR = Path("C:/Users/ACER/sadakSewa/ai-service/dataset")
GARBAGE_CLASS_ID = 5

with open(TACO_ANNOTATIONS) as f:
    data = json.load(f)

downloaded_ids = []
for img in data["images"]:
    if (TACO_IMAGES_DIR / img["file_name"]).exists():
        downloaded_ids.append(img["id"])

print(f"Total images: {len(data['images'])}, Downloaded: {len(downloaded_ids)}, Skipped: {len(data['images']) - len(downloaded_ids)}")

downloaded_set = set(downloaded_ids)
annotations_by_image = {}
for ann in data["annotations"]:
    img_id = ann["image_id"]
    if img_id not in downloaded_set:
        continue
    annotations_by_image.setdefault(img_id, []).append(ann)

rng = __import__("random").Random(42)
all_img_ids = list(downloaded_ids)
rng.shuffle(all_img_ids)
n = len(all_img_ids)
n_train = int(n * 0.7)
n_val = int(n * 0.15)
train_ids = set(all_img_ids[:n_train])
val_ids = set(all_img_ids[n_train:n_train + n_val])
test_ids = set(all_img_ids[n_train + n_val:])

split_map = {}
for iid in train_ids: split_map[iid] = "train"
for iid in val_ids: split_map[iid] = "val"
for iid in test_ids: split_map[iid] = "test"

for split_name in ("train", "val", "test"):
    (OUTPUT_DIR / "images" / split_name).mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "labels" / split_name).mkdir(parents=True, exist_ok=True)

img_id_to_info = {img["id"]: img for img in data["images"]}

copied = 0
for img_id in downloaded_ids:
    img_info = img_id_to_info[img_id]
    rel_path = img_info["file_name"]
    src = TACO_IMAGES_DIR / rel_path

    fname = rel_path.replace("/", "_").replace("\\", "_")

    split = split_map[img_id]
    dst_img = OUTPUT_DIR / "images" / split / fname
    shutil.copy2(src, dst_img)

    width = img_info["width"]
    height = img_info["height"]
    anns = annotations_by_image.get(img_id, [])

    label_lines = []
    for ann in anns:
        bbox = ann["bbox"]
        x, y, w, h = bbox
        cx = (x + w / 2) / width
        cy = (y + h / 2) / height
        nw = w / width
        nh = h / height
        cx = max(0.0, min(1.0, cx))
        cy = max(0.0, min(1.0, cy))
        nw = max(0.0, min(1.0, nw))
        nh = max(0.0, min(1.0, nh))
        label_lines.append(f"{GARBAGE_CLASS_ID} {cx:.6f} {cy:.6f} {nw:.6f} {nh:.6f}")

    dst_label = OUTPUT_DIR / "labels" / split / (fname.rsplit(".", 1)[0] + ".txt")
    dst_label.write_text("\n".join(label_lines))
    copied += 1

print(f"Done. Converted {copied} images to YOLO format under {OUTPUT_DIR}")
