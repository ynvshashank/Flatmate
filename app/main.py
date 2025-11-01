from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api.api_v1.api import api_router
from .api.api_v1.endpoints import auth, houses, tasks
from .core.config import settings

app = FastAPI(
    title="Flatmate API",
    description="Backend API for Flatmate shared task management app",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers at root level (for frontend compatibility)
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(houses.router, prefix="/houses", tags=["houses"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])

# Include full API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to Flatmate API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
