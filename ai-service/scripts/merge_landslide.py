import shutil
from pathlib import Path

LANDSLIDE_DIR = Path("C:/Users/ACER/sadakSewa/ai-service/landslide Detection.v2i.yolov8")
DATASET_DIR = Path("C:/Users/ACER/sadakSewa/ai-service/dataset")
LANDSLIDE_CLASS_ID = 4

split_map = {
    "train": "train",
    "valid": "val",
    "test": "test",
}

for src_split, dst_split in split_map.items():
    src_img_dir = LANDSLIDE_DIR / src_split / "images"
    src_lbl_dir = LANDSLIDE_DIR / src_split / "labels"
    dst_img_dir = DATASET_DIR / "images" / dst_split
    dst_lbl_dir = DATASET_DIR / "labels" / dst_split

    if not src_img_dir.exists():
        continue

    for img_file in src_img_dir.iterdir():
        if not img_file.is_file():
            continue
        dst_img = dst_img_dir / img_file.name
        if not dst_img.exists():
            shutil.copy2(img_file, dst_img)

        lbl_file = src_lbl_dir / (img_file.stem + ".txt")
        if lbl_file.exists():
            dst_lbl = dst_lbl_dir / (img_file.stem + ".txt")
            if dst_lbl.exists():
                continue
            lines = []
            for line in lbl_file.read_text().strip().splitlines():
                if line.strip():
                    parts = line.strip().split()
                    parts[0] = str(LANDSLIDE_CLASS_ID)
                    lines.append(" ".join(parts))
            dst_lbl.write_text("\n".join(lines))

print("Landslide dataset merged successfully!")
