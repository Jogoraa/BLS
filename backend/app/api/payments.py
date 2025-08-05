from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import get_database
from ..models.user import UserInDB
from ..services.payment_service import PaymentService
from ..api.auth import get_current_user

router = APIRouter()

@router.post("/initiate")
async def initiate_payment(
    payment_data: Dict,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Initiates a payment for a shipment."""
    shipment_id = payment_data.get("shipment_id")
    amount = payment_data.get("amount")
    payment_method = payment_data.get("payment_method")

    if not shipment_id or not amount or not payment_method:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields: shipment_id, amount, payment_method"
        )

    if payment_method not in ["telebirr", "cbe_birr"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported payment method. Use 'telebirr' or 'cbe_birr'"
        )

    payment_service = PaymentService(db)

    try:
        result = await payment_service.initiate_payment(
            shipment_id=shipment_id,
            amount=amount,
            payment_method=payment_method,
            user_id=str(current_user.id)
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/callback")
async def payment_callback(
    callback_data: Dict,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Handles payment callbacks from external gateways."""
    # Note: In a real scenario, you'd validate the callback signature
    # to ensure it's coming from the legitimate payment gateway.
    payment_service = PaymentService(db)

    try:
        result = await payment_service.handle_payment_callback(callback_data)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/status/{transaction_id}")
async def get_payment_status(
    transaction_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Retrieves the status of a payment transaction."""
    payment_service = PaymentService(db)
    
    transaction = await payment_service.get_payment_status(transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return transaction

@router.get("/methods")
async def get_payment_methods():
    """Returns available payment methods."""
    return {
        "methods": [
            {
                "id": "telebirr",
                "name": "Telebirr",
                "description": "Pay using Telebirr mobile wallet",
                "icon": "telebirr_icon",
                "supported": True
            },
            {
                "id": "cbe_birr",
                "name": "CBE Birr",
                "description": "Pay using Commercial Bank of Ethiopia Birr",
                "icon": "cbe_icon",
                "supported": True
            }
        ]
    }

