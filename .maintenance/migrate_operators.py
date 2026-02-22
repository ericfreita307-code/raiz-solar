"""
Database migration script to create the operators table.
Run this script to add the operators table to your existing database.
"""

import sqlite3
from pathlib import Path

# Path to the database
DB_PATH = Path(__file__).parent / "backend" / "sql_app.db"

def migrate():
    print("Starting migration: Creating operators table...")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if table already exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='operators'
        """)
        
        if cursor.fetchone():
            print("WARNING: Table 'operators' already exists. Skipping creation.")
            conn.close()
            return
        
        # Create operators table
        cursor.execute("""
            CREATE TABLE operators (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                full_name VARCHAR NOT NULL,
                email VARCHAR NOT NULL UNIQUE,
                cpf VARCHAR NOT NULL UNIQUE,
                hashed_password VARCHAR NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("""
            CREATE INDEX idx_operators_email ON operators(email)
        """)
        
        cursor.execute("""
            CREATE INDEX idx_operators_cpf ON operators(cpf)
        """)
        
        conn.commit()
        print("SUCCESS: Migration completed successfully!")
        print("   - Created 'operators' table")
        print("   - Created indexes on email and cpf")
        
    except sqlite3.Error as e:
        print(f"ERROR during migration: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate()
