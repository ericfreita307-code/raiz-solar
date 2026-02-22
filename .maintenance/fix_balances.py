import sqlite3
import os

def inspect_and_fix():
    db_path = "sql_app.db"
    if not os.path.exists(db_path):
        db_path = os.path.join("..", "sql_app.db")
    
    if not os.path.exists(db_path):
        print("Database not found")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("--- Clients ---")
    cursor.execute("SELECT id, name, current_credits FROM clients")
    clients = cursor.fetchall()
    for c in clients:
        print(f"ID: {c[0]}, Name: {c[1]}, Credits: {c[2]}")

    print("\n--- Invoices ---")
    cursor.execute("SELECT id, client_id, month, credited_balance FROM invoices")
    invoices = cursor.fetchall()
    for i in invoices:
        print(f"ID: {i[0]}, Client: {i[1]}, Month: {i[2]}, Used: {i[3]}")

    print("\n--- Productions (Distributed) ---")
    # Join production with plant distributions to see what was added to each client
    cursor.execute("""
        SELECT p.month, d.client_id, (d.percentage / 100.0) * p.kwh_generated
        FROM production p
        JOIN plant_distributions d ON p.plant_id = d.plant_id
    """)
    productions = cursor.fetchall()
    for p in productions:
        print(f"Month: {p[0]}, Client: {p[1]}, Added: {p[2]}")

    # OPTIONAL: AUTO-FIX Balance
    # New Balance = (Sum of Additions) - (Sum of Deductions)
    print("\n--- Recalculating Balances ---")
    for client_id, name, _ in clients:
        # Sum additions
        cursor.execute("""
            SELECT SUM((d.percentage / 100.0) * p.kwh_generated)
            FROM production p
            JOIN plant_distributions d ON p.plant_id = d.plant_id
            WHERE d.client_id = ?
        """, (client_id,))
        added = cursor.fetchone()[0] or 0.0
        
        # Sum deductions
        cursor.execute("SELECT SUM(credited_balance) FROM invoices WHERE client_id = ?", (client_id,))
        deducted = cursor.fetchone()[0] or 0.0
        
        new_balance = added - deducted
        print(f"Client {name}: {added} added - {deducted} used = {new_balance} (New Balance)")
        
        # Update
        cursor.execute("UPDATE clients SET current_credits = ? WHERE id = ?", (new_balance, client_id))

    conn.commit()
    conn.close()
    print("\nBalances synchronized with history.")

if __name__ == "__main__":
    inspect_and_fix()
