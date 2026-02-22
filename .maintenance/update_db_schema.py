import sqlite3
import os

db_path = "sql_app.db"

if not os.path.exists(db_path):
    print(f"Database {db_path} not found in {os.getcwd()}")
    # Try parent directory or subdirectory if needed, but usually it's in the root where the server runs
    potential_paths = ["backend/sql_app.db", "../backend/sql_app.db"]
    for p in potential_paths:
        if os.path.exists(p):
            db_path = p
            break

print(f"Connecting to database at: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column_if_not_exists(table, column, type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type}")
        print(f"Added column {column} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print(f"Column {column} already exists in {table}")
        else:
            print(f"Error adding column {column}: {e}")

# Adding new columns to clients table
add_column_if_not_exists("clients", "email", "TEXT")
add_column_if_not_exists("clients", "password", "TEXT")
add_column_if_not_exists("clients", "phone", "TEXT")
add_column_if_not_exists("clients", "payment_day", "INTEGER")

# Create index for email
try:
    cursor.execute("CREATE UNIQUE INDEX ix_clients_email ON clients (email)")
    print("Created unique index on clients(email)")
except sqlite3.OperationalError as e:
    print(f"Index check: {e}")

conn.commit()
conn.close()
print("Database schema update complete.")
