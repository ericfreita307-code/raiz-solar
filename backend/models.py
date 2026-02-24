from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from database import Base

class GenerationPlant(Base):
    __tablename__ = "generation_plants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True) # Ex: Usina Principal
    address = Column(String)
    uc_number = Column(String, unique=True, index=True)
    capacity_kw = Column(Float) # Capacidade instalada
    acquisition_cost = Column(Float, default=0.0)
    maintenance_cost = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    pix_key = Column(String, nullable=True)
    
    productions = relationship("Production", back_populates="plant")
    distributions = relationship("PlantDistribution", back_populates="plant")

class PlantDistribution(Base):
    __tablename__ = "plant_distributions"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("generation_plants.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    percentage = Column(Float) # Ex: 10.5 (10.5%)

    plant = relationship("GenerationPlant", back_populates="distributions")
    client = relationship("Client", back_populates="plant_distributions")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    address = Column(String)
    uc_number = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    phone = Column(String)
    payment_day = Column(Integer)
    kwh_value_original = Column(Float, default=0.0)
    negotiated_discount = Column(Float, default=0.0) # Desconto negociado (%)
    current_credits = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)

    invoices = relationship("Invoice", back_populates="client")
    plant_distributions = relationship("PlantDistribution", back_populates="client")
    credit_adjustments = relationship("CreditAdjustment", back_populates="client")

class Production(Base):
    __tablename__ = "production"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("generation_plants.id")) # Changed from client_id
    month = Column(String)  # Format: "YYYY-MM"
    kwh_generated = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    plant = relationship("GenerationPlant", back_populates="productions")
    # client = relationship("Client", back_populates="productions") # REMOVED

class CreditAdjustment(Base):
    __tablename__ = "credit_adjustments"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    amount = Column(Float) # positive for credit, negative for debit
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    client = relationship("Client", back_populates="credit_adjustments")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    month = Column(String)
    invoice_number = Column(String) # FATURA
    
    consumption_kwh = Column(Float)
    kwh_value = Column(Float)
    kwh_value_original = Column(Float) # V. kWh Original
    kwh_value_injection = Column(Float) # V. kWh injeção
    
    credited_balance = Column(Float) # CREDITADO
    invoice_value = Column(Float)
    fixed_cost = Column(Float) # Valor Fixo
    total_invoiced = Column(Float) # Valor Faturado
    amount_to_collect = Column(Float) # Valor a cobrar
    value_without_discount = Column(Float) # Valor sem Desconto
    
    total_value = Column(Float) # Valor Total (legacy?)
    original_value = Column(Float) # (legacy?)
    discount = Column(Float)
    profit = Column(Float)
    
    status = Column(String, default="aberto") # aberto, vencido, pago
    status_cobrado = Column(Boolean, default=False)
    status_pago = Column(Boolean, default=False)
    status_recebido = Column(Boolean, default=False)
    equatorial_invoice_path = Column(String, nullable=True) # Path to uploaded Equatorial invoice PDF

    client = relationship("Client", back_populates="invoices")

class Operator(Base):
    __tablename__ = "operators"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    cpf = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
