"""Fetch and prepare the app's offline photographs and audio.

Run: python -m pip install -r requirements.txt
     python download_assets.py [--force]

All photos and field recordings come from Wikimedia Commons. The script saves
the exact source, author, license, and modifications in assets/credits.json.
"""

from __future__ import annotations

import argparse
import asyncio
import html
import json
import math
import re
import subprocess
import tempfile
import time
import urllib.parse
import urllib.request
import wave
from urllib.error import HTTPError
from io import BytesIO
from pathlib import Path

import edge_tts
import imageio_ffmpeg
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
IMAGES = ASSETS / "images"
AUDIO = ASSETS / "audio"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "LittleWheels/1.0 (educational offline app; Wikimedia Commons API)"
VOICE = "en-US-AnaNeural"
RATE = "-15%"

# Exact file titles keep the result stable and make editorial review possible.
PHOTOS = {
    "car": "Toyota Corolla E210 sedan Sanming 01 2022-07-27.jpg",
    "bus": "Culver City Bus 7118 R6 LAX City Bus Center.jpg",
    "train": "Indian Pacific passenger train 2025.jpg",
    "airplane": "Pegasus Airlines Boeing 737-800, Munich, April 2019.jpg",
    "ship": "Cruise ship in the Port of Nagasaki, 20240814 0829 3199.jpg",
    "bicycle": "Bike against brick wall (Unsplash).jpg",
    "fire-truck": "Alamogordo ladder truck fire engine.jpg",
    "police-car": "Willimantic police car side view.gk.jpg",
    "ambulance": "Fiat Ambulance in Rome.JPG",
    "helicopter": "N500SY MD500 Helicopter (27035289135).jpg",
}

# Start offsets select the recognisable moment in a longer field recording.
# Each output is a compact, Safari-compatible MP3 of at most 1.5 seconds.
SOUNDS = {
    "car": ("Car Horn.wav", 0.0),
    "bus": ("WWS CityBusMANSG220dooropeningclosing.ogg", 0.0),
    "train": ("2010 UP844 Whistle.ogg", 0.0),
    "airplane": ("Jet airliner overhead.ogg", 0.0),
    "ship": ("Cruise ship Albatros ship horn.ogg", 0.0),
    "bicycle": ("Bicycle-bell-1.wav", 0.0),
    "fire-truck": ("WWS Fireenginesiren.ogg", 0.0),
    "police-car": ("American police siren i.ogg", 0.0),
    "ambulance": ("AmbulanceSound1.wav", 0.0),
    "helicopter": ("Helicopter over a lake.ogg", 0.0),
    "applause": ("Clapping hurray (cropped).oga", 0.0),
    "star": ("Airplane Chime Sound Effect.ogg", 0.0),
    "wrong": ("Error Sound 1 (Gravity Sound).wav", 0.0),
}

DIRECT_AUDIO_URLS = {
    "star": "https://upload.wikimedia.org/wikipedia/commons/c/ce/Airplane_Chime_Sound_Effect.ogg",
    "wrong": "https://upload.wikimedia.org/wikipedia/commons/d/da/Error_Sound_1_%28Gravity_Sound%29.wav",
}

WORDS = {
    "car": "Car", "bus": "Bus", "train": "Train", "airplane": "Airplane",
    "ship": "Ship", "bicycle": "Bicycle", "fire-truck": "Fire truck",
    "police-car": "Police car", "ambulance": "Ambulance",
    "helicopter": "Helicopter",
}


def request(url: str, attempts: int = 4) -> bytes:
    for attempt in range(attempts):
        try:
            # Strip Commons tracking parameters; the canonical upload URL is
            # friendlier to mirrors and avoids needlessly repeated cache keys.
            clean_url = url if "api.php" in url else url.split("?", 1)[0]
            req = urllib.request.Request(clean_url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=45) as response:
                return response.read()
        except HTTPError as error:
            if error.code == 429:
                wait = min(int(error.headers.get("Retry-After", "4")), 4)
                time.sleep(max(wait, 3) * (attempt + 1))
                continue
            if attempt == attempts - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
        except Exception:
            if attempt == attempts - 1:
                raise
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError("Download failed")


def commons_info(title: str, thumbnail_width: int | None = None) -> dict:
    params = {
        "action": "query", "format": "json", "titles": "File:" + title,
        "prop": "imageinfo", "iiprop": "url|size|extmetadata",
    }
    if thumbnail_width:
        params["iiurlwidth"] = str(thumbnail_width)
    data = json.loads(request(API + "?" + urllib.parse.urlencode(params)))
    page = next(iter(data["query"]["pages"].values()))
    if "imageinfo" not in page:
        raise ValueError(f"Commons file not found: {title}")
    return page["imageinfo"][0]


def plain(value: str) -> str:
    return html.unescape(re.sub(r"<[^>]*>", "", value)).strip()


def credit(title: str, info: dict, output: str, modification: str) -> dict:
    meta = info.get("extmetadata", {})
    field = lambda name: plain(meta.get(name, {}).get("value", ""))
    return {
        "output": output,
        "source_title": title,
        "source_page": "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(title.replace(" ", "_")),
        "author": field("Artist") or "See source page",
        "license": field("LicenseShortName") or "See source page",
        "license_url": field("LicenseUrl"),
        "modification": modification,
    }


def save_photo(key: str, title: str, force: bool) -> dict:
    target = IMAGES / f"{key}.webp"
    info = commons_info(title, thumbnail_width=1600) if force or not target.exists() else {"extmetadata": {}}
    if force or not target.exists():
        source = info.get("thumburl") or info["url"]
        image = Image.open(BytesIO(request(source)))
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageOps.fit(image, (1200, 900), method=Image.Resampling.LANCZOS)
        image.save(target, "WEBP", quality=83, method=6)
        print(f"photo {key}: {target.stat().st_size // 1024} KB", flush=True)
    return credit(title, info, str(target.relative_to(ROOT)).replace("\\", "/"),
                  "Center cropped to 4:3, resized to 1200x900 and converted to WebP")


def ffmpeg_convert(source: Path, target: Path, offset: float, duration: float) -> None:
    command = [imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error",
               "-y", "-ss", str(offset), "-i", str(source), "-t", str(duration),
               "-af", "afade=t=out:st=" + str(max(0, duration - 0.12)) + ":d=0.12",
               "-ac", "1", "-ar", "44100", "-b:a", "112k", str(target)]
    subprocess.run(command, check=True, capture_output=True)


def fallback_tone(target: Path, kind: str) -> None:
    """Keep feedback usable if Commons temporarily rate-limits a download."""
    wav_path = target.with_suffix(".wav")
    rate = 44100
    duration = 0.85
    frequencies = (880, 1175) if kind == "star" else (260, 190)
    with wave.open(str(wav_path), "w") as stream:
        stream.setnchannels(1); stream.setsampwidth(2); stream.setframerate(rate)
        frames = bytearray()
        for index in range(int(rate * duration)):
            t = index / rate
            freq = frequencies[min(int(t / (duration / len(frequencies))), len(frequencies) - 1)]
            envelope = min(1, t * 35) * max(0, 1 - t / duration)
            frames += int(12000 * envelope * math.sin(2 * math.pi * freq * t)).to_bytes(2, "little", signed=True)
        stream.writeframes(frames)
    ffmpeg_convert(wav_path, target, 0, duration)
    wav_path.unlink(missing_ok=True)


def save_sound(key: str, title: str, offset: float, force: bool) -> dict:
    target = AUDIO / f"{key}-fx.mp3"
    if key in DIRECT_AUDIO_URLS:
        info = {"url": DIRECT_AUDIO_URLS[key], "extmetadata": {"LicenseShortName": {"value": "See source page"}}}
    elif force or not target.exists():
        info = commons_info(title)
    else:
        info = {"extmetadata": {}}
    if force or not target.exists():
        suffix = Path(title).suffix or ".audio"
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / ("source" + suffix)
            try:
                source.write_bytes(request(info["url"]))
                ffmpeg_convert(source, target, offset, 1.5 if key not in ("applause", "star", "wrong") else 1.0)
            except Exception as error:
                if key not in ("star", "wrong"):
                    raise
                print(f"sound {key}: Commons unavailable ({error}); generated a local feedback tone", flush=True)
                fallback_tone(target, key)
        print(f"sound {key}: {target.stat().st_size // 1024} KB", flush=True)
    return credit(title, info, str(target.relative_to(ROOT)).replace("\\", "/"),
                  f"Trimmed from {offset:.1f}s, limited to 1.5s (1.0s for feedback), fade out, converted to mono MP3")


async def save_voices(force: bool) -> None:
    scripts = {**{f"{key}-word": word for key, word in WORDS.items()},
               **{f"{key}-question": f"Where is the {word.lower()}?" for key, word in WORDS.items()},
               "try-again": "Try again"}
    for key, phrase in scripts.items():
        target = AUDIO / f"{key}.mp3"
        if force or not target.exists():
            await edge_tts.Communicate(phrase, VOICE, rate=RATE).save(str(target))
            print(f"voice {key}: {target.stat().st_size // 1024} KB", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="Refresh all assets")
    args = parser.parse_args()
    IMAGES.mkdir(parents=True, exist_ok=True)
    AUDIO.mkdir(parents=True, exist_ok=True)
    previous_credits = {}
    credits_path = ASSETS / "credits.json"
    if credits_path.exists():
        try:
            previous_credits = {item["source_title"]: item for item in json.loads(credits_path.read_text(encoding="utf-8")).get("items", [])}
        except (OSError, ValueError, KeyError):
            previous_credits = {}
    credits = []
    for key, title in PHOTOS.items():
        credits.append(save_photo(key, title, args.force))
    for key, (title, offset) in SOUNDS.items():
        credits.append(save_sound(key, title, offset, args.force))
    for item in credits:
        old = previous_credits.get(item["source_title"], {})
        if item["author"] == "See source page" and old.get("author"):
            item["author"] = old["author"]
        if item["license"] == "See source page" and old.get("license"):
            item["license"] = old["license"]
        if not item["license_url"] and old.get("license_url"):
            item["license_url"] = old["license_url"]
    asyncio.run(save_voices(args.force))
    (ASSETS / "credits.json").write_text(json.dumps({
        "note": "Wikimedia Commons photographs and recordings; see each source page for full attribution and license terms. All transformed assets are distributed under their source license.",
        "voice": {"service": "Microsoft Edge TTS via edge-tts", "voice": VOICE, "rate": RATE,
                  "phrases": "10 words, 10 game questions, and Try again"},
        "items": credits,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Done. Assets are ready for offline use.")


if __name__ == "__main__":
    main()
