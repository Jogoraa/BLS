from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import get_database
from ..models.user import UserInDB
from ..models.shipment import BidCreate, BidResponse
from ..services.shipment_service import ShipmentService
from ..services.notification_service import notification_service
from ..api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=BidResponse)
async def submit_bid(
    bid_data: BidCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can submit bids"
        )
    
    if current_user.verification_status != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Driver must be verified to submit bids"
        )
    
    shipment_service = ShipmentService(db)
    
    # Check if shipment exists and is in bidding status
    shipment = await shipment_service.get_shipment_by_id(str(bid_data.shipment_id))
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    if shipment.status != "bidding":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shipment is not accepting bids"
        )
    
    # Check if driver's vehicle type matches requirements
    if (current_user.vehicle_type and 
        shipment.vehicle_requirements and 
        current_user.vehicle_type not in shipment.vehicle_requirements):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your vehicle type doesn't match shipment requirements"
        )
    
    # Check if driver already has a bid for this shipment
    existing_bids = await shipment_service.get_bids_by_shipment(str(bid_data.shipment_id))
    for bid in existing_bids:
        if str(bid.driver_id) == str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already submitted a bid for this shipment"
            )
    
    # Create the bid
    bid = await shipment_service.create_bid(
        bid_data.dict(),
        str(current_user.id)
    )
    
    # Notify the customer about the new bid
    await notification_service.notify_new_bid(
        customer_id=str(shipment.customer_id),
        bid_data={
            "id": str(bid.id),
            "shipment_id": str(shipment.id),
            "amount": bid.amount,
            "driver_name": current_user.full_name # Assuming driver has a full_name field
        }
    )
    
    return bid

@router.get("/shipment/{shipment_id}", response_model=List[BidResponse])
async def get_shipment_bids(
    shipment_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    
    # Check if user has access to view bids
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    # Only shipment owner can view all bids
    if (current_user.role == "customer" and 
        str(shipment.customer_id) != str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Drivers can only view their own bids
    if current_user.role == "driver":
        bids = await shipment_service.get_bids_by_driver(str(current_user.id))
        # Filter for this specific shipment
        bids = [bid for bid in bids if str(bid.shipment_id) == shipment_id]
    else:
        bids = await shipment_service.get_bids_by_shipment(shipment_id)
    
    return bids

@router.get("/my-bids", response_model=List[BidResponse])
async def get_my_bids(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can view their bids"
        )
    
    shipment_service = ShipmentService(db)
    bids = await shipment_service.get_bids_by_driver(str(current_user.id))
    return bids

@router.put("/{bid_id}/accept", response_model=BidResponse)
async def accept_bid(
    bid_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can accept bids"
        )
    
    shipment_service = ShipmentService(db)
    
    # Get the bid
    bid = await shipment_service.get_bid_by_id(bid_id)
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    
    # Check if customer owns the shipment
    shipment = await shipment_service.get_shipment_by_id(str(bid.shipment_id))
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if shipment.status != "bidding":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shipment is not in bidding status"
        )
    
    if bid.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bid is not in pending status"
        )
    
    # Accept the bid
    accepted_bid = await shipment_service.accept_bid(bid_id)

    # Notify the driver that their bid was accepted
    driver = await shipment_service.user_service.get_user_by_id(str(accepted_bid.driver_id))
    if driver:
        await notification_service.notify_bid_accepted(
            driver_id=str(driver.id),
            bid_data={
                "id": str(accepted_bid.id),
                "shipment_id": str(accepted_bid.shipment_id),
                "amount": accepted_bid.amount,
                "customer_name": current_user.full_name # Assuming customer has a full_name field
            }
        )
    
    return accepted_bid

@router.put("/{bid_id}/reject", response_model=BidResponse)
async def reject_bid(
    bid_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can reject bids"
        )
    
    shipment_service = ShipmentService(db)
    
    # Get the bid
    bid = await shipment_service.get_bid_by_id(bid_id)
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    
    # Check if customer owns the shipment
    shipment = await shipment_service.get_shipment_by_id(str(bid.shipment_id))
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if bid.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bid is not in pending status"
        )
    
    # Reject the bid
    rejected_bid = await shipment_service.reject_bid(bid_id)

    # Notify the driver that their bid was rejected
    driver = await shipment_service.user_service.get_user_by_id(str(rejected_bid.driver_id))
    if driver:
        await notification_service.notify_bid_rejected(
            driver_id=str(driver.id),
            bid_data={
                "id": str(rejected_bid.id),
                "shipment_id": str(rejected_bid.shipment_id)
            }
        )
    
    return rejected_bid

