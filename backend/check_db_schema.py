import sqlite3
import os

def check_columns():
    db_path = "sql_app.db"
    if not os.path.exists(db_path):
        # Try parent dir if running from backend/
        db_path = os.path.join("..", "sql_app.db")
        if not os.path.exists(db_path):
            print("Database not found.")
            return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(clients)")
    columns = cursor.fetchall()
    
    print("Columns in 'clients' table:")
    for col in columns:
        print(f"- {col[1]} ({col[2]})")
    
    conn.close()

if __name__ == "__main__":
    check_columns()
