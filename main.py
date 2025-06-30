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
from langchain_openai import ChatOpenAI

load_dotenv()

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

EXTRACTION_PROMPT = """
You are an expert at extracting structured data from Indian GST-compliant invoices. 

Analyze this invoice image and extract the following information in JSON format:

{
  "invoice_number": "string - Invoice number/ID",
  "invoice_date": "string - Invoice date in DD-MM-YYYY format",
  "due_date": "string - Due date if mentioned",
  "currency": "INR",
  "vendor_information": {
    "company_name": "string - Vendor company name",
    "gstin": "string - Vendor GSTIN number",
    "address": {
      "street": "string - Street address",
      "city": "string - City",
      "state": "string - State",
      "country": "string - Country",
      "pincode": "string - PIN code"
    },
    "phone": "string - Phone number",
    "email": "string - Email address"
  },
  "customer_information": {
    "company_name": "string - Customer company name",
    "gstin": "string - Customer GSTIN number",
    "address": {
      "street": "string - Street address", 
      "city": "string - City",
      "state": "string - State",
      "country": "string - Country",
      "pincode": "string - PIN code"
    }
  },
  "line_items": [
    {
      "serial_number": "number - Serial number",
      "description": "string - Product/service description",
      "hsn_code": "string - HSN/SAC code",
      "quantity": "number - Quantity",
      "unit": "string - Unit of measurement",
      "rate": "number - Rate per unit",
      "amount": "number - Total amount for this line"
    }
  ],
  "tax_calculations": {
    "taxable_amount": "number - Total taxable amount",
    "cgst_rate": "number - CGST rate percentage",
    "cgst_amount": "number - CGST amount",
    "sgst_rate": "number - SGST rate percentage", 
    "sgst_amount": "number - SGST amount",
    "igst_rate": "number - IGST rate percentage",
    "igst_amount": "number - IGST amount",
    "total_tax": "number - Total tax amount"
  },
  "gross_amount": "number - Gross amount before tax",
  "net_amount": "number - Final payable amount",
  "amount_in_words": "string - Amount in words",
  "qr_code_data": "string - QR code content if visible",
  "extraction_confidence": "high/medium/low - Your confidence in the extraction"
}

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
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "gemini_available": model is not None,
        "version": "1.0.0"
    }

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
            # For image files
            if file.content_type.startswith('image/'):
                image = Image.open(BytesIO(file_content))
                # Convert to RGB if necessary
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Create message with image and text
                message = HumanMessage(
                    content=[
                        {"type": "text", "text": EXTRACTION_PROMPT},
                        {"type": "image_url", "image_url": {"url": f"data:image/{file.content_type.split('/')[-1]};base64,{base64.b64encode(file_content).decode()}"}}
                    ]
                )
                
                # Generate content with Gemini
                response = model.invoke([message])
            
            # Parse the response
            response_text = response.content.strip()
            
            # Clean up the response (remove markdown formatting if present)
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            # Parse JSON response
            try:
                extracted_data = json.loads(response_text)
                
                # Add raw response for debugging
                extracted_data['raw_text'] = response_text
                
                # Validate and create InvoiceData object
                invoice_data = InvoiceData(**extracted_data)
                
                processing_time = (datetime.now() - start_time).total_seconds()
                
                return ParseResponse(
                    success=True,
                    data=invoice_data,
                    processing_time=processing_time
                )
                
            except json.JSONDecodeError as e:
                # If JSON parsing fails, return raw text for debugging
                return ParseResponse(
                    success=False,
                    error=f"Failed to parse AI response as JSON: {str(e)}",
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