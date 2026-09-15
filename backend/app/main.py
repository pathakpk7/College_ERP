from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router
from app.db.init_db import init_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="College ERP System API Backend",
    version="1.0.0",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {
        "message": "Welcome to the College ERP System API backend",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
    }
