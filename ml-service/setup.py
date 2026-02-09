"""
Setup script for ML Service (Render-safe)
No spaCy, no heavy ML installs
Pre-downloads NLTK data to prevent runtime failures
"""

import sys
from pathlib import Path
import nltk


def create_directories():
    for d in ["logs", "models", "data"]:
        Path(d).mkdir(exist_ok=True)


def download_nltk_data():
    """Pre-download NLTK data to avoid runtime downloads."""
    try:
        print("📥 Downloading NLTK data...")
        nltk.download("punkt", quiet=True)
        nltk.download("stopwords", quiet=True)
        print("✅ NLTK data downloaded")
    except Exception as e:
        print(f"⚠️ NLTK download failed: {e}")
        print("ℹ️ Will download at runtime if needed")


def main():
    print("🚀 ML Service setup (Render-safe)")
    print(f"Python version: {sys.version}")

    create_directories()
    download_nltk_data()
    print("ℹ️ Dependencies handled by Render build step")
    print("✅ Setup complete")


if __name__ == "__main__":
    main()
