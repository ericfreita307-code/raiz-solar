from backend.database import SessionLocal
from backend import models

db = SessionLocal()
clients = db.query(models.Client).all()
print(f"Total Clients: {len(clients)}")
for client in clients:
    print(f"ID: {client.id}, Name: {client.name}, UC: {client.uc_number}")
db.close()
