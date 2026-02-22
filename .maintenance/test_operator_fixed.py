
import sys
from pathlib import Path

# Add the root directory to sys.path so we can import backend as a package
root_path = Path(__file__).resolve().parent
sys.path.insert(0, str(root_path))

from backend.database import SessionLocal
from backend import models, schemas, crud

def test_operator_creation():
    print("=== Teste de Criacao de Operador (Fixed Imports) ===\n")
    
    db = SessionLocal()
    
    try:
        # Create test operator
        operator_data = schemas.OperatorCreate(
            full_name="ERIC FREITAS SANTOS",
            email="ericfreita307@gmail.com",
            cpf="04985603503",
            password="test123"
        )
        
        print("Dados do operador:")
        print(f"  Nome: {operator_data.full_name}")
        print(f"  Email: {operator_data.email}")
        
        # Check if email already exists
        existing = crud.get_operator_by_email(db, operator_data.email)
        if existing:
            print(f"Aviso: Email ja cadastrado (ID: {existing.id}). Deletando para re-teste.")
            crud.delete_operator(db, existing.id)
        
        print("Criando operador...")
        new_operator = crud.create_operator(db, operator_data)
        
        print(f"\nSUCESSO! Operador criado:")
        print(f"  ID: {new_operator.id}")
        print(f"  Nome: {new_operator.full_name}")
        
    except Exception as e:
        print(f"\nERRO ao criar operador:")
        print(f"  Tipo: {type(e).__name__}")
        print(f"  Mensagem: {str(e)}")
        import traceback
        traceback.print_exc()
        
    finally:
        db.close()

if __name__ == "__main__":
    test_operator_creation()
