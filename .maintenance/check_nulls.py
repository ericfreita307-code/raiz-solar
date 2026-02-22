import sqlite3
import os

def check_nulls():
    db_path = "sql_app.db"
    if not os.path.exists(db_path):
        db_path = os.path.join("backend", "sql_app.db")
        if not os.path.exists(db_path):
            print("Database not found.")
            return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM invoices")
    rows = cursor.fetchall()
    
    cursor.execute("PRAGMA table_info(invoices)")
    cols = [c[1] for c in cursor.fetchall()]
    
    print(f"Total invoices: {len(rows)}")
    for i, row in enumerate(rows):
        print(f"Invoice {i}:")
        for col_name, val in zip(cols, row):
            if val is None:
                print(f"  !! {col_name} is NULL")
    
    conn.close()

if __name__ == "__main__":
    check_nulls()
