import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

print("Attempting to import backend.main...")
try:
    from backend import main
    print("Successfully imported backend.main")
except Exception as e:
    print(f"Failed to import backend.main: {e}")
    import traceback
    traceback.print_exc()
