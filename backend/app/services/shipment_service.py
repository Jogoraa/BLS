from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from ..models.shipment import ShipmentInDB, ShipmentCreate, ShipmentUpdate, Bid, BidCreate, BidResponse
from ..services.notification_service import notification_service
from .user_service import UserService
from ..services.cloudinary_service import CloudinaryService
from ..core.config import settings

class ShipmentService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.shipments
        self.bids_collection = database.bids
        self.user_service = UserService(database)
        self.cloudinary_service = CloudinaryService(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )
    async def create_shipment(self, shipment_data: dict, customer_id: str) -> ShipmentInDB:
        shipment_data["customer_id"] = ObjectId(customer_id)
        shipment_data["created_at"] = datetime.utcnow()
        shipment_data["updated_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(shipment_data)
        shipment_data["_id"] = result.inserted_id
        return ShipmentInDB(**shipment_data)

    async def get_shipment_by_id(self, shipment_id: str) -> Optional[ShipmentInDB]:
        shipment_data = await self.collection.find_one({"_id": ObjectId(shipment_id)})
        if shipment_data:
            return ShipmentInDB(**shipment_data)
        return None

    async def update_shipment(self, shipment_id: str, update_data: dict) -> Optional[ShipmentInDB]:
        update_data["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one(
            {"_id": ObjectId(shipment_id)},
            {"$set": update_data}
        )
        
        if result.modified_count:
            return await self.get_shipment_by_id(shipment_id)
        return None

    async def get_shipments_by_customer(self, customer_id: str) -> List[ShipmentInDB]:
        cursor = self.collection.find({"customer_id": ObjectId(customer_id)})
        shipments = []
        async for shipment_data in cursor:
            shipments.append(ShipmentInDB(**shipment_data))
        return shipments

    async def get_available_shipments(self, vehicle_types: List[str] = None) -> List[ShipmentInDB]:
        query = {"status": "bidding"}
        if vehicle_types:
            query["vehicle_requirements"] = {"$in": vehicle_types}
        
        cursor = self.collection.find(query)
        shipments = []
        async for shipment_data in cursor:
            shipments.append(ShipmentInDB(**shipment_data))
        return shipments

    async def publish_shipment(self, shipment_id: str) -> Optional[ShipmentInDB]:
        return await self.update_shipment(shipment_id, {"status": "bidding"})

    async def accept_shipment(self, shipment_id: str, bid_id: str) -> Optional[ShipmentInDB]:
        update_data = {
            "status": "accepted",
            "accepted_bid_id": ObjectId(bid_id)
        }
        return await self.update_shipment(shipment_id, update_data)

    async def start_transit(self, shipment_id: str) -> Optional[ShipmentInDB]:
        return await self.update_shipment(shipment_id, {"status": "in_transit"})

    async def complete_delivery(self, shipment_id: str, delivery_data: dict) -> Optional[ShipmentInDB]:
        update_data = {
            "status": "delivered",
            "delivery_confirmation": delivery_data
        }
        return await self.update_shipment(shipment_id, update_data)

    async def cancel_shipment(self, shipment_id: str) -> Optional[ShipmentInDB]:
        return await self.update_shipment(shipment_id, {"status": "cancelled"})

    # Bid management
    async def create_bid(self, bid_data: dict, driver_id: str) -> BidResponse:
        bid_data["driver_id"] = ObjectId(driver_id)
        bid_data["bid_time"] = datetime.utcnow()
        bid_data["status"] = "pending"
        
        result = await self.bids_collection.insert_one(bid_data)
        bid_data["_id"] = result.inserted_id
        
        # Also add bid to shipment
        await self.collection.update_one(
            {"_id": bid_data["shipment_id"]},
            {"$push": {"bids": {
                "driver_id": bid_data["driver_id"],
                "amount": bid_data["amount"],
                "status": "pending",
                "bid_time": bid_data["bid_time"]
            }}}
        )
        
        return BidResponse(**bid_data)

    async def get_bid_by_id(self, bid_id: str) -> Optional[BidResponse]:
        bid_data = await self.bids_collection.find_one({"_id": ObjectId(bid_id)})
        if bid_data:
            return BidResponse(**bid_data)
        return None

    async def get_bids_by_shipment(self, shipment_id: str) -> List[BidResponse]:
        cursor = self.bids_collection.find({"shipment_id": ObjectId(shipment_id)})
        bids = []
        async for bid_data in cursor:
            bids.append(BidResponse(**bid_data))
        return bids

    async def get_bids_by_driver(self, driver_id: str) -> List[BidResponse]:
        cursor = self.bids_collection.find({"driver_id": ObjectId(driver_id)})
        bids = []
        async for bid_data in cursor:
            bids.append(BidResponse(**bid_data))
        return bids

    async def accept_bid(self, bid_id: str) -> Optional[BidResponse]:
        # Update bid status
        result = await self.bids_collection.update_one(
            {"_id": ObjectId(bid_id)},
            {"$set": {"status": "accepted"}}
        )
        
        if result.modified_count:
            bid = await self.get_bid_by_id(bid_id)
            if bid:
                # Update shipment
                await self.accept_shipment(str(bid.shipment_id), bid_id)
                
                # Reject other bids for this shipment
                await self.bids_collection.update_many(
                    {
                        "shipment_id": bid.shipment_id,
                        "_id": {"$ne": ObjectId(bid_id)}
                    },
                    {"$set": {"status": "rejected"}}
                )
                
                return bid
        return None

    async def reject_bid(self, bid_id: str) -> Optional[BidResponse]:
        result = await self.bids_collection.update_one(
            {"_id": ObjectId(bid_id)},
            {"$set": {"status": "rejected"}}
        )
        
        if result.modified_count:
            return await self.get_bid_by_id(bid_id)
        return None


