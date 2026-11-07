"""Download and prepare real, traceable body photographs from Wikimedia Commons.

The body lesson intentionally uses photographs rather than illustrations or
AI-generated images. Each output keeps its source title, author, license and
transformation details in assets/credits.json.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import time
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
IMAGES = ASSETS / "images"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "TreehouseEnglish/1.0 (offline educational app; Wikimedia Commons)"


SOURCES = {
    "body-character": {
        "title": "Smiling Lao woman with short hair and red shirt.jpg",
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Smiling_Lao_woman_with_short_hair_and_red_shirt.jpg/1280px-Smiling_Lao_woman_with_short_hair_and_red_shirt.jpg",
        "license": "CC BY-SA 4.0",
        "centering": (0.5, 0.45),
        "description": "Real portrait photograph used as the lesson's consistent person reference.",
    },
    "head": {
        "title": "Smiling Lao woman with short hair and red shirt.jpg",
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Smiling_Lao_woman_with_short_hair_and_red_shirt.jpg/1280px-Smiling_Lao_woman_with_short_hair_and_red_shirt.jpg",
        "license": "CC BY-SA 4.0",
        "centering": (0.5, 0.22),
        "description": "Portrait crop from the same real photograph used for the head card.",
    },
    "eyes": {
        "title": "Human eye close up, anterior view.jpg",
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/Human_eye_close_up%2C_anterior_view.jpg/1280px-Human_eye_close_up%2C_anterior_view.jpg",
        "license": "CC BY-SA 4.0",
        "centering": (0.5, 0.5),
        "description": "Real close-up photograph of a human eye.",
    },
    "ears": {
        "title": "Close up of man's ear.jpg",
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Close_up_of_man%27s_ear.jpg/1280px-Close_up_of_man%27s_ear.jpg",
        "license": "CC BY-SA 4.0",
        "centering": (0.5, 0.5),
        "description": "Real close-up photograph of a human ear.",
    },
    "nose": {
        "title": "Nose (417653250).jpg",
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Nose_%28417653250%29.jpg/1280px-Nose_%28417653250%29.jpg",
        "license": "CC BY 2.0",
        "centering": (0.5, 0.5),
        "description": "Real close-up photograph showing a human nose in profile.",
    },
    "mouth": {
        "title": "Adult human mouth.jpg",
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Adult_human_mouth.jpg/1280px-Adult_human_mouth.jpg",
        "license": "CC BY-SA 4.0",
        "centering": (0.5, 0.5),
        "description": "Real close-up photograph of an adult human mouth.",
    },
    "hands": {
        "title": "Human-Hands-Front-Back.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/3/32/Human-Hands-Front-Back.jpg",
        "license": "CC BY-SA 3.0",
        "centering": (0.5, 0.5),
        "description": "Real photograph of human hands, front and back.",
    },
    "feet": {
        "title": "Asia feet 3.jpg",
        "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Asia_feet_3.jpg/1280px-Asia_feet_3.jpg",
        "license": "CC0",
        "centering": (0.5, 0.5),
        "description": "Real photograph of human feet.",
    },
    "tummy": {
        "title": "Alfie Williams in white t-shirt.jpg",
        "url": "https://upload.wikimedia.org/wikipedia/commons/d/de/Alfie_Williams_in_white_t-shirt.jpg",
        "license": "CC BY-SA 4.0",
        "centering": (0.5, 0.78),
        "description": "Clothed torso crop from a real photograph used for the tummy card.",
    },
}


def request(url: str) -> bytes:
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=45) as response:
                return response.read()
        except Exception:
            if attempt == 4:
                raise
            time.sleep(2 + attempt * 2)
    raise RuntimeError("Download failed")


def commons_info(title: str) -> dict:
    params = {
        "action": "query", "format": "json", "titles": "File:" + title,
        "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": "1600",
    }
    data = json.loads(request(API + "?" + urllib.parse.urlencode(params)))
    page = next(iter(data["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise ValueError(f"Commons file not found: {title}")
    return page["imageinfo"][0]


def plain(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]*>", "", value)).strip()


def make_credit(key: str, source: dict, info: dict) -> dict:
    metadata = info.get("extmetadata", {})
    field = lambda name: plain(metadata.get(name, {}).get("value", ""))
    title = source["title"]
    return {
        "output": f"lessons/body/assets/images/{key}.webp",
        "source_title": title,
        "source_page": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(title.replace(" ", "_")),
        "author": field("Artist") or "See source page",
        "license": source.get("license") or field("LicenseShortName") or "See source page",
        "license_url": field("LicenseUrl"),
        "modification": f"{source['description']} Center cropped to 1200x900 and converted to WebP.",
        "real_photo": True,
    }


def save_one(key: str, source: dict, force: bool) -> dict:
    target = IMAGES / f"{key}.webp"
    info = {"url": source["url"], "extmetadata": {}}
    if force or not target.exists() or target.stat().st_size == 0:
        image = Image.open(BytesIO(request(source["url"])))
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageOps.fit(image, (1200, 900), method=Image.Resampling.LANCZOS, centering=source["centering"])
        image.save(target, "WEBP", quality=86, method=6)
        print(f"photo {key}: {target.stat().st_size // 1024} KB")
    return make_credit(key, source, info)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="refresh all body photographs")
    args = parser.parse_args()
    IMAGES.mkdir(parents=True, exist_ok=True)
    credits = [save_one(key, source, args.force) for key, source in SOURCES.items()]
    (ASSETS / "credits.json").write_text(json.dumps({
        "note": "All Little Body image assets are real photographs downloaded from Wikimedia Commons. No illustrations, emoji or AI-generated images are used.",
        "asset_policy": "real_photographs_only",
        "items": credits,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Done. Real body photographs and credits are ready for offline use.")


if __name__ == "__main__":
    main()
