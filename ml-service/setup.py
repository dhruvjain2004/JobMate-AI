"""
Setup script for ML Service
Automates initial setup and model downloads
"""
import subprocess
import sys
import os
from pathlib import Path


def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"\n{'='*60}")
    print(f"⚙️  {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        print(f"✅ {description} - SUCCESS")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - FAILED")
        print(f"Error: {e.stderr}")
        return False


def check_python_version():
    """Check if Python version is compatible"""
    print("\n🔍 Checking Python version...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 9:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Incompatible")
        print("⚠️  Python 3.9 or higher is required")
        return False


def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    directories = ['logs', 'models', 'data', 'cache']
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created: {directory}/")
    
    return True


def install_dependencies():
    """Install Python dependencies"""
    if not run_command(
        f"{sys.executable} -m pip install --upgrade pip",
        "Upgrading pip"
    ):
        return False
    
    if not run_command(
        f"{sys.executable} -m pip install -r requirements.txt",
        "Installing dependencies"
    ):
        return False
    
    return True


def download_spacy_model():
    """Download spaCy language model"""
    return run_command(
        f"{sys.executable} -m spacy download en_core_web_md",
        "Downloading spaCy model (en_core_web_md)"
    )


def create_env_file():
    """Create .env file from example"""
    print("\n📝 Setting up environment file...")
    
    if os.path.exists('.env'):
        print("⚠️  .env file already exists. Skipping...")
        return True
    
    if os.path.exists('.env.example'):
        try:
            with open('.env.example', 'r') as src:
                content = src.read()
            
            with open('.env', 'w') as dst:
                dst.write(content)
            
            print("✅ Created .env file from .env.example")
            print("⚠️  Please edit .env with your configuration")
            return True
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")
            return False
    else:
        print("❌ .env.example not found")
        return False


def verify_installation():
    """Verify that everything is installed correctly"""
    print("\n🔍 Verifying installation...")
    
    checks = []
    
    # Check FastAPI
    try:
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
        checks.append(True)
    except ImportError:
        print("❌ FastAPI not found")
        checks.append(False)
    
    # Check spaCy
    try:
        import spacy
        print(f"✅ spaCy {spacy.__version__}")
        
        # Check if model is available
        try:
            nlp = spacy.load("en_core_web_md")
            print("✅ spaCy model (en_core_web_md) loaded successfully")
            checks.append(True)
        except OSError:
            print("❌ spaCy model (en_core_web_md) not found")
            checks.append(False)
    except ImportError:
        print("❌ spaCy not found")
        checks.append(False)
    
    # Check scikit-learn
    try:
        import sklearn
        print(f"✅ scikit-learn {sklearn.__version__}")
        checks.append(True)
    except ImportError:
        print("❌ scikit-learn not found")
        checks.append(False)
    
    # Check SHAP
    try:
        import shap
        print(f"✅ SHAP {shap.__version__}")
        checks.append(True)
    except ImportError:
        print("❌ SHAP not found")
        checks.append(False)
    
    # Check pandas
    try:
        import pandas
        print(f"✅ pandas {pandas.__version__}")
        checks.append(True)
    except ImportError:
        print("❌ pandas not found")
        checks.append(False)
    
    return all(checks)


def print_next_steps():
    """Print next steps for the user"""
    print("\n" + "="*60)
    print("🎉 Setup Complete!")
    print("="*60)
    print("\n📋 Next Steps:")
    print("\n1. Edit .env file with your configuration:")
    print("   - Set SHARED_SECRET (must match Node.js backend)")
    print("   - Set NODE_BACKEND_URL")
    print("   - Configure other settings as needed")
    print("\n2. Start the ML service:")
    print("   python main.py")
    print("\n3. Test the service:")
    print("   curl http://localhost:8000/api/ml/health")
    print("\n4. View API documentation:")
    print("   http://localhost:8000/api/ml/docs")
    print("\n" + "="*60)


def main():
    """Main setup function"""
    print("\n" + "="*60)
    print("🚀 JobMate AI - ML Service Setup")
    print("="*60)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create directories
    if not create_directories():
        print("\n❌ Setup failed at directory creation")
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Setup failed at dependency installation")
        sys.exit(1)
    
    # Download spaCy model
    if not download_spacy_model():
        print("\n⚠️  spaCy model download failed. You can download it manually:")
        print("   python -m spacy download en_core_web_md")
    
    # Create .env file
    create_env_file()
    
    # Verify installation
    if not verify_installation():
        print("\n⚠️  Some components failed verification")
        print("Please check the errors above and fix them")
    
    # Print next steps
    print_next_steps()


if __name__ == "__main__":
    main()
