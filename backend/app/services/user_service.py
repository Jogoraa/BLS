from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from ..models.user import UserInDB, UserCreate, UserUpdate

class UserService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.users

    async def create_user(self, user_data: dict) -> UserInDB:
        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return UserInDB(**user_data)

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        user_data = await self.collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            return UserInDB(**user_data)
        return None

    async def get_user_by_phone(self, phone: str) -> Optional[UserInDB]:
        user_data = await self.collection.find_one({"phone": phone})
        if user_data:
            return UserInDB(**user_data)
        return None

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        user_data = await self.collection.find_one({"email": email})
        if user_data:
            return UserInDB(**user_data)
        return None

    async def update_user(self, user_id: str, update_data: dict) -> Optional[UserInDB]:
        update_data["updated_at"] = datetime.utcnow().isoformat()
        result = await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.modified_count:
            return await self.get_user_by_id(user_id)
        return None

    async def delete_user(self, user_id: str) -> bool:
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

    async def get_users_by_role(self, role: str) -> List[UserInDB]:
        cursor = self.collection.find({"role": role})
        users = []
        async for user_data in cursor:
            users.append(UserInDB(**user_data))
        return users

    async def get_drivers_by_vehicle_type(self, vehicle_type: str) -> List[UserInDB]:
        cursor = self.collection.find({
            "role": "driver",
            "vehicle_type": vehicle_type,
            "verification_status": "verified"
        })
        drivers = []
        async for driver_data in cursor:
            drivers.append(UserInDB(**driver_data))
        return drivers

