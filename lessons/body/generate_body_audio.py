"""Generate Little Body audio with the same local Edge TTS setup as the other lessons."""

from __future__ import annotations

import argparse
import asyncio
import subprocess
import tempfile
from pathlib import Path

import edge_tts
import imageio_ffmpeg


VOICE = "en-US-AnaNeural"
RATE = "-15%"
OUT_DIR = Path(__file__).resolve().parent / "assets" / "audio"
SAPI_SCRIPT = Path(__file__).resolve().parent / "sapi_synthesize.ps1"


PHRASES = {
    "lets-learn-body": "Hello! Let's learn about our bodies.",
    "head-word": "Head.",
    "eyes-word": "Eyes.",
    "ears-word": "Ears.",
    "nose-word": "Nose.",
    "mouth-word": "Mouth.",
    "hands-word": "Hands.",
    "feet-word": "Feet.",
    "tummy-word": "Tummy.",
    "touch-your-head": "Touch your head.",
    "touch-your-nose": "Touch your nose.",
    "show-me-your-hands": "Show me your hands.",
    "point-to-your-eyes": "Point to your eyes.",
    "clap-your-hands": "Clap your hands.",
    "where-is-your-nose": "Where is your nose?",
    "where-is-your-head": "Where is your head?",
    "where-is-your-mouth": "Where is your mouth?",
    "where-is-your-tummy": "Where is your tummy?",
    "where-are-your-eyes": "Where are your eyes?",
    "where-are-your-ears": "Where are your ears?",
    "where-are-your-hands": "Where are your hands?",
    "where-are-your-feet": "Where are your feet?",
    "great-job": "Great job!",
    "try-again": "Try again.",
    "we-did-it": "We did it!",
}


def synthesize_offline(name: str, text: str) -> None:
    """Fallback for environments where the Edge TTS websocket is unavailable."""
    with tempfile.TemporaryDirectory(prefix="little-body-") as temp_dir:
        wav = Path(temp_dir) / f"{name}.wav"
        subprocess.run([
            "powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(SAPI_SCRIPT),
            "-Text", text, "-OutFile", str(wav)
        ], check=True)
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        target = OUT_DIR / f"{name}.mp3"
        subprocess.run([
            ffmpeg, "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-q:a", "4", str(target)
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


async def synthesize(name: str, text: str, force: bool) -> None:
    target = OUT_DIR / f"{name}.mp3"
    if target.exists() and target.stat().st_size > 0 and not force:
        print(f"skip {target.name}")
        return
    try:
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
        await communicate.save(str(target))
        print(f"wrote {target.name} (Edge TTS)")
    except Exception as error:
        print(f"Edge TTS unavailable for {name}: {error.__class__.__name__}; using Windows voice")
        synthesize_offline(name, text)
        print(f"wrote {target.name} (Windows SAPI fallback)")


async def main(force: bool) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    await asyncio.gather(*(synthesize(name, text, force) for name, text in PHRASES.items()))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="overwrite existing files")
    args = parser.parse_args()
    asyncio.run(main(args.force))
