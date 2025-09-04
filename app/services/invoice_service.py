"""
Invoice Service

High-level business logic service that orchestrates AI processing
and database operations for invoice handling.
"""
import logging
from datetime import datetime
from typing import Tuple

from app.core.ai_processor import AIProcessor
from app.services.database_service import DatabaseService
from app.models.schemas import InvoiceDataSchema, ParseResponseSchema, SaveResponseSchema

# Configure logging
logger = logging.getLogger(__name__)


class InvoiceService:
    """High-level invoice processing service."""
    
    def __init__(self):
        """Initialize invoice service with dependencies."""
        self.ai_processor = AIProcessor()
        self.db_service = DatabaseService()
    
    async def process_invoice(
        self, 
        file_data: bytes, 
        content_type: str, 
        filename: str = "invoice"
    ) -> ParseResponseSchema:
        """
        Process an invoice image through the complete AI extraction pipeline.
        
        Args:
            file_data: Raw image file bytes
            content_type: MIME type of the image
            filename: Original filename (for logging)
            
        Returns:
            ParseResponseSchema with extracted data or error details
        """
        start_time = datetime.now()
        
        try:
            logger.info(f"Starting invoice processing for {filename} ({content_type})")
            
            # Validate AI processor availability
            if not self.ai_processor.is_available():
                return ParseResponseSchema(
                    success=False,
                    error="AI model not available. Check API key configuration."
                )
            
            # Extract data using AI
            invoice_data, raw_response = await self.ai_processor.extract_invoice_data(
                file_data, content_type
            )
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            logger.info(f"Invoice processing completed in {processing_time:.2f}s")
            
            return ParseResponseSchema(
                success=True,
                data=invoice_data,
                processing_time=processing_time
            )
            
        except ValueError as e:
            # Image processing errors
            logger.error(f"Image processing error for {filename}: {e}")
            return ParseResponseSchema(
                success=False,
                error=f"Image processing error: {str(e)}"
            )
            
        except Exception as e:
            # General processing errors
            logger.error(f"Invoice processing error for {filename}: {e}")
            return ParseResponseSchema(
                success=False,
                error=f"Processing error: {str(e)}"
            )
    
    def save_invoice(self, invoice_data: InvoiceDataSchema) -> SaveResponseSchema:
        """
        Save extracted invoice data to database.
        
        Args:
            invoice_data: Validated invoice data schema
            
        Returns:
            SaveResponseSchema with save status and details
        """
        try:
            logger.info(f"Saving invoice to database: {invoice_data.invoice_number}")
            
            # Use database service to save
            result = self.db_service.save_invoice_to_db(invoice_data)
            
            # Convert to schema response
            return SaveResponseSchema(
                success=result["success"],
                message=result["message"],
                invoice_id=result.get("invoice_id"),
                duplicate=result.get("duplicate", False),
                error=result.get("error")
            )
            
        except Exception as e:
            logger.error(f"Error in invoice save service: {e}")
            return SaveResponseSchema(
                success=False,
                message="Internal service error",
                error=f"Service error: {str(e)}"
            )
    
    async def process_and_save_invoice(
        self, 
        file_data: bytes, 
        content_type: str, 
        filename: str = "invoice",
        auto_save: bool = False
    ) -> Tuple[ParseResponseSchema, SaveResponseSchema]:
        """
        Complete invoice processing pipeline: extract and optionally save.
        
        Args:
            file_data: Raw image file bytes
            content_type: MIME type of the image
            filename: Original filename
            auto_save: Whether to automatically save to database
            
        Returns:
            Tuple of (parse_response, save_response)
        """
        # Process invoice
        parse_response = await self.process_invoice(file_data, content_type, filename)
        
        save_response = None
        if auto_save and parse_response.success and parse_response.data:
            # Auto-save if requested and processing succeeded
            save_response = self.save_invoice(parse_response.data)
        
        return parse_response, save_response
    
    def get_service_status(self) -> dict[str, any]:
        """Get status of all service components."""
        try:
            # Check AI processor
            ai_info = self.ai_processor.get_model_info()
            
            # Check database service
            db_stats = self.db_service.get_invoice_stats()
            
            return {
                "service_status": "healthy",
                "ai_processor": ai_info,
                "database": db_stats,
                "components": {
                    "ai_available": ai_info["available"],
                    "database_healthy": db_stats["status"] == "healthy"
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting service status: {e}")
            return {
                "service_status": "error",
                "error": str(e),
                "components": {
                    "ai_available": False,
                    "database_healthy": False
                }
            }
    
    def validate_file(self, file_data: bytes, content_type: str, max_size: int = 10 * 1024 * 1024) -> Tuple[bool, str]:
        """
        Validate uploaded file for processing.
        
        Args:
            file_data: Raw file bytes
            content_type: MIME type
            max_size: Maximum file size in bytes
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check file size
        if len(file_data) > max_size:
            return False, f"File too large. Maximum size: {max_size // (1024*1024)}MB"
        
        # Check content type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if content_type not in allowed_types:
            return False, f"Unsupported file type: {content_type}. Supported: {', '.join(allowed_types)}"
        
        # Check if file has content
        if len(file_data) == 0:
            return False, "Empty file uploaded"
        
        return True, "File is valid"
