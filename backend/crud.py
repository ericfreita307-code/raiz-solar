from sqlalchemy.orm import Session
import models, schemas


def create_client_production(db: Session, production: schemas.ProductionCreate, client_id: int):
    db_production = models.Production(**production.dict(), client_id=client_id)
    db.add(db_production)
    db.commit()
    db.refresh(db_production)

    # Check if invoice exists for this month
    existing_invoice = db.query(models.Invoice).filter(models.Invoice.client_id == client_id, models.Invoice.month == production.month).first()
    if not existing_invoice:
        # Create default invoice
        new_invoice = models.Invoice(
            client_id=client_id,
            month=production.month,
            consumption_kwh=production.kwh_generated, # Assuming consumption matches generation for simplicity initially
            kwh_value=0.0,
            credited_balance=0.0,
            invoice_value=0.0,
            fixed_cost=0.0,
            total_invoiced=0.0,
            total_value=0.0,
            original_value=0.0,
            discount=0.0,
            profit=0.0,
        )
        db.add(new_invoice)
        db.commit()

    return db_production



# --- Generation Plants ---
def create_generation_plant(db: Session, plant: schemas.GenerationPlantCreate):
    db_plant = models.GenerationPlant(**plant.dict())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

def get_generation_plants(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.GenerationPlant).offset(skip).limit(limit).all()

def get_plant_by_id(db: Session, plant_id: int):
    return db.query(models.GenerationPlant).filter(models.GenerationPlant.id == plant_id).first()

def update_generation_plant(db: Session, plant_id: int, plant_update: schemas.GenerationPlantUpdate):
    db_plant = get_plant_by_id(db, plant_id)
    if db_plant:
        update_data = plant_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_plant, key, value)
        db.commit()
        db.refresh(db_plant)
    return db_plant

# --- Plant Distributions ---
def create_plant_distribution(db: Session, distribution: schemas.PlantDistributionCreate):
    db_dist = models.PlantDistribution(**distribution.dict())
    db.add(db_dist)
    db.commit()
    db.refresh(db_dist)
    return db_dist

def get_plant_distributions(db: Session, plant_id: int):
    return db.query(models.PlantDistribution).filter(models.PlantDistribution.plant_id == plant_id).all()

def delete_plant_distributions(db: Session, plant_id: int):
    db.query(models.PlantDistribution).filter(models.PlantDistribution.plant_id == plant_id).delete()
    db.commit()

# --- Production & Automatic Credit Distribution ---
def create_plant_production(db: Session, production: schemas.ProductionCreate, plant_id: int):
    # 1. Create Production Entry
    db_production = models.Production(**production.dict(), plant_id=plant_id)
    db.add(db_production)
    
    # 2. Distribute credits based on percentages
    distributions = get_plant_distributions(db, plant_id)
    total_kwh = production.kwh_generated
    
    for dist in distributions:
        # Calculate amount for this client
        kwh_to_add = (dist.percentage / 100.0) * total_kwh
        # Update client credits
        client = get_client(db, dist.client_id)
        if client:
            client.current_credits += kwh_to_add
            
    db.commit()
    db.refresh(db_production)
    return db_production

def get_plant_productions(db: Session, plant_id: int):
    return db.query(models.Production).filter(models.Production.plant_id == plant_id).order_by(models.Production.month.desc()).all()

def update_plant_production(db: Session, production_id: int, production_update: schemas.ProductionUpdate):
    db_production = db.query(models.Production).filter(models.Production.id == production_id).first()
    if db_production:
        old_kwh = db_production.kwh_generated
        new_kwh = production_update.kwh_generated if production_update.kwh_generated is not None else old_kwh
        diff_kwh = new_kwh - old_kwh
        
        # 1. Update the record
        if production_update.kwh_generated is not None:
            db_production.kwh_generated = new_kwh
        if production_update.month is not None:
            db_production.month = production_update.month
            
        # 2. Adjust coefficients (credits)
        distributions = get_plant_distributions(db, db_production.plant_id)
        for dist in distributions:
            kwh_adj = (dist.percentage / 100.0) * diff_kwh
            client = get_client(db, dist.client_id)
            if client:
                client.current_credits += kwh_adj
        
        db.commit()
        db.refresh(db_production)
        return db_production
    return None

def delete_plant_production(db: Session, production_id: int):
    db_production = db.query(models.Production).filter(models.Production.id == production_id).first()
    if db_production:
        # 1. Reverse the credits
        distributions = get_plant_distributions(db, db_production.plant_id)
        total_kwh = db_production.kwh_generated
        
        for dist in distributions:
            kwh_to_remove = (dist.percentage / 100.0) * total_kwh
            client = get_client(db, dist.client_id)
            if client:
                client.current_credits -= kwh_to_remove
        
        # 2. Delete the record
        db.delete(db_production)
        db.commit()
        return True
    return False

# --- Clients ---
def get_client(db: Session, client_id: int):
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def get_client_by_uc(db: Session, uc_number: str):
    return db.query(models.Client).filter(models.Client.uc_number == uc_number).first()

def get_client_by_email(db: Session, email: str):
    return db.query(models.Client).filter(models.Client.email == email).first()

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Client).offset(skip).limit(limit).all()

def create_client(db: Session, client: schemas.ClientCreate):
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client_credits(db: Session, client_id: int, credits_to_add: float):
    db_client = get_client(db, client_id)
    if db_client:
        db_client.current_credits += credits_to_add
        db.commit()
        db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: int, client_update: schemas.ClientUpdate):
    db_client = get_client(db, client_id)
    if db_client:
        update_data = client_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_client, key, value)
        db.commit()
        db.refresh(db_client)
    return db_client

def delete_client(db: Session, client_id: int):
    db_client = get_client(db, client_id)
    if db_client:
        # Delete related distributions first to avoid FK constraints
        db.query(models.PlantDistribution).filter(models.PlantDistribution.client_id == client_id).delete()
        # Delete invoices
        db.query(models.Invoice).filter(models.Invoice.client_id == client_id).delete()
        # Finally delete client
        db.delete(db_client)
        db.commit()
        return True
    return False

def create_credit_adjustment(db: Session, client_id: int, adjustment: schemas.CreditAdjustmentCreate):
    db_client = get_client(db, client_id)
    if not db_client:
        return None
    
    # Update client credits
    db_client.current_credits += adjustment.amount
    
    # Create adjustment log
    db_adjustment = models.CreditAdjustment(
        client_id=client_id,
        amount=adjustment.amount,
        description=adjustment.description
    )
    db.add(db_adjustment)
    db.commit()
    db.refresh(db_client)
    return db_client

# --- Invoices ---
def create_invoice(db: Session, invoice: schemas.InvoiceCreate):
    db_invoice = models.Invoice(**invoice.dict())
    db.add(db_invoice)
    
    # Handle credit deduction
    if db_invoice.credited_balance > 0:
        client = get_client(db, db_invoice.client_id)
        if client:
            client.current_credits -= db_invoice.credited_balance
            
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    from sqlalchemy.orm import joinedload
    return db.query(models.Invoice).options(joinedload(models.Invoice.client)).offset(skip).limit(limit).all()

def update_invoice(db: Session, invoice_id: int, invoice_update: schemas.InvoiceUpdate):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if db_invoice:
        update_data = invoice_update.dict(exclude_unset=True)
        
        # Handle credit balance sync
        if "credited_balance" in update_data:
            old_balance = db_invoice.credited_balance or 0.0
            new_balance = update_data["credited_balance"]
            diff = old_balance - new_balance
            # Adjust client credits (if diff > 0, we used less credit, so add back. if diff < 0, we used more, so subtract)
            client = get_client(db, db_invoice.client_id)
            if client:
                client.current_credits += diff

        for key, value in update_data.items():
            setattr(db_invoice, key, value)
        db.commit()
        db.refresh(db_invoice)
    return db_invoice

def get_dashboard_metrics(db: Session):
    # Faturas em Aberto (Not Paid)
    open_invoices_query = db.query(models.Invoice).filter(models.Invoice.status_pago == False)
    open_invoices_count = open_invoices_query.count()
    open_invoices_value = sum(inv.total_value for inv in open_invoices_query.all())

    # Monthly Production (Total kWh from all productions)
    total_production = db.query(models.Production).with_entities(models.Production.kwh_generated).all()
    monthly_production = sum(p[0] for p in total_production)

    # Monthly Margin (Total Profit)
    total_profit = db.query(models.Invoice).with_entities(models.Invoice.profit).all()
    monthly_margin = sum(p[0] for p in total_profit)

    # Recent Clients (Last 5)
    recent_clients = db.query(models.Client).order_by(models.Client.id.desc()).limit(5).all()

    return {
        "open_invoices_count": open_invoices_count,
        "open_invoices_value": open_invoices_value,
        "monthly_production": monthly_production,
        "monthly_margin": monthly_margin,
        "recent_clients": recent_clients
    }

def delete_invoice(db: Session, invoice_id: int):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if db_invoice:
        # Handle credit restoration
        if db_invoice.credited_balance > 0:
            client = get_client(db, db_invoice.client_id)
            if client:
                client.current_credits += db_invoice.credited_balance
                
        db.delete(db_invoice)
        db.commit()
        return True
    return False

def get_client_statement(db: Session, client_id: int):
    # 1. Get all invoices
    invoices = db.query(models.Invoice).filter(models.Invoice.client_id == client_id).all()
    
    # 2. Get all productions for plants this client is in
    productions = db.query(models.Production, models.PlantDistribution.percentage, models.GenerationPlant.name)\
        .join(models.PlantDistribution, models.Production.plant_id == models.PlantDistribution.plant_id)\
        .join(models.GenerationPlant, models.Production.plant_id == models.GenerationPlant.id)\
        .filter(models.PlantDistribution.client_id == client_id)\
        .all()
    
    statement = []
    
    # Add Invoices (Deductions)
    for inv in invoices:
        statement.append({
            "date": inv.month,
            "type": "faturamento",
            "kwh": -inv.credited_balance if inv.credited_balance else 0,
            "description": f"Fatura #{inv.id}",
            "status": inv.status,
            "invoice_id": inv.id,
            "item": {
                "id": inv.id,
                "month": inv.month,
                "consumption_kwh": inv.consumption_kwh,
                "kwh_value": inv.kwh_value,
                "kwh_value_original": inv.kwh_value_original,
                "kwh_value_injection": inv.kwh_value_injection,
                "credited_balance": inv.credited_balance,
                "fixed_cost": inv.fixed_cost,
                "total_invoiced": inv.total_invoiced,
                "amount_to_collect": inv.amount_to_collect,
                "value_without_discount": inv.value_without_discount,
                "status": inv.status,
                "status_cobrado": inv.status_cobrado,
                "status_pago": inv.status_pago,
                "status_recebido": inv.status_recebido
            }
        })
            
    # Add Productions (Additions)
    for prod, percentage, plant_name in productions:
        kwh_added = (percentage / 100.0) * prod.kwh_generated
        statement.append({
            "date": prod.month,
            "type": "geracao",
            "kwh": kwh_added,
            "description": f"Geração - {plant_name}",
            "status": "concluído"
        })

    # Add Manual Adjustments
    adjustments = db.query(models.CreditAdjustment).filter(models.CreditAdjustment.client_id == client_id).all()
    for adj in adjustments:
        statement.append({
            "date": adj.created_at.strftime("%Y-%m"),
            "type": "ajuste",
            "kwh": adj.amount,
            "description": adj.description,
            "status": "processado"
        })
        
    # Sort by date descending
    statement.sort(key=lambda x: x["date"], reverse=True)
    return statement

# --- Operators ---
import bcrypt

def hash_password(password: str) -> str:
    # Bcrypt has a maximum password length of 72 bytes
    pwd_bytes = password.encode('utf-8')
    # Truncation logic is still good practice though bcrypt 4.0+ might handle it
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        if not hashed_password:
            return False
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False


def create_operator(db: Session, operator: schemas.OperatorCreate):
    hashed_password = hash_password(operator.password)
    db_operator = models.Operator(
        full_name=operator.full_name,
        email=operator.email,
        cpf=operator.cpf,
        hashed_password=hashed_password
    )
    db.add(db_operator)
    db.commit()
    db.refresh(db_operator)
    return db_operator

def get_operators(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Operator).offset(skip).limit(limit).all()

def get_operator_by_id(db: Session, operator_id: int):
    return db.query(models.Operator).filter(models.Operator.id == operator_id).first()

def get_operator_by_email(db: Session, email: str):
    return db.query(models.Operator).filter(models.Operator.email == email).first()

def update_operator(db: Session, operator_id: int, operator_update: schemas.OperatorUpdate):
    db_operator = get_operator_by_id(db, operator_id)
    if db_operator:
        update_data = operator_update.dict(exclude_unset=True)
        
        # Hash password if it's being updated
        if "password" in update_data:
            update_data["hashed_password"] = hash_password(update_data.pop("password"))
        
        for key, value in update_data.items():
            setattr(db_operator, key, value)
        db.commit()
        db.refresh(db_operator)
    return db_operator

def delete_operator(db: Session, operator_id: int):
    db_operator = get_operator_by_id(db, operator_id)
    if db_operator:
        db.delete(db_operator)
        db.commit()
        return True
    return False

def get_invoice_pix_payload(db: Session, invoice_id: int):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        return None
    
    # Get the client's plant
    distribution = db.query(models.PlantDistribution).filter(models.PlantDistribution.client_id == invoice.client_id).first()
    if not distribution:
        return {"error": "Sem planta vinculada"}
        
    plant = db.query(models.GenerationPlant).filter(models.GenerationPlant.id == distribution.plant_id).first()
    if not plant or not plant.pix_key:
        return {"error": "Planta sem chave Pix cadastrada"}
    
    try:
        from pixqrcodegen import Payload
        # Payload(nome, chave, valor, cidade, txtId)
        # Note: We use a simplified amount formatting and arbitrary city if not available
        amount = f"{invoice.amount_to_collect:.2f}"
        # Brazilian Pix standard requires city (max 15 chars) and name (max 25 chars)
        recipient_name = (plant.name[:25]) if plant.name else "RAIZ SOLAR"
        payload = Payload(recipient_name, plant.pix_key, amount, "MACAPA", f"FAT{invoice.id}")
        return {"pix_payload": payload.gerarPayload(), "pix_key": plant.pix_key}
    except Exception as e:
        return {"error": f"Erro ao gerar Pix: {str(e)}"}
