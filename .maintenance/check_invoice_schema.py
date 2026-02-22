import sqlite3
import os

def check_structure():
    db_path = "sql_app.db"
    if not os.path.exists(db_path):
        db_path = os.path.join("backend", "sql_app.db")
        if not os.path.exists(db_path):
            print("Database not found.")
            return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- Structure of 'invoices' table ---")
    cursor.execute("PRAGMA table_info(invoices)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"ID: {col[0]}, Name: {col[1]}, Type: {col[2]}")
    
    conn.close()

if __name__ == "__main__":
    check_structure()
