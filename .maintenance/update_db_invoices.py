import sqlite3
import os

def update_invoices_table():
    db_path = "sql_app.db"
    if not os.path.exists(db_path):
        # Try parent dir if running from backend/
        db_path = os.path.join("..", "sql_app.db")
        if not os.path.exists(db_path):
            print("Database not found.")
            return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("invoice_number", "TEXT"),
        ("kwh_value_original", "REAL"),
        ("kwh_value_injection", "REAL"),
        ("amount_to_collect", "REAL"),
        ("value_without_discount", "REAL"),
        ("status", "TEXT DEFAULT 'aberto'")
    ]

    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE invoices ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name} to invoices table.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists.")
            else:
                print(f"Error adding column {col_name}: {e}")

    conn.commit()
    conn.close()
    print("Database migration for invoices completed.")

if __name__ == "__main__":
    update_invoices_table()
