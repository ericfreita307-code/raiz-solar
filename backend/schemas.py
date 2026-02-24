from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Plain Models ---

class GenerationPlantPlain(BaseModel):
    id: int
    name: str
    address: str
    uc_number: str
    capacity_kw: float
    acquisition_cost: float
    maintenance_cost: float
    is_active: bool
    pix_key: Optional[str] = None

    class Config:
        from_attributes = True

class PlantDistributionPlain(BaseModel):
    id: int
    plant_id: int
    client_id: int
    percentage: float

    class Config:
        from_attributes = True

class CreditAdjustmentPlain(BaseModel):
    id: int
    client_id: int
    amount: float
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

class ProductionPlain(BaseModel):
    id: int
    plant_id: int # Changed from client_id
    month: str
    kwh_generated: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InvoicePlain(BaseModel):
    id: int
    client_id: int
    month: str
    invoice_number: Optional[str] = None
    consumption_kwh: float = 0.0
    kwh_value: float = 0.0
    kwh_value_original: float = 0.0
    kwh_value_injection: float = 0.0
    credited_balance: float = 0.0
    invoice_value: float = 0.0
    fixed_cost: float = 0.0
    total_invoiced: float = 0.0
    amount_to_collect: float = 0.0
    value_without_discount: float = 0.0
    total_value: float = 0.0
    original_value: float = 0.0
    discount: float = 0.0
    profit: float = 0.0
    status: str = "aberto"
    status_cobrado: bool = False
    status_pago: bool = False
    status_recebido: bool = False
    equatorial_invoice_path: Optional[str] = None

    class Config:
        from_attributes = True

class ClientPlain(BaseModel):
    id: int
    name: str
    address: str
    uc_number: str
    email: Optional[str] = None
    phone: Optional[str] = None
    payment_day: Optional[int] = None
    kwh_value_original: float = 0.0
    negotiated_discount: float = 0.0
    current_credits: float = 0.0
    is_active: bool

    class Config:
        from_attributes = True

# --- Creation Models ---

class GenerationPlantCreate(BaseModel):
    name: str
    address: str
    uc_number: str
    capacity_kw: float
    acquisition_cost: float
    maintenance_cost: float
    is_active: bool = True
    pix_key: Optional[str] = None

class GenerationPlantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    uc_number: Optional[str] = None
    capacity_kw: Optional[float] = None
    acquisition_cost: Optional[float] = None
    maintenance_cost: Optional[float] = None
    is_active: Optional[bool] = None
    pix_key: Optional[str] = None

class PlantDistributionCreate(BaseModel):
    plant_id: int
    client_id: int
    percentage: float

class ProductionCreate(BaseModel):
    month: str
    kwh_generated: float

class ProductionUpdate(BaseModel):
    month: Optional[str] = None
    kwh_generated: Optional[float] = None

class CreditAdjustmentCreate(BaseModel):
    amount: float
    description: str

class ClientBase(BaseModel):
    name: str
    address: str
    uc_number: str
    email: str
    phone: Optional[str] = None
    payment_day: Optional[int] = None
    kwh_value_original: float = 0.0
    negotiated_discount: float = 0.0
    is_active: bool = True

class ClientCreate(ClientBase):
    password: str

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    uc_number: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    payment_day: Optional[int] = None
    kwh_value_original: Optional[float] = None
    negotiated_discount: Optional[float] = None
    is_active: Optional[bool] = None

class InvoiceCreate(BaseModel):
    month: str
    invoice_number: Optional[str] = None
    consumption_kwh: float
    kwh_value: float
    kwh_value_original: float
    kwh_value_injection: float
    client_id: int
    credited_balance: float
    invoice_value: float
    fixed_cost: float
    total_invoiced: float
    amount_to_collect: float
    value_without_discount: float
    original_value: float
    total_value: float # Added
    discount: float
    profit: float
    status: str = "aberto"
    status_cobrado: bool = False
    status_pago: bool = False
    status_recebido: bool = False
    equatorial_invoice_path: Optional[str] = None

class InvoiceUpdate(BaseModel):
    month: Optional[str] = None
    invoice_number: Optional[str] = None
    consumption_kwh: Optional[float] = None
    kwh_value_original: Optional[float] = None
    kwh_value_injection: Optional[float] = None
    credited_balance: Optional[float] = None
    fixed_cost: Optional[float] = None
    total_invoiced: Optional[float] = None
    amount_to_collect: Optional[float] = None
    value_without_discount: Optional[float] = None
    original_value: Optional[float] = None
    total_value: Optional[float] = None
    discount: Optional[float] = None
    profit: Optional[float] = None
    status: Optional[str] = None
    status_cobrado: Optional[bool] = None
    status_pago: Optional[bool] = None
    status_recebido: Optional[bool] = None
    equatorial_invoice_path: Optional[str] = None

class CreditUpdate(BaseModel):
    credits_to_add: float 

# --- Rich Models ---

class GenerationPlant(GenerationPlantPlain):
    productions: List[ProductionPlain] = []
    distributions: List[PlantDistributionPlain] = []

class Production(ProductionPlain):
    plant: Optional[GenerationPlantPlain] = None

class Client(ClientPlain):
    invoices: List[InvoicePlain] = []
    plant_distributions: List[PlantDistributionPlain] = []
    credit_adjustments: List[CreditAdjustmentPlain] = []

class Invoice(InvoicePlain):
    client: Optional[ClientPlain] = None

# --- Dashboard ---
class DashboardMetrics(BaseModel):
    open_invoices_count: int
    open_invoices_value: float
    monthly_production: float
    monthly_margin: float
    recent_clients: List[ClientPlain]


# --- Operator Schemas ---

class OperatorPlain(BaseModel):
    id: int
    full_name: str
    email: str
    cpf: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class OperatorCreate(BaseModel):
    full_name: str
    email: str
    cpf: str
    password: str

class OperatorUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    cpf: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class CreditStatementEntry(BaseModel):
    date: str # YYYY-MM
    type: str # "geracao" or "faturamento"
    kwh: float # positive for addition, negative for deduction
    description: str
    status: Optional[str] = None
    invoice_id: Optional[int] = None

class LoginRequest(BaseModel):
    identifier: str
    password: str
    user_type: str # "client" or "admin"

class LoginResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[int] = None
    name: Optional[str] = None
    user_type: Optional[str] = None
