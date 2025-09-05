"""
Invoice Processing Routes

Handles invoice upload, processing, and database operations.
"""
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.core.config import get_settings
from app.models.schemas import (
    InvoiceDataSchema, ParseResponseSchema, SaveResponseSchema
)
from app.models.database import UserModel
from app.api.dependencies import get_invoice_service
from app.api.routes.auth import get_current_user
from app.services.invoice_service import InvoiceService

router = APIRouter(tags=["invoices"])


@router.get("/supported-formats")
async def get_supported_formats():
    """Get information about supported file formats and recommendations."""
    settings = get_settings()
    
    return {
        "supported_formats": [
            {
                "type": "JPEG/JPG",
                "mime_types": ["image/jpeg", "image/jpg"],
                "max_size": f"{settings.MAX_FILE_SIZE // (1024*1024)}MB",
                "recommended": True
            },
            {
                "type": "PNG", 
                "mime_types": ["image/png"],
                "max_size": f"{settings.MAX_FILE_SIZE // (1024*1024)}MB",
                "recommended": True
            },
            {
                "type": "WEBP",
                "mime_types": ["image/webp"], 
                "max_size": f"{settings.MAX_FILE_SIZE // (1024*1024)}MB",
                "recommended": False
            }
        ],
        "recommendations": [
            "Use high-resolution images (minimum 300 DPI)",
            "Ensure good lighting and minimal shadows",
            "Keep text clearly visible and unobstructed",
            "JPEG format provides best balance of quality and file size"
        ]
    }


@router.post("/parse-invoice", response_model=ParseResponseSchema)
async def parse_invoice(
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_user),
    invoice_service: InvoiceService = Depends(get_invoice_service)
):
    """
    Parse an uploaded invoice image and extract structured data.
    
    Supports: JPG, JPEG, PNG, WEBP
    Returns: Structured JSON data following Indian GST invoice standards
    """
    try:
        # Read file data
        file_data = await file.read()
        content_type = file.content_type or "application/octet-stream"
        filename = file.filename or "unknown"
        
        # Validate file
        is_valid, error_message = invoice_service.validate_file(
            file_data, content_type
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)
        
        # Process invoice
        result = await invoice_service.process_invoice(
            file_data, content_type, filename
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/save-invoice", response_model=SaveResponseSchema)
async def save_invoice_to_database(
    invoice_data: InvoiceDataSchema,
    current_user: UserModel = Depends(get_current_user),
    invoice_service: InvoiceService = Depends(get_invoice_service)
):
    """
    Save extracted invoice data to PostgreSQL database.
    
    Args:
        invoice_data: InvoiceDataSchema with extracted invoice information
        
    Returns:
        SaveResponseSchema with success status and invoice ID or error details
    """
    try:
        # Save using invoice service
        result = invoice_service.save_invoice(invoice_data, str(current_user.id))
        
        # Handle specific error cases
        if not result.success and result.duplicate:
            # Return 409 for duplicates but don't raise exception
            # Client can handle this gracefully
            pass
        elif not result.success:
            # For other errors, we might want to return 500
            raise HTTPException(
                status_code=500,
                detail=result.error or "Failed to save invoice"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/process-and-save", response_model=dict)
async def process_and_save_invoice(
    file: UploadFile = File(...),
    auto_save: bool = True,
    current_user: UserModel = Depends(get_current_user),
    invoice_service: InvoiceService = Depends(get_invoice_service)
):
    """
    Complete pipeline: process invoice and optionally save to database.
    
    This endpoint combines parsing and saving in a single operation.
    """
    try:
        # Read file data
        file_data = await file.read()
        content_type = file.content_type or "application/octet-stream"
        filename = file.filename or "unknown"
        
        # Validate file
        is_valid, error_message = invoice_service.validate_file(
            file_data, content_type
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_message)
        
        # Process and optionally save
        parse_result, save_result = await invoice_service.process_and_save_invoice(
            file_data, content_type, filename, auto_save, str(current_user.id)
        )
        
        return {
            "parse_result": parse_result,
            "save_result": save_result,
            "pipeline_success": parse_result.success and (not auto_save or save_result.success)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline error: {str(e)}"
        )
