import os
import sys
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    uri = os.getenv("MONGO_URI")
    db_name = os.getenv("MONGO_DB_NAME") or os.getenv("MONGO_DATABASE")
    print("=" * 60)
    print("MongoDB Atlas Connection Diagnostic")
    print("=" * 60)
    if not uri:
        print("[FAIL] MONGO_URI is not set in backend/.env")
        return

    # Mask password for display
    masked_uri = uri
    if "@" in uri and "://" in uri:
        scheme, rest = uri.split("://", 1)
        creds, host = rest.split("@", 1)
        user = creds.split(":", 1)[0]
        masked_uri = f"{scheme}://{user}:****@{host}"

    print(f"Target URI : {masked_uri}")
    print(f"Target DB  : {db_name or '(default: ai_game_referee)'}")
    print("-" * 60)
    print("Testing connection to MongoDB cluster...")

    from pymongo import MongoClient
    from pymongo.errors import ServerSelectionTimeoutError, OperationFailure, ConfigurationError

    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=7000)
        # Test ping
        client.admin.command('ping')
        print("[SUCCESS] Connected to MongoDB Atlas cluster!")
        
        # Test listing databases
        try:
            dbs = client.list_database_names()
            print(f"[SUCCESS] Accessible databases on cluster: {dbs}")
        except Exception as e:
            print(f"[INFO] Ping succeeded, but list_database_names restricted: {e}")

        # Test writing / reading
        target_db = client.get_database(db_name) if db_name else client.get_default_database(default='ai_game_referee')
        print(f"[SUCCESS] Selected database: '{target_db.name}'")
        colls = target_db.list_collection_names()
        print(f"[SUCCESS] Collections in '{target_db.name}': {colls}")

    except ServerSelectionTimeoutError as e:
        print("\n[FAILED] ServerSelectionTimeoutError:")
        print("  -> Could not connect to MongoDB Atlas within 7 seconds.")
        print("  -> CAUSE: Your IP address is likely not whitelisted in MongoDB Atlas Network Access.")
        print("  -> FIX  : In MongoDB Atlas (cloud.mongodb.com):")
        print("            1. Go to 'Network Access' on the left menu.")
        print("            2. Click 'Add IP Address'.")
        print("            3. Select 'Allow Access from Anywhere' (0.0.0.0/0) or 'Add Current IP Address'.")
        print("            4. Confirm and wait 1 minute for deployment.")
    except OperationFailure as e:
        print(f"\n[FAILED] OperationFailure (Authentication/Authorization error): {e}")
        print("  -> CAUSE: Wrong username/password, or user lacks read/write permissions on the database.")
        print("  -> FIX  : Check 'Database Access' in MongoDB Atlas and verify user privileges.")
    except ConfigurationError as e:
        print(f"\n[FAILED] ConfigurationError: {e}")
        print("  -> CAUSE: Invalid MongoDB URI syntax or DNS resolution failed.")
    except Exception as e:
        print(f"\n[FAILED] Unexpected error: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test_connection()

