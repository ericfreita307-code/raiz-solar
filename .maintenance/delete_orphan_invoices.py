from backend.database import SessionLocal
from backend import models

def delete_orphan_invoices():
    db = SessionLocal()
    try:
        # Get all client IDs
        clients = db.query(models.Client).all()
        client_ids = [c.id for c in clients]
        print(f"Existing client IDs: {client_ids}")

        # Find invoices with client_id not in existing client IDs
        orphan_invoices = db.query(models.Invoice).filter(~models.Invoice.client_id.in_(client_ids)).all()
        
        if not orphan_invoices:
            print("No orphan invoices found.")
            return

        print(f"Found {len(orphan_invoices)} orphan invoices.")
        for inv in orphan_invoices:
            print(f"Deleting Invoice ID: {inv.id}, ClientID: {inv.client_id}, Month: {inv.month}")
            db.delete(inv)
        
        db.commit()
        print("Orphan invoices deleted successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_orphan_invoices()
