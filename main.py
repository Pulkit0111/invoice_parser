from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional
from PIL import Image
from io import BytesIO
import json
import base64
import logging
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate

# Import database functionality
try:
    from database import save_invoice_to_db, health_check_db
    DATABASE_AVAILABLE = True
except ImportError as e:
    print(f"Database not available: {e}")
    DATABASE_AVAILABLE = False

load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0)
# model = ChatOpenAI(model="gpt-4o", temperature=0)

app = FastAPI(
    title="Invoice Parser",
    description="Parses the invoices and rerieves the data in a structured format.",
    version="1.0.0"   
)

app.mount("/static", StaticFiles(directory="static"), name="static")

class LineItem(BaseModel):
    serial_number: Optional[int] = None
    description: str
    hsn_code: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    rate: Optional[float] = None
    amount: Optional[float] = None

class Address(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None

class CompanyInfo(BaseModel):
    company_name: str
    gstin: Optional[str] = None
    address: Optional[Address] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class TaxCalculation(BaseModel):
    taxable_amount: Optional[float] = None
    cgst_rate: Optional[float] = None
    cgst_amount: Optional[float] = None
    sgst_rate: Optional[float] = None
    sgst_amount: Optional[float] = None
    igst_rate: Optional[float] = None
    igst_amount: Optional[float] = None
    total_tax: Optional[float] = None

class InvoiceData(BaseModel):
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    due_date: Optional[str] = None
    currency: str = "INR"
    vendor_information: Optional[CompanyInfo] = None
    customer_information: Optional[CompanyInfo] = None
    line_items: list[LineItem] = []
    tax_calculations: Optional[TaxCalculation] = None
    gross_amount: Optional[float] = None
    net_amount: Optional[float] = None
    amount_in_words: Optional[str] = None
    qr_code_data: Optional[str] = None
    extraction_confidence: Optional[str] = "medium"
    raw_text: Optional[str] = None

class ParseResponse(BaseModel):
    success: bool
    data: Optional[InvoiceData] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

class SaveResponse(BaseModel):
    success: bool
    message: str
    invoice_id: Optional[str] = None
    duplicate: Optional[bool] = False
    error: Optional[str] = None

# Remove the JSON schema from EXTRACTION_PROMPT and use a parser instead
EXTRACTION_PROMPT = """
You are an expert at extracting structured data from Indian GST-compliant invoices. 

Analyze this invoice image and extract the following information accurately:

IMPORTANT INSTRUCTIONS:
1. Extract ALL visible text accurately
2. For GST invoices, focus on GSTIN numbers, HSN codes, and tax breakdowns
3. If a field is not visible or unclear, use null
4. For amounts, extract only numeric values (remove currency symbols)
5. Preserve the exact text for company names and addresses
6. If you see multiple pages or complex layouts, extract systematically
7. Pay special attention to tax calculations and ensure they add up correctly
8. Return ONLY the JSON object, no additional text or explanation

Analyze the invoice now:
"""

# Create a Pydantic output parser
parser = PydanticOutputParser(pydantic_object=InvoiceData)

# Create a prompt template that includes the parser instructions
prompt_template = PromptTemplate(
    template=EXTRACTION_PROMPT + "\n{format_instructions}",
    input_variables=[],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

@app.get("/")
async def home():
    """Serves the main application interface."""
    try:
        with open("static/index.html", "r") as f:
            html_content=f.read()
        return HTMLResponse(content=html_content)
    except FileNotFoundError:
        return HTMLResponse(
            content="<h1>Invoice Parser</h1><p>Frontend not found. Please check static/index.html</p>",
            status_code=200
        )
        
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "gemini_available": model is not None,
        "version": "1.0.0"
    }
    
    # Add database health check if available
    if DATABASE_AVAILABLE:
        db_health = health_check_db()
        health_data.update(db_health)
    else:
        health_data.update({
            "database_connected": False,
            "database_url_configured": False,
            "message": "Database module not available"
        })
    
    return health_data

@app.get("/api/supported-formats")
async def supported_formats():
    """Get information about supported file formats."""
    return {
        "supported_formats": [
            {
                "type": "JPEG/JPG",
                "mime_types": ["image/jpeg", "image/jpg"],
                "max_size": "10MB",
                "recommended": True
            },
            {
                "type": "PNG", 
                "mime_types": ["image/png"],
                "max_size": "10MB",
                "recommended": True
            },
            {
                "type": "WEBP",
                "mime_types": ["image/webp"], 
                "max_size": "10MB",
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

@app.post("/api/parse-invoice", response_model=ParseResponse)
async def parse_invoice(file: UploadFile = File(...)):
    """
    Parse an uploaded invoice image and extract structured data.
    
    Supports: JPG, JPEG, PNG, WEBP
    Returns: Structured JSON data following Indian GST invoice standards
    """
    start_time = datetime.now()
    
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file.content_type}. Supported: JPG, PNG, WEBP"
            )
        
        # Check file size (max 10MB)
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File too large. Maximum size: 10MB")
        
        if not model:
            raise HTTPException(status_code=500, detail="Gemini model not available. Check API key.")
        
        # Process image with Gemini
        try:
            if file.content_type.startswith('image/'):
                image = Image.open(BytesIO(file_content))
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Use the parser-enhanced prompt
                formatted_prompt = prompt_template.format()
                
                # Create message with image and formatted prompt
                message = HumanMessage(
                    content=[
                        {"type": "text", "text": formatted_prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/{file.content_type.split('/')[-1]};base64,{base64.b64encode(file_content).decode()}"}}
                    ]
                )
                
                # Generate content with Gemini
                response = model.invoke([message])
                response_text = response.content.strip()
                
                # Use the parser to validate and structure the response
                try:
                    # The parser will automatically handle JSON parsing and validation
                    invoice_data = parser.parse(response_text)
                    
                    # Add raw response for debugging
                    invoice_data.raw_text = response_text
                    
                    processing_time = (datetime.now() - start_time).total_seconds()
                    
                    return ParseResponse(
                        success=True,
                        data=invoice_data,
                        processing_time=processing_time
                    )
                    
                except Exception as parse_error:
                    # Parser will provide better error messages
                    return ParseResponse(
                        success=False,
                        error=f"Failed to parse AI response: {str(parse_error)}",
                        data=InvoiceData(
                            raw_text=response_text,
                            extraction_confidence="low"
                        )
                    )
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini processing error: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        return ParseResponse(
            success=False,
            error=f"Unexpected error: {str(e)}"
        )

@app.post("/api/save-invoice", response_model=SaveResponse)
async def save_invoice_to_database(invoice_data: InvoiceData):
    """
    Save extracted invoice data to PostgreSQL database.
    
    Args:
        invoice_data: InvoiceData model with extracted invoice information
        
    Returns:
        SaveResponse with success status and invoice ID or error details
    """
    if not DATABASE_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Database not available. Check DATABASE_URL configuration."
        )
    
    try:
        # Save invoice to database
        result = save_invoice_to_db(invoice_data)
        
        if result["success"]:
            return SaveResponse(
                success=True,
                message=result["message"],
                invoice_id=result["invoice_id"],
                duplicate=result.get("duplicate", False)
            )
        else:
            # Handle specific error cases
            if result.get("duplicate"):
                return SaveResponse(
                    success=False,
                    message=result["message"],
                    duplicate=True,
                    error=result["error"]
                )
            else:
                return SaveResponse(
                    success=False,
                    message=result["message"],
                    error=result["error"]
                )
                
    except Exception as e:
        logger.error(f"Unexpected error in save_invoice_to_database: {e}")
        return SaveResponse(
            success=False,
            message="Internal server error while saving invoice",
            error=f"Unexpected error: {str(e)}"
        )