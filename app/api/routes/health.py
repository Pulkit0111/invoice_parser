"""
Health Check Routes

Provides system health monitoring endpoints.
"""
from datetime import datetime
from fastapi import APIRouter, Depends

from app.core.config import get_settings
from app.api.dependencies import get_invoice_service, get_database_health

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(
    db_health: dict = Depends(get_database_health),
    invoice_service = Depends(get_invoice_service)
):
    """
    Comprehensive health check endpoint.
    
    Returns status of all system components:
    - API server
    - AI model availability  
    - Database connectivity
    - Service components
    """
    settings = get_settings()
    
    # Get service status
    service_status = invoice_service.get_service_status()
    
    # Build health response
    health_data = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        
        # AI Model Status
        "gemini_available": service_status["components"]["ai_available"],
        "ai_model": service_status["ai_processor"]["model_name"],
        
        # Database Status
        "database_connected": db_health["database_connected"],
        "database_url_configured": db_health["database_url_configured"],
        
        # Service Status
        "service_components": service_status["components"],
        "database_stats": service_status.get("database", {}),
        
        # Additional Info
        "message": db_health.get("message", "System operational")
    }
    
    return health_data


@router.get("/health/simple")
async def simple_health_check():
    """Simple health check for load balancers."""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}
