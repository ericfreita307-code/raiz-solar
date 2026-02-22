"""
Script to diagnose operator creation issues
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "backend" / "sql_app.db"

print("=== Diagnostico do Sistema de Operadores ===\n")

# Check if database exists
if not DB_PATH.exists():
    print("ERRO: Banco de dados nao encontrado!")
    print(f"   Esperado em: {DB_PATH}")
    exit(1)

print(f"OK: Banco de dados encontrado: {DB_PATH}\n")

# Connect and check tables
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]

print("Tabelas no banco de dados:")
for table in tables:
    print(f"   - {table}")

# Check if operators table exists
if 'operators' in tables:
    print("\nOK: Tabela 'operators' existe!")
    
    # Check table structure
    cursor.execute("PRAGMA table_info(operators)")
    columns = cursor.fetchall()
    
    print("\nEstrutura da tabela 'operators':")
    for col in columns:
        print(f"   - {col[1]} ({col[2]})")
    
    # Count operators
    cursor.execute("SELECT COUNT(*) FROM operators")
    count = cursor.fetchone()[0]
    print(f"\nTotal de operadores cadastrados: {count}")
    
else:
    print("\nERRO: Tabela 'operators' NAO EXISTE!")
    print("   Execute: python migrate_operators.py")

conn.close()

# Check if bcrypt is installed
print("\n=== Verificando Dependencias ===")
try:
    import bcrypt
    print("OK: bcrypt instalado")
    
    # Test password hashing
    pwd_bytes = "test123".encode('utf-8')
    salt = bcrypt.gensalt()
    test_hash = bcrypt.hashpw(pwd_bytes, salt)
    print("OK: bcrypt funcionando")
    
except ImportError as e:
    print(f"ERRO ao importar bcrypt: {e}")
    print("   Execute: pip install bcrypt")


print("\n=== Diagnostico Completo ===")

