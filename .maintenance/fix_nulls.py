import sqlite3
import os

def fix_nulls():
    db_path = "sql_app.db"
    if not os.path.exists(db_path):
        db_path = os.path.join("backend", "sql_app.db")
        if not os.path.exists(db_path):
            print("Database not found.")
            return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Fill numerical nulls with 0
    num_cols = [
        "consumption_kwh", "kwh_value", "credited_balance", "invoice_value", 
        "fixed_cost", "total_invoiced", "total_value", "original_value", 
        "discount", "profit", "kwh_value_original", "kwh_value_injection", 
        "amount_to_collect", "value_without_discount"
    ]
    
    for col in num_cols:
        cursor.execute(f"UPDATE invoices SET {col} = 0 WHERE {col} IS NULL")
        print(f"Updated {cursor.rowcount} rows for column {col}")

    # Fill text nulls
    cursor.execute("UPDATE invoices SET status = 'aberto' WHERE status IS NULL")
    print(f"Updated {cursor.rowcount} rows for column status")
    
    cursor.execute("UPDATE invoices SET invoice_number = '' WHERE invoice_number IS NULL")
    print(f"Updated {cursor.rowcount} rows for column invoice_number")

    # Fill boolean nulls
    bool_cols = ["status_cobrado", "status_pago", "status_recebido"]
    for col in bool_cols:
        cursor.execute(f"UPDATE invoices SET {col} = 0 WHERE {col} IS NULL")
        print(f"Updated {cursor.rowcount} rows for column {col}")

    conn.commit()
    conn.close()
    print("Database data cleanup completed.")

if __name__ == "__main__":
    fix_nulls()
