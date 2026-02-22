import sqlite3
import os

db_path = "sql_app.db"

if not os.path.exists(db_path):
    print(f"Database {db_path} not found in {os.getcwd()}")
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

# Adding equatorial_invoice_path to invoices table
add_column_if_not_exists("invoices", "equatorial_invoice_path", "TEXT")

conn.commit()
conn.close()
print("Database schema update complete - added equatorial_invoice_path column.")
