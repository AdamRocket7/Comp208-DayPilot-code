import subprocess
import sys

REQUIRED_LIBRARIES = [
    "fastapi",
    "uvicorn",
    "sqlalchemy",
    "passlib[bcrypt]",
    "python-jose",
    "pyjwt",
    "requests",
    "pytest",
    "pydantic"
]

def ensure_dependencies():
    for lib in REQUIRED_LIBRARIES:
        try:
            __import__(lib.split("[")[0])
        except ImportError:
            print(f"Installing missing library: {lib}")
            subprocess.check_call([sys.executable, "-m", "pip", "install", lib])
