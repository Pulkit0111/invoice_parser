"""
Database Service

Handles all database operations for invoice data persistence,
including CRUD operations and business logic for data storage.
"""
import logging
from typing import Optional, Any

from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.core.database import get_db_session
from app.models.database import (
    InvoiceModel, CompanyModel, AddressModel, 
    LineItemModel, TaxCalculationModel
)
from app.models.schemas import InvoiceDataSchema

# Configure logging
logger = logging.getLogger(__name__)


class DatabaseService:
    """Service for database operations."""
    
    def check_duplicate_invoice(self, invoice_number: str) -> bool:
        """Check if invoice number already exists in database."""
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
    
    def get_or_create_company(self, session, company_info: Any) -> Optional[CompanyModel]:
        """Get existing company or create new one."""
        if not company_info or not company_info.company_name:
            return None
        
        try:
            # Try to find existing company by GSTIN or name
            query = session.query(CompanyModel)
            
            if hasattr(company_info, 'gstin') and company_info.gstin:
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
                gstin=getattr(company_info, 'gstin', None),
                phone=getattr(company_info, 'phone', None),
                email=getattr(company_info, 'email', None)
            )
            session.add(company)
            session.flush()  # Get the ID without committing
            
            # Add address if provided
            if hasattr(company_info, 'address') and company_info.address:
                address = AddressModel(
                    company_id=company.id,
                    street=getattr(company_info.address, 'street', None),
                    city=getattr(company_info.address, 'city', None),
                    state=getattr(company_info.address, 'state', None),
                    country=getattr(company_info.address, 'country', None),
                    pincode=getattr(company_info.address, 'pincode', None),
                    address_type="billing"
                )
                session.add(address)
            
            logger.info(f"Created new company: {company_info.company_name}")
            return company
            
        except Exception as e:
            logger.error(f"Error creating/getting company: {e}")
            raise
    
    def save_invoice_to_db(self, invoice_data: InvoiceDataSchema) -> dict[str, Any]:
        """
        Save complete invoice data to database.
        
        Args:
            invoice_data: Validated invoice data schema
            
        Returns:
            Dictionary with success status and details
        """
        try:
            # Check for duplicate first
            if invoice_data.invoice_number:
                if self.check_duplicate_invoice(invoice_data.invoice_number):
                    return {
                        "success": False,
                        "duplicate": True,
                        "message": f"Invoice {invoice_data.invoice_number} already exists in database",
                        "error": "Duplicate invoice number"
                    }
            
            with get_db_session() as session:
                # Get or create vendor company
                vendor = self.get_or_create_company(session, invoice_data.vendor_information)
                
                # Get or create customer company
                customer = self.get_or_create_company(session, invoice_data.customer_information)
                
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
    
    def get_invoice_by_id(self, invoice_id: str) -> Optional[dict[str, Any]]:
        """Retrieve invoice by ID."""
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
    
    def get_invoice_stats(self) -> dict[str, Any]:
        """Get basic statistics about stored invoices."""
        try:
            with get_db_session() as session:
                invoice_count = session.query(InvoiceModel).count()
                company_count = session.query(CompanyModel).count()
                
                return {
                    "total_invoices": invoice_count,
                    "total_companies": company_count,
                    "status": "healthy"
                }
        except Exception as e:
            logger.error(f"Error getting invoice stats: {e}")
            return {
                "total_invoices": 0,
                "total_companies": 0,
                "status": "error",
                "error": str(e)
            }
