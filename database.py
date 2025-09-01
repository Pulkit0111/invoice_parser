"""
Database connection management and operations for invoice persistence.
Handles PostgreSQL connections via SQLAlchemy with proper error handling.
"""
import os
import logging
from typing import Optional, Dict, Any
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from contextlib import contextmanager
from dotenv import load_dotenv

from models import Base, InvoiceModel, CompanyModel, AddressModel, LineItemModel, TaxCalculationModel
# Import Pydantic models from main - avoid circular import
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from main import InvoiceData, CompanyInfo, Address, LineItem, TaxCalculation

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL not found in environment variables")

# Global engine and session factory
engine: Optional[Engine] = None
SessionLocal: Optional[sessionmaker] = None

def get_database_engine() -> Engine:
    """Get or create database engine"""
    global engine
    if engine is None:
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL not configured")
        
        try:
            engine = create_engine(
                DATABASE_URL,
                pool_size=5,
                max_overflow=10,
                pool_timeout=30,
                pool_recycle=3600,
                echo=False  # Set to True for SQL debugging
            )
            logger.info("Database engine created successfully")
        except Exception as e:
            logger.error(f"Failed to create database engine: {e}")
            raise
    
    return engine

def get_session_factory() -> sessionmaker:
    """Get or create session factory"""
    global SessionLocal
    if SessionLocal is None:
        engine = get_database_engine()
        SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
        logger.info("Session factory created successfully")
    
    return SessionLocal

@contextmanager
def get_db_session():
    """Context manager for database sessions with automatic cleanup"""
    session_factory = get_session_factory()
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        session.close()

def create_tables() -> bool:
    """Create all database tables"""
    try:
        engine = get_database_engine()
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        return False

def health_check_db() -> Dict[str, Any]:
    """Check database connection health"""
    try:
        engine = get_database_engine()
        with engine.connect() as conn:
            from sqlalchemy import text
            conn.execute(text("SELECT 1"))
        
        return {
            "database_connected": True,
            "database_url_configured": bool(DATABASE_URL),
            "message": "Database connection healthy"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "database_connected": False,
            "database_url_configured": bool(DATABASE_URL),
            "message": f"Database connection failed: {str(e)}"
        }

def check_duplicate_invoice(invoice_number: str) -> bool:
    """Check if invoice number already exists in database"""
    if not invoice_number:
        return False
    
    try:
        with get_db_session() as session:
            existing = session.query(InvoiceModel).filter(
                InvoiceModel.invoice_number == invoice_number
            ).first()
            return existing is not None
    except Exception as e:
        logger.error(f"Error checking duplicate invoice: {e}")
        return False

def get_or_create_company(session: Session, company_info: Optional[Any]) -> Optional[CompanyModel]:
    """Get existing company or create new one"""
    if not company_info or not company_info.company_name:
        return None
    
    try:
        # Try to find existing company by GSTIN or name
        query = session.query(CompanyModel)
        
        if company_info.gstin:
            existing = query.filter(CompanyModel.gstin == company_info.gstin).first()
            if existing:
                return existing
        
        # If no GSTIN match, try by company name
        existing = query.filter(CompanyModel.company_name == company_info.company_name).first()
        if existing:
            return existing
        
        # Create new company
        company = CompanyModel(
            company_name=company_info.company_name,
            gstin=company_info.gstin,
            phone=company_info.phone,
            email=company_info.email
        )
        session.add(company)
        session.flush()  # Get the ID without committing
        
        # Add address if provided
        if company_info.address:
            address = AddressModel(
                company_id=company.id,
                street=company_info.address.street,
                city=company_info.address.city,
                state=company_info.address.state,
                country=company_info.address.country,
                pincode=company_info.address.pincode,
                address_type="billing"
            )
            session.add(address)
        
        logger.info(f"Created new company: {company_info.company_name}")
        return company
        
    except Exception as e:
        logger.error(f"Error creating/getting company: {e}")
        raise

def save_invoice_to_db(invoice_data: Any) -> Dict[str, Any]:
    """
    Save complete invoice data to database
    Returns success status and invoice ID or error message
    """
    try:
        # Check for duplicate first
        if invoice_data.invoice_number:
            if check_duplicate_invoice(invoice_data.invoice_number):
                return {
                    "success": False,
                    "duplicate": True,
                    "message": f"Invoice {invoice_data.invoice_number} already exists in database",
                    "error": "Duplicate invoice number"
                }
        
        with get_db_session() as session:
            # Get or create vendor company
            vendor = get_or_create_company(session, invoice_data.vendor_information)
            
            # Get or create customer company
            customer = get_or_create_company(session, invoice_data.customer_information)
            
            # Create invoice record
            invoice = InvoiceModel(
                invoice_number=invoice_data.invoice_number,
                invoice_date=invoice_data.invoice_date,
                due_date=invoice_data.due_date,
                currency=invoice_data.currency,
                gross_amount=invoice_data.gross_amount,
                net_amount=invoice_data.net_amount,
                amount_in_words=invoice_data.amount_in_words,
                qr_code_data=invoice_data.qr_code_data,
                extraction_confidence=invoice_data.extraction_confidence or "medium",
                raw_text=invoice_data.raw_text,
                vendor_id=vendor.id if vendor else None,
                customer_id=customer.id if customer else None
            )
            session.add(invoice)
            session.flush()  # Get invoice ID
            
            # Create line items
            for item_data in invoice_data.line_items:
                line_item = LineItemModel(
                    invoice_id=invoice.id,
                    serial_number=item_data.serial_number,
                    description=item_data.description,
                    hsn_code=item_data.hsn_code,
                    quantity=item_data.quantity,
                    unit=item_data.unit,
                    rate=item_data.rate,
                    amount=item_data.amount
                )
                session.add(line_item)
            
            # Create tax calculation if provided
            if invoice_data.tax_calculations:
                tax_calc = TaxCalculationModel(
                    invoice_id=invoice.id,
                    taxable_amount=invoice_data.tax_calculations.taxable_amount,
                    cgst_rate=invoice_data.tax_calculations.cgst_rate,
                    cgst_amount=invoice_data.tax_calculations.cgst_amount,
                    sgst_rate=invoice_data.tax_calculations.sgst_rate,
                    sgst_amount=invoice_data.tax_calculations.sgst_amount,
                    igst_rate=invoice_data.tax_calculations.igst_rate,
                    igst_amount=invoice_data.tax_calculations.igst_amount,
                    total_tax=invoice_data.tax_calculations.total_tax
                )
                session.add(tax_calc)
            
            # Commit all changes
            session.commit()
            
            logger.info(f"Successfully saved invoice {invoice_data.invoice_number} with ID {invoice.id}")
            
            return {
                "success": True,
                "message": "Invoice saved successfully",
                "invoice_id": str(invoice.id),
                "duplicate": False
            }
            
    except IntegrityError as e:
        logger.error(f"Database integrity error: {e}")
        return {
            "success": False,
            "error": "Database constraint violation - possible duplicate",
            "message": "Failed to save invoice due to data constraints"
        }
    except SQLAlchemyError as e:
        logger.error(f"Database error: {e}")
        return {
            "success": False,
            "error": f"Database error: {str(e)}",
            "message": "Failed to save invoice due to database error"
        }
    except Exception as e:
        logger.error(f"Unexpected error saving invoice: {e}")
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "message": "Failed to save invoice due to unexpected error"
        }

def get_invoice_by_id(invoice_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve invoice by ID (for future use)"""
    try:
        with get_db_session() as session:
            invoice = session.query(InvoiceModel).filter(InvoiceModel.id == invoice_id).first()
            if invoice:
                return {
                    "id": str(invoice.id),
                    "invoice_number": invoice.invoice_number,
                    "invoice_date": invoice.invoice_date,
                    "net_amount": float(invoice.net_amount) if invoice.net_amount else None,
                    "created_at": invoice.created_at.isoformat()
                }
            return None
    except Exception as e:
        logger.error(f"Error retrieving invoice {invoice_id}: {e}")
        return None

# Initialize database on module import
def initialize_database():
    """Initialize database connection and create tables if needed"""
    try:
        if DATABASE_URL:
            create_tables()
            logger.info("Database initialized successfully")
        else:
            logger.warning("DATABASE_URL not configured - database features disabled")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

# Auto-initialize when module is imported
if __name__ != "__main__":
    initialize_database()
