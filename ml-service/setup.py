"""
Setup script for ML Service (Render-safe)
No spaCy, no heavy ML installs
"""

import sys
from pathlib import Path


def create_directories():
    for d in ["logs", "models", "data"]:
        Path(d).mkdir(exist_ok=True)


def main():
    print("🚀 ML Service setup (Render-safe)")
    print(f"Python version: {sys.version}")

    create_directories()
    print("✅ Directories ready")
    print("ℹ️ Dependencies handled by Render build step")
    print("✅ Setup complete")


if __name__ == "__main__":
    main()
