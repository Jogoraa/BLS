from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import connect_to_mongo, close_mongo_connection
from .api import auth, shipments, bids, websocket, payments

app = FastAPI(
    title="Birtu Logistics API",
    description="API for Birtu Logistics platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(shipments.router, prefix="/api/shipments", tags=["shipments"])
app.include_router(bids.router, prefix="/api/bids", tags=["bids"])
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(websocket.router)

@app.get("/")
async def root():
    return {"message": "Birtu Logistics API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


