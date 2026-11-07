"""Generate the Little Fruits voice prompts with Microsoft Edge TTS.

Run after installing requirements.txt:
    python generate_fruit_audio.py
"""

from __future__ import annotations

import argparse
import asyncio
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "fruit-assets" / "audio"
VOICE = "en-US-AnaNeural"
RATE = "-15%"
FRUITS = {
    "apple": "apple",
    "banana": "banana",
    "orange": "orange",
    "strawberry": "strawberry",
    "watermelon": "watermelon",
    "grape": "grape",
    "pear": "pear",
    "pineapple": "pineapple",
}


async def save_voices(force: bool) -> None:
    phrases: dict[str, str] = {
        "lets-learn-fruit": "Let's learn fruit!",
        "great-job": "Great job!",
        "try-again": "Try again.",
    }
    for key, word in FRUITS.items():
        article = "an" if word[0] in "aeiou" else "a"
        phrases[f"{key}-word"] = word.capitalize()
        phrases[f"{key}-sentence"] = f"This is {article} {word}."
        phrases[f"{key}-question"] = f"Where is the {word}?"

    AUDIO.mkdir(parents=True, exist_ok=True)
    for key, phrase in phrases.items():
        target = AUDIO / f"{key}.mp3"
        if force or not target.exists():
            await edge_tts.Communicate(phrase, VOICE, rate=RATE).save(str(target))
            print(f"voice {key}: {target.stat().st_size // 1024} KB", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--force", action="store_true", help="Regenerate existing files")
    args = parser.parse_args()
    asyncio.run(save_voices(args.force))


if __name__ == "__main__":
    main()
