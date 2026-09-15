from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthCheckResponse(BaseModel):
    status: str
    service: str
    version: str


@router.get("/health", response_model=HealthCheckResponse)
def health_check():
    return {
        "status": "healthy",
        "service": "College ERP API",
        "version": "1.0.0",
    }
