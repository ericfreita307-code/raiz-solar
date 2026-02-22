"""
Script para testar a criacao de operador diretamente no backend
"""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from database import SessionLocal
import models
import schemas
import crud

def test_operator_creation():
    print("=== Teste de Criacao de Operador ===\n")
    
    db = SessionLocal()
    
    try:
        # Create test operator
        operator_data = schemas.OperatorCreate(
            full_name="ERIC FREITAS SANTOS",
            email="ericfreita307@gmail.com",
            cpf="04985603503",  # Without formatting
            password="test123"
        )
        
        print("Dados do operador:")
        print(f"  Nome: {operator_data.full_name}")
        print(f"  Email: {operator_data.email}")
        print(f"  CPF: {operator_data.cpf}")
        print(f"  Senha: {operator_data.password}")
        print()
        
        # Check if email already exists
        existing = crud.get_operator_by_email(db, operator_data.email)
        if existing:
            print(f"ERRO: Email ja cadastrado (ID: {existing.id})")
            print("Deletando operador existente para teste...")
            crud.delete_operator(db, existing.id)
            print("Operador deletado.\n")
        
        print("Criando operador...")
        new_operator = crud.create_operator(db, operator_data)
        
        print(f"\nSUCESSO! Operador criado:")
        print(f"  ID: {new_operator.id}")
        print(f"  Nome: {new_operator.full_name}")
        print(f"  Email: {new_operator.email}")
        print(f"  CPF: {new_operator.cpf}")
        print(f"  Senha hasheada: {new_operator.hashed_password[:50]}...")
        print(f"  Ativo: {new_operator.is_active}")
        print(f"  Criado em: {new_operator.created_at}")
        
    except Exception as e:
        print(f"\nERRO ao criar operador:")
        print(f"  Tipo: {type(e).__name__}")
        print(f"  Mensagem: {str(e)}")
        import traceback
        print(f"\nStack trace:")
        traceback.print_exc()
        
    finally:
        db.close()

if __name__ == "__main__":
    test_operator_creation()
