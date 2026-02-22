from backend.database import SessionLocal
from backend import models

def zero_all_credits():
    db = SessionLocal()
    try:
        print("Buscando todos os clientes...")
        clients = db.query(models.Client).all()
        
        if not clients:
            print("Nenhum cliente encontrado.")
            return

        print(f"Encontrados {len(clients)} clientes. Zerando créditos...")
        for client in clients:
            print(f"Zerar créditos de: {client.name} (Saldo atual: {client.current_credits})")
            client.current_credits = 0.0
        
        db.commit()
        print("Créditos de todos os clientes foram zerados com sucesso!")
    except Exception as e:
        print(f"Erro ao processar: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    zero_all_credits()
