# utils/exif_utils.py
#
# Extracts GPS latitude/longitude from an image's EXIF metadata.
# Returns None if the image has no GPS tags (e.g. screenshots,
# stripped metadata, or non-camera images).

from pathlib import Path
from typing import Optional, Tuple

import exifread


def _to_decimal_degrees(value) -> float:
    d = float(value.values[0].num) / float(value.values[0].den)
    m = float(value.values[1].num) / float(value.values[1].den)
    s = float(value.values[2].num) / float(value.values[2].den)
    return d + (m / 60.0) + (s / 3600.0)


def extract_gps(image_path: Path) -> Optional[Tuple[float, float]]:
    with open(image_path, "rb") as f:
        tags = exifread.process_file(f, details=False)

    lat_tag = tags.get("GPS GPSLatitude")
    lat_ref = tags.get("GPS GPSLatitudeRef")
    lon_tag = tags.get("GPS GPSLongitude")
    lon_ref = tags.get("GPS GPSLongitudeRef")

    if not (lat_tag and lat_ref and lon_tag and lon_ref):
        return None

    latitude = _to_decimal_degrees(lat_tag)
    if str(lat_ref.values[0]).upper() != "N":
        latitude = -latitude

    longitude = _to_decimal_degrees(lon_tag)
    if str(lon_ref.values[0]).upper() != "E":
        longitude = -longitude

    return round(latitude, 6), round(longitude, 6)
