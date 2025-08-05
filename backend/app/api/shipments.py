from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..core.database import get_database
from ..models.user import UserInDB
from ..models.shipment import (
    ShipmentCreate, ShipmentUpdate, Shipment, ShipmentInDB,
    BidCreate, BidResponse
)
from ..services.shipment_service import ShipmentService
from ..services.notification_service import notification_service
from ..api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=Shipment)
async def create_shipment(
    shipment_data: ShipmentCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can create shipments"
        )
    
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.create_shipment(
        shipment_data.dict(), 
        str(current_user.id)
    )

    # Notify eligible drivers about the new shipment
    # In a real scenario, you would filter drivers based on location, vehicle type, etc.
    # For now, we'll assume all drivers are eligible for notification
    all_drivers = await shipment_service.user_service.get_users_by_role("driver")
    eligible_driver_ids = [str(driver.id) for driver in all_drivers if driver.verification_status == "verified"]

    if eligible_driver_ids:
        await notification_service.notify_delivery_request(
            drivers=eligible_driver_ids,
            shipment_data={
                "id": str(shipment.id),
                "pickup_location": shipment.pickup_location.address,
                "dropoff_location": shipment.dropoff_location.address,
                "distance": shipment.estimated_distance,
                "urgency": shipment.urgency
            }
        )

    return shipment

@router.get("/", response_model=List[Shipment])
async def get_user_shipments(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    
    if current_user.role == "customer":
        shipments = await shipment_service.get_shipments_by_customer(str(current_user.id))
    else:
        # For drivers, get available shipments
        vehicle_types = [current_user.vehicle_type] if current_user.vehicle_type else None
        shipments = await shipment_service.get_available_shipments(vehicle_types)
    
    return shipments

@router.get("/available", response_model=List[Shipment])
async def get_available_shipments(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user.role != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can view available shipments"
        )
    
    shipment_service = ShipmentService(db)
    vehicle_types = [current_user.vehicle_type] if current_user.vehicle_type else None
    shipments = await shipment_service.get_available_shipments(vehicle_types)
    return shipments

@router.get("/{shipment_id}", response_model=Shipment)
async def get_shipment(
    shipment_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    # Check if user has access to this shipment
    if (current_user.role == "customer" and 
        str(shipment.customer_id) != str(current_user.id)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return shipment

@router.put("/{shipment_id}/location", response_model=Shipment)
async def update_shipment_location(
    shipment_id: str,
    location_data: dict,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    updated_shipment = await shipment_service.update_shipment(shipment_id, location_data)
    return updated_shipment

@router.put("/{shipment_id}/receiver", response_model=Shipment)
async def update_shipment_receiver(
    shipment_id: str,
    receiver_data: dict,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    updated_shipment = await shipment_service.update_shipment(shipment_id, receiver_data)
    return updated_shipment

@router.put("/{shipment_id}/vehicle", response_model=Shipment)
async def update_shipment_vehicle(
    shipment_id: str,
    vehicle_data: dict,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    updated_shipment = await shipment_service.update_shipment(shipment_id, vehicle_data)
    return updated_shipment

@router.put("/{shipment_id}/schedule", response_model=Shipment)
async def update_shipment_schedule(
    shipment_id: str,
    schedule_data: dict,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    updated_shipment = await shipment_service.update_shipment(shipment_id, schedule_data)
    return updated_shipment

@router.put("/{shipment_id}/photos", response_model=Shipment)
async def update_shipment_photos(
    shipment_id: str,
    photos_data: dict,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    updated_shipment = await shipment_service.update_shipment(shipment_id, photos_data)
    return updated_shipment

@router.post("/{shipment_id}/publish", response_model=Shipment)
async def publish_shipment(
    shipment_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found"
        )
    
    if shipment.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft shipments can be published"
        )
    
    updated_shipment = await shipment_service.publish_shipment(shipment_id)
    return updated_shipment

@router.post("/{shipment_id}/upload-photo", response_model=Shipment)
async def upload_shipment_photo(
    shipment_id: str,
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can upload photos for their shipments"
        )
    
    shipment_service = ShipmentService(db)
    shipment = await shipment_service.get_shipment_by_id(shipment_id)
    
    if not shipment or str(shipment.customer_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Shipment not found or access denied"
        )
    
    # Save the uploaded file temporarily
    file_location = f"/tmp/{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    # Upload to Cloudinary
    image_url = await shipment_service.cloudinary_service.upload_image(file_location)
    
    # Clean up temporary file
    import os
    os.remove(file_location)
    
    # Update shipment with new photo URL
    updated_photos = shipment.photos if shipment.photos else []
    updated_photos.append(image_url)
    
    updated_shipment = await shipment_service.update_shipment(shipment_id, {"photos": updated_photos})
    return updated_shipment

