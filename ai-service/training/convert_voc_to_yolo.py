import xml.etree.ElementTree as ET
from pathlib import Path

CLASS_MAP = {
    "D00": 0,
    "D10": 1,
    "D20": 2,
    "D40": 3,
}


def convert_annotation(xml_path: Path, output_dir: Path):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    size = root.find("size")
    img_w = int(size.find("width").text)
    img_h = int(size.find("height").text)

    yolo_lines = []

    for obj in root.findall("object"):
        class_name = obj.find("name").text

        if class_name not in CLASS_MAP:
            continue

        class_id = CLASS_MAP[class_name]

        bbox = obj.find("bndbox")

        xmin = float(bbox.find("xmin").text)
        ymin = float(bbox.find("ymin").text)
        xmax = float(bbox.find("xmax").text)
        ymax = float(bbox.find("ymax").text)

        x_center = ((xmin + xmax) / 2) / img_w
        y_center = ((ymin + ymax) / 2) / img_h
        width = (xmax - xmin) / img_w
        height = (ymax - ymin) / img_h

        yolo_lines.append(
            f"{class_id} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}"
        )

    if yolo_lines:
        output_file = output_dir / f"{xml_path.stem}.txt"
        output_file.write_text("\n".join(yolo_lines))


def convert_country(country):

    xml_dir = Path(f"dataset/images/{country}/train/annotations/xmls")
    output_dir = Path(f"dataset/images/{country}/train/labels")

    output_dir.mkdir(parents=True, exist_ok=True)

    xml_files = list(xml_dir.glob("*.xml"))

    print(f"{country}: {len(xml_files)} XML files")

    for xml in xml_files:
        convert_annotation(xml, output_dir)


if __name__ == "__main__":

    countries = [
        "India",
        "Japan",
        "China_Motorbike",
        "Czech",
        "Norway",
        "United_States"
    ]

    for country in countries:
        convert_country(country)

    print("\nDone converting every country.")