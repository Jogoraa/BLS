from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from bson import ObjectId
from enum import Enum
from datetime import datetime

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetJsonSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return {"type": "string"}

class ShipmentStatus(str, Enum):
    DRAFT = "draft"
    BIDDING = "bidding"
    ACCEPTED = "accepted"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class BidStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class UrgencyLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class VehicleType(str, Enum):
    MOTORBIKE = "motorbike"
    PICKUP = "pickup"
    TRUCK = "truck"

class Location(BaseModel):
    coordinates: List[float] = Field(..., description="[longitude, latitude]")
    address: str = Field(..., description="Human readable address")

class ReceiverInfo(BaseModel):
    name: str = Field(..., description="Receiver's name")
    phone: str = Field(..., description="Receiver's phone number")

class Bid(BaseModel):
    driver_id: PyObjectId = Field(..., description="Driver's user ID")
    amount: float = Field(..., description="Bid amount in ETB")
    status: BidStatus = Field(default=BidStatus.PENDING, description="Bid status")
    bid_time: datetime = Field(default_factory=datetime.utcnow, description="When the bid was placed")

class DeliveryConfirmation(BaseModel):
    receiver_photos: List[str] = Field(default_factory=list, description="Photos of receiver/delivery")
    confirmation_time: datetime = Field(default_factory=datetime.utcnow, description="When delivery was confirmed")

class ShipmentBase(BaseModel):
    pickup_location: Optional[Location] = Field(None, description="Pickup location")
    dropoff_location: Optional[Location] = Field(None, description="Dropoff location")
    receiver_info: Optional[ReceiverInfo] = Field(None, description="Receiver information")
    vehicle_requirements: List[VehicleType] = Field(default_factory=list, description="Required vehicle types")
    shipment_date: Optional[datetime] = Field(None, description="Scheduled shipment date")
    photos: List[str] = Field(default_factory=list, description="Shipment photos (Cloudinary URLs)")
    item_description: str = Field(default="", description="Description of items to be shipped")
    weight_kg: float = Field(default=0.0, description="Weight in kilograms")
    urgency: UrgencyLevel = Field(default=UrgencyLevel.MEDIUM, description="Urgency level")

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(BaseModel):
    pickup_location: Optional[Location] = None
    dropoff_location: Optional[Location] = None
    receiver_info: Optional[ReceiverInfo] = None
    vehicle_requirements: Optional[List[VehicleType]] = None
    shipment_date: Optional[datetime] = None
    photos: Optional[List[str]] = None
    item_description: Optional[str] = None
    weight_kg: Optional[float] = None
    urgency: Optional[UrgencyLevel] = None

class ShipmentInDB(ShipmentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    customer_id: PyObjectId = Field(..., description="Customer's user ID")
    status: ShipmentStatus = Field(default=ShipmentStatus.DRAFT, description="Shipment status")
    bids: List[Bid] = Field(default_factory=list, description="Bids from drivers")
    accepted_bid_id: Optional[PyObjectId] = Field(None, description="ID of accepted bid")
    delivery_confirmation: Optional[DeliveryConfirmation] = Field(None, description="Delivery confirmation details")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: str}

class Shipment(ShipmentBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    customer_id: PyObjectId = Field(..., description="Customer's user ID")
    status: ShipmentStatus = Field(default=ShipmentStatus.DRAFT, description="Shipment status")
    bids: List[Bid] = Field(default_factory=list, description="Bids from drivers")
    accepted_bid_id: Optional[PyObjectId] = Field(None, description="ID of accepted bid")
    delivery_confirmation: Optional[DeliveryConfirmation] = Field(None, description="Delivery confirmation details")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: str}

class BidCreate(BaseModel):
    shipment_id: PyObjectId = Field(..., description="Shipment ID")
    amount: float = Field(..., description="Bid amount in ETB")

class BidResponse(BaseModel):
    id: PyObjectId = Field(..., alias="_id")
    shipment_id: PyObjectId = Field(..., description="Shipment ID")
    driver_id: PyObjectId = Field(..., description="Driver's user ID")
    amount: float = Field(..., description="Bid amount in ETB")
    status: BidStatus = Field(..., description="Bid status")
    bid_time: datetime = Field(..., description="When the bid was placed")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: str}

