import sqlite3
import os

db_path = "sql_app.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

print(f"Database found at {db_path}")
print(f"Size: {os.path.getsize(db_path)} bytes\n")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if invoices table exists
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'")
if cursor.fetchone():
    print("Table 'invoices' exists")
    
    # Check columns
    cursor.execute("PRAGMA table_info(invoices)")
    columns = cursor.fetchall()
    
    print("\nColumns in 'invoices' table:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
    
    # Check if equatorial_invoice_path exists
    column_names = [col[1] for col in columns]
    if 'equatorial_invoice_path' in column_names:
        print("\nColumn 'equatorial_invoice_path' EXISTS")
    else:
        print("\nColumn 'equatorial_invoice_path' NOT FOUND")
        print("Run: py backend/add_equatorial_column.py")
    
    # Count invoices
    cursor.execute("SELECT COUNT(*) FROM invoices")
    count = cursor.fetchone()[0]
    print(f"\nTotal invoices: {count}")
else:
    print("Table 'invoices' does NOT exist")

# Check clients table
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'")
if cursor.fetchone():
    cursor.execute("SELECT COUNT(*) FROM clients")
    count = cursor.fetchone()[0]
    print(f"Total clients: {count}")
else:
    print("Table 'clients' does NOT exist")

conn.close()
print("\nDatabase check complete")
