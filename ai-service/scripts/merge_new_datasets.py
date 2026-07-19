import shutil
from pathlib import Path

BASE = Path("C:/Users/ACER/sadakSewa/ai-service")
DATASET = BASE / "dataset"

# (folder_name, class_mapping_dict, prefix_str)
# class_mapping: { old_class_id: new_class_id }
DATASETS = [
    ("landslidev2.0",            {0: 4, 1: 4, 2: 4}, "ls2"),
    ("landslide.v2i.yolov8",     {0: 4},            "ls1"),
    ("Garbage.v10i.yolov8",      {0: 5},            "gb"),
    ("electric pole fire.v7i.yolov8", {0: 6},       "fire"),
]

SPLIT_MAP = {
    "train": "train",
    "valid": "val",
    "test":  "test",
}

def remap_label(line, mapping):
    parts = line.strip().split()
    if len(parts) < 5:
        return None
    old_cls = int(parts[0])
    if old_cls not in mapping:
        return None
    parts[0] = str(mapping[old_cls])
    return " ".join(parts)

for folder, mapping, prefix in DATASETS:
    src = BASE / folder
    print(f"\nProcessing {folder} ...")
    for src_split, tgt_split in SPLIT_MAP.items():
        img_dir = src / src_split / "images"
        lbl_dir = src / src_split / "labels"
        if not img_dir.exists():
            print(f"  Skipping {src_split} (no images dir)")
            continue

        tgt_img = DATASET / "images" / tgt_split
        tgt_lbl = DATASET / "labels" / tgt_split
        tgt_img.mkdir(parents=True, exist_ok=True)
        tgt_lbl.mkdir(parents=True, exist_ok=True)

        count = 0
        for img_path in img_dir.iterdir():
            if img_path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".bmp"):
                continue
            # Corresponding label
            lbl_path = lbl_dir / f"{img_path.stem}.txt"
            if not lbl_path.exists():
                continue

            # Read & remap labels
            lines = lbl_path.read_text().strip().splitlines()
            new_lines = [remap_label(l, mapping) for l in lines]
            new_lines = [l for l in new_lines if l is not None]
            if not new_lines:
                continue

            # Copy image
            dst_name = f"{prefix}_{img_path.name}"
            dst_img = tgt_img / dst_name
            if not dst_img.exists():
                shutil.copy2(str(img_path), str(dst_img))

            # Write remapped labels
            dst_lbl = tgt_lbl / f"{dst_img.stem}.txt"
            dst_lbl.write_text("\n".join(new_lines))
            count += 1

        print(f"  {src_split} -> {tgt_split}: {count} images")

print("\nDone merging new datasets!")
