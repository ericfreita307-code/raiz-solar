import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    print("Importing models...")
    from backend import models
    print("Models imported.")

    print("Importing schemas...")
    from backend import schemas
    print("Schemas imported.")

    print("Importing crud...")
    from backend import crud
    print("CRUD imported.")

    print("Importing main...")
    from backend import main
    print("Main imported. Backend code seems valid.")

except Exception as e:
    print(f"\nCRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
