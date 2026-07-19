import random
import shutil
from pathlib import Path

RANDOM_SEED = 42
VAL_SPLIT = 0.2


def collect_pairs(source_dirs: list[dict]) -> list[tuple[Path, Path]]:
    """source_dirs: [{'images': ..., 'labels': ...}, ...] across all countries."""
    pairs = []
    for source in source_dirs:
        images_dir = Path(source["images"])
        labels_dir = Path(source["labels"])
        for label_file in labels_dir.glob("*.txt"):
            image_file = images_dir / (label_file.stem + ".jpg")
            if image_file.exists():
                pairs.append((image_file, label_file))
    return pairs


def split_and_copy(pairs: list[tuple[Path, Path]], output_root: str):
    random.seed(RANDOM_SEED)
    random.shuffle(pairs)

    split_idx = int(len(pairs) * (1 - VAL_SPLIT))
    train_pairs = pairs[:split_idx]
    val_pairs = pairs[split_idx:]

    output_root = Path(output_root)
    for split_name, split_pairs in [("train", train_pairs), ("val", val_pairs)]:
        img_out = output_root / "images" / split_name
        lbl_out = output_root / "labels" / split_name
        img_out.mkdir(parents=True, exist_ok=True)
        lbl_out.mkdir(parents=True, exist_ok=True)

        for image_file, label_file in split_pairs:
            shutil.copy(image_file, img_out / image_file.name)
            shutil.copy(label_file, lbl_out / label_file.name)

    print(f"Train: {len(train_pairs)} images | Val: {len(val_pairs)} images")


if __name__ == "__main__":
    pairs = collect_pairs([
        {
            "images": "dataset/images/India/train/images",
            "labels": "dataset/images/India/train/labels",
        },
        {
            "images": "dataset/images/Japan/train/images",
            "labels": "dataset/images/Japan/train/labels",
        },
        {
            "images": "dataset/images/China_Motorbikes/train/images",
            "labels": "dataset/images/China_Motorbikes/train/labels",
        },
        {
            "images": "dataset/images/Czech/train/images",
            "labels": "dataset/images/Czech/train/labels",
        },
        {
            "images": "dataset/images/Norway/train/images",
            "labels": "dataset/images/Norway/train/labels",
        },
        {
            "images": "dataset/images/United_States/train/images",
            "labels": "dataset/images/United_States/train/labels",
        },
    ])

split_and_copy(pairs, output_root="dataset")