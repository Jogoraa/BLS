from typing import Dict, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from ..models.shipment import ShipmentInDB
from ..models.user import UserInDB
from .shipment_service import ShipmentService

class PaymentService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.shipment_collection = database.shipments
        self.payment_transactions_collection = database.payment_transactions
        self.shipment_service = ShipmentService(database)

    async def initiate_payment(
        self, 
        shipment_id: str, 
        amount: float, 
        payment_method: str, 
        user_id: str
    ) -> Dict:
        """Initiates a payment for a given shipment."""
        shipment = await self.shipment_service.get_shipment_by_id(shipment_id)
        if not shipment:
            raise ValueError("Shipment not found")

        if shipment.status != "accepted":
            raise ValueError("Shipment is not in accepted status for payment")

        # Simulate interaction with external payment gateways
        transaction_id = str(ObjectId()) # Generate a unique transaction ID
        payment_status = "pending"

        if payment_method == "telebirr":
            # Simulate Telebirr API call
            print(f"Initiating Telebirr payment for {amount} ETB for shipment {shipment_id}")
            # In a real scenario, this would involve API calls to Telebirr
            # and handling their response, callbacks, etc.
            # For demonstration, we'll immediately set to success or pending
            payment_status = "success" # For simulation, assume immediate success
        elif payment_method == "cbe_birr":
            # Simulate CBE Birr API call
            print(f"Initiating CBE Birr payment for {amount} ETB for shipment {shipment_id}")
            # In a real scenario, this would involve API calls to CBE Birr
            payment_status = "success" # For simulation, assume immediate success
        else:
            raise ValueError("Unsupported payment method")

        # Record the transaction
        transaction_data = {
            "_id": ObjectId(transaction_id),
            "shipment_id": ObjectId(shipment_id),
            "user_id": ObjectId(user_id),
            "amount": amount,
            "payment_method": payment_method,
            "status": payment_status,
            "initiated_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        await self.payment_transactions_collection.insert_one(transaction_data)

        # Update shipment status if payment is successful
        if payment_status == "success":
            await self.shipment_service.update_shipment(
                shipment_id, 
                {"status": "paid", "payment_transaction_id": ObjectId(transaction_id)}
            )

        return {
            "transaction_id": transaction_id,
            "status": payment_status,
            "message": f"Payment initiated via {payment_method}. Status: {payment_status}"
        }

    async def handle_payment_callback(self, callback_data: Dict) -> Dict:
        """Handles callbacks from payment gateways."""
        # In a real scenario, this would parse the callback data
        # and update the transaction status in the database.
        print(f"Received payment callback: {callback_data}")

        transaction_id = callback_data.get("transaction_id")
        new_status = callback_data.get("status")

        if not transaction_id or not new_status:
            raise ValueError("Invalid callback data")

        result = await self.payment_transactions_collection.update_one(
            {"_id": ObjectId(transaction_id)},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )

        if result.modified_count == 0:
            raise ValueError("Transaction not found or not updated")

        # If payment is successful, update shipment status
        if new_status == "success":
            transaction = await self.payment_transactions_collection.find_one({"_id": ObjectId(transaction_id)})
            if transaction:
                await self.shipment_service.update_shipment(
                    str(transaction["shipment_id"]), 
                    {"status": "paid", "payment_transaction_id": ObjectId(transaction_id)}
                )

        return {"message": "Callback processed successfully"}

    async def get_payment_status(self, transaction_id: str) -> Optional[Dict]:
        """Retrieves the status of a payment transaction."""
        transaction = await self.payment_transactions_collection.find_one({"_id": ObjectId(transaction_id)})
        if transaction:
            return {
                "transaction_id": str(transaction["_id"]),
                "shipment_id": str(transaction["shipment_id"]),
                "amount": transaction["amount"],
                "payment_method": transaction["payment_method"],
                "status": transaction["status"],
                "initiated_at": transaction["initiated_at"].isoformat(),
                "updated_at": transaction["updated_at"].isoformat(),
            }
        return None


