from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from pathlib import Path

import crud, models, schemas
from database import SessionLocal, engine

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Solar Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://raiz-solar.web.app",
        "https://raiz-solar.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("uploads/equatorial_invoices")
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files for serving uploaded PDFs
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Authentication ---
@app.post("/login", response_model=schemas.LoginResponse)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    if request.user_type == "admin":
        user = crud.get_operator_by_email(db, request.identifier)
        if not user:
            raise HTTPException(status_code=401, detail="Credenciais incorretas")
        
        if not crud.verify_password(request.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Senha incorreta")
        
        return {
            "success": True, 
            "message": "Login realizado com sucesso", 
            "user_id": user.id, 
            "name": user.full_name,
            "user_type": "admin"
        }
    else:
        # Client login
        # Clients might login by Email or UC Number
        user = crud.get_client_by_email(db, request.identifier)
        if not user:
            user = crud.get_client_by_uc(db, request.identifier)
            
        if not user:
            raise HTTPException(status_code=401, detail="Credenciais incorretas")
        
        # Assuming clients have plain text passwords for now (Legacy)
        if user.password != request.password:
             raise HTTPException(status_code=401, detail="Senha incorreta")
             
        return {
            "success": True, 
            "message": "Login realizado com sucesso", 
            "user_id": user.id, 
            "name": user.name,
            "user_type": "client"
        }

# --- Generation Plants ---
@app.post("/plants/", response_model=schemas.GenerationPlant)
def create_plant(plant: schemas.GenerationPlantCreate, db: Session = Depends(get_db)):
    return crud.create_generation_plant(db=db, plant=plant)

@app.get("/plants/", response_model=List[schemas.GenerationPlant])
def read_plants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_generation_plants(db, skip=skip, limit=limit)

@app.patch("/plants/{plant_id}", response_model=schemas.GenerationPlant)
def update_plant(plant_id: int, plant: schemas.GenerationPlantUpdate, db: Session = Depends(get_db)):
    db_plant = crud.update_generation_plant(db, plant_id=plant_id, plant_update=plant)
    if db_plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    return db_plant

# --- Plant Distributions ---
@app.post("/plants/{plant_id}/distributions/", response_model=List[schemas.PlantDistributionPlain])
def set_plant_distributions(
    plant_id: int, 
    distributions: List[schemas.PlantDistributionCreate], 
    db: Session = Depends(get_db)
):
    # Clear existing
    crud.delete_plant_distributions(db, plant_id)
    # Add new
    new_dists = []
    total_percentage = 0
    for dist in distributions:
        total_percentage += dist.percentage
        if total_percentage > 100.1: # Small margin for float precision
            raise HTTPException(status_code=400, detail="Total percentage cannot exceed 100%")
        new_dists.append(crud.create_plant_distribution(db, dist))
    return new_dists

@app.get("/plants/{plant_id}/distributions/", response_model=List[schemas.PlantDistributionPlain])
def read_plant_distributions(plant_id: int, db: Session = Depends(get_db)):
    return crud.get_plant_distributions(db, plant_id)

@app.post("/plants/{plant_id}/production/", response_model=schemas.Production)
def create_production_for_plant(
    plant_id: int, production: schemas.ProductionCreate, db: Session = Depends(get_db)
):
    return crud.create_plant_production(db=db, production=production, plant_id=plant_id)

@app.get("/plants/{plant_id}/productions/", response_model=List[schemas.Production])
def read_plant_productions(plant_id: int, db: Session = Depends(get_db)):
    return crud.get_plant_productions(db, plant_id)

@app.patch("/productions/{production_id}", response_model=schemas.Production)
def update_production(production_id: int, production: schemas.ProductionUpdate, db: Session = Depends(get_db)):
    db_production = crud.update_plant_production(db, production_id=production_id, production_update=production)
    if db_production is None:
        raise HTTPException(status_code=404, detail="Production not found")
    return db_production

@app.delete("/productions/{production_id}")
def delete_production(production_id: int, db: Session = Depends(get_db)):
    success = crud.delete_plant_production(db, production_id=production_id)
    if not success:
        raise HTTPException(status_code=404, detail="Production not found")
    return {"detail": "Production deleted"}

# --- Clients ---
@app.post("/clients/", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    db_client = crud.get_client_by_uc(db, uc_number=client.uc_number)
    if db_client:
        raise HTTPException(status_code=400, detail="Client with this UC already registered")
    return crud.create_client(db=db, client=client)

@app.get("/clients/", response_model=List[schemas.Client])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_clients(db, skip=skip, limit=limit)

@app.get("/clients/{uc_number}", response_model=schemas.Client)
def read_client(uc_number: str, db: Session = Depends(get_db)):
    db_client = crud.get_client_by_uc(db, uc_number=uc_number)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@app.get("/clients/id/{client_id}", response_model=schemas.Client)
def read_client_by_id(client_id: int, db: Session = Depends(get_db)):
    db_client = crud.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@app.patch("/clients/{client_id}", response_model=schemas.Client)
def update_client(client_id: int, client_update: schemas.ClientUpdate, db: Session = Depends(get_db)):
    db_client = crud.update_client(db, client_id=client_id, client_update=client_update)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@app.patch("/clients/profile/{client_id}", response_model=schemas.Client)
def update_client_profile(client_id: int, client_update: schemas.ClientUpdate, db: Session = Depends(get_db)):
    # Restrict fields for client-initiated profile update
    restricted_fields = ["payment_day", "kwh_value_original", "negotiated_discount", "uc_number", "is_active"]
    
    update_dict = client_update.dict(exclude_unset=True)
    for field in restricted_fields:
        if field in update_dict:
            del update_dict[field]
            
    # Convert back to schema object
    filtered_update = schemas.ClientUpdate(**update_dict)
    
    db_client = crud.update_client(db, client_id=client_id, client_update=filtered_update)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@app.get("/clients/{client_id}/statement")
def read_client_statement(client_id: int, db: Session = Depends(get_db)):
    return crud.get_client_statement(db, client_id=client_id)

@app.delete("/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    success = crud.delete_client(db, client_id=client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"detail": "Client deleted"}

@app.post("/clients/{client_id}/credits/", response_model=schemas.Client)
def add_client_credits(client_id: int, credit_update: schemas.CreditUpdate, db: Session = Depends(get_db)):
    db_client = crud.update_client_credits(db, client_id=client_id, credits_to_add=credit_update.credits_to_add)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@app.post("/clients/{client_id}/adjust-credits/", response_model=schemas.Client)
def create_credit_adjustment(client_id: int, adjustment: schemas.CreditAdjustmentCreate, db: Session = Depends(get_db)):
    db_client = crud.create_credit_adjustment(db, client_id=client_id, adjustment=adjustment)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

# --- Invoices ---
@app.post("/invoices/", response_model=schemas.Invoice)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    return crud.create_invoice(db=db, invoice=invoice)

@app.get("/invoices/", response_model=List[schemas.Invoice])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_invoices(db, skip=skip, limit=limit)

@app.patch("/invoices/{invoice_id}", response_model=schemas.Invoice)
def update_invoice(invoice_id: int, invoice: schemas.InvoiceUpdate, db: Session = Depends(get_db)):
    db_invoice = crud.update_invoice(db, invoice_id=invoice_id, invoice_update=invoice)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@app.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    success = crud.delete_invoice(db, invoice_id=invoice_id)
    if not success:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"detail": "Invoice deleted"}

@app.post("/invoices/{invoice_id}/upload-equatorial")
async def upload_equatorial_invoice(
    invoice_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload Equatorial invoice PDF for a specific invoice"""
    # Verify invoice exists
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Create unique filename
    file_extension = ".pdf"
    unique_filename = f"invoice_{invoice_id}_{file.filename}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    # Update invoice with file path
    relative_path = f"/uploads/equatorial_invoices/{unique_filename}"
    invoice.equatorial_invoice_path = relative_path
    db.commit()
    db.refresh(invoice)
    
    return {"detail": "File uploaded successfully", "path": relative_path}

# --- Operators ---
@app.post("/operators/", response_model=schemas.OperatorPlain)
def create_operator(operator: schemas.OperatorCreate, db: Session = Depends(get_db)):
    try:
        # Check if email already exists
        existing_operator = crud.get_operator_by_email(db, operator.email)
        if existing_operator:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create operator
        new_operator = crud.create_operator(db, operator)
        return new_operator
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating operator: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/operators/", response_model=List[schemas.OperatorPlain])
def read_operators(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_operators(db, skip=skip, limit=limit)

@app.get("/operators/{operator_id}", response_model=schemas.OperatorPlain)
def read_operator(operator_id: int, db: Session = Depends(get_db)):
    operator = crud.get_operator_by_id(db, operator_id)
    if not operator:
        raise HTTPException(status_code=404, detail="Operator not found")
    return operator

@app.patch("/operators/{operator_id}", response_model=schemas.OperatorPlain)
def update_operator(operator_id: int, operator_update: schemas.OperatorUpdate, db: Session = Depends(get_db)):
    operator = crud.update_operator(db, operator_id, operator_update)
    if not operator:
        raise HTTPException(status_code=404, detail="Operator not found")
    return operator

@app.delete("/operators/{operator_id}")
def delete_operator(operator_id: int, db: Session = Depends(get_db)):
    success = crud.delete_operator(db, operator_id)
    if not success:
        raise HTTPException(status_code=404, detail="Operator not found")
    return {"detail": "Operator deleted"}

# --- Dashboard ---
@app.get("/admin/dashboard", response_model=schemas.DashboardMetrics)
def read_dashboard_metrics(db: Session = Depends(get_db)):
    return crud.get_dashboard_metrics(db)
