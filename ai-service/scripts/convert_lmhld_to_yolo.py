import numpy as np
import cv2
from pathlib import Path

LMHLD_DIR = Path("C:/Users/ACER/sadakSewa/ai-service/LMHLD/LMHLD/Comparison_dataset_same_patch_size")
DATASET_DIR = Path("C:/Users/ACER/sadakSewa/ai-service/dataset")

# Load data
train_imgs = np.load(str(LMHLD_DIR / "train_images.npy"))   # (6990, 4, 128, 128)
train_lbls = np.load(str(LMHLD_DIR / "train_labels.npy"))   # (6990, 1, 128, 128)
val_imgs   = np.load(str(LMHLD_DIR / "val_images.npy"))     # (1997, 4, 128, 128)
val_lbls   = np.load(str(LMHLD_DIR / "val_labels.npy"))     # (1997, 1, 128, 128)
test_imgs  = np.load(str(LMHLD_DIR / "test_images.npy"))    # (999, 4, 128, 128)
test_lbls  = np.load(str(LMHLD_DIR / "test_labels.npy"))    # (999, 1, 128, 128)

splits = [
    ("train", train_imgs, train_lbls),
    ("val",   val_imgs,   val_lbls),
    ("test",  test_imgs,  test_lbls),
]

for split_name, images, labels in splits:
    img_dir = DATASET_DIR / "images" / split_name
    lbl_dir = DATASET_DIR / "labels" / split_name
    img_dir.mkdir(parents=True, exist_ok=True)
    lbl_dir.mkdir(parents=True, exist_ok=True)

    n = images.shape[0]
    for i in range(n):
        # Convert from (C, H, W) to (H, W, C), take first 3 channels
        img = images[i].transpose(1, 2, 0)  # (128, 128, 4)
        img_rgb = img[:, :, :3]
        img_rgb = np.clip(img_rgb * 255, 0, 255).astype(np.uint8)

        fname = f"lmhld_{split_name}_{i:05d}.jpg"
        cv2.imwrite(str(img_dir / fname), cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR))

        # Extract mask (H, W)
        mask = labels[i, 0]  # (128, 128)
        mask_bin = (mask > 0.5).astype(np.uint8) * 255

        # Find contours (bounding boxes from connected components)
        contours, _ = cv2.findContours(mask_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        label_lines = []
        H, W = 128, 128
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            cx = (x + w / 2) / W
            cy = (y + h / 2) / H
            nw = w / W
            nh = h / H
            cx = max(0.0, min(1.0, cx))
            cy = max(0.0, min(1.0, cy))
            nw = max(0.0, min(1.0, nw))
            nh = max(0.0, min(1.0, nh))
            label_lines.append(f"4 {cx:.6f} {cy:.6f} {nw:.6f} {nh:.6f}")

        lbl_path = lbl_dir / (fname.rsplit(".", 1)[0] + ".txt")
        lbl_path.write_text("\n".join(label_lines))

    print(f"{split_name}: {n} images, labels written")

print("LMHLD conversion complete!")
