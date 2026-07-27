import shutil
from pathlib import Path

BASE = Path("C:/Users/ACER/sadakSewa/ai-service")
DATASET = BASE / "dataset"

SPLIT_MAP = {"train": "train", "valid": "val", "test": "test"}

DATASETS = [
    (Path("C:/Users/ACER/sadakSewa/AI-Pothole-Detection-using-YOLO-1"), 3, "pothole"),
    (Path("C:/Users/ACER/sadakSewa/GARBAGE-CLASSIFICATION-3-2"), 5, "garbage"),
]

for src_dir, our_class, prefix in DATASETS:
    print(f"\nMerging {src_dir.name} -> class {our_class} ({prefix})")
    for src_split, tgt_split in SPLIT_MAP.items():
        img_dir = src_dir / src_split / "images"
        lbl_dir = src_dir / src_split / "labels"
        if not img_dir.exists():
            print(f"  Skipping {src_split}")
            continue

        tgt_img = DATASET / "images" / tgt_split
        tgt_lbl = DATASET / "labels" / tgt_split
        tgt_img.mkdir(parents=True, exist_ok=True)
        tgt_lbl.mkdir(parents=True, exist_ok=True)

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

print("\nDone! Dataset counts:")
for split in ["train", "val"]:
    count = len(list((DATASET / "images" / split).glob("*")))
    print(f"  {split}: {count} images")
