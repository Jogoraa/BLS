import json
from typing import Dict, List, Optional
from datetime import datetime
from ..api.websocket import manager

class NotificationService:
    def __init__(self):
        self.user_connections: Dict[str, List] = {}
    
    async def send_notification(self, user_id: str, notification: Dict):
        """Send notification to a specific user"""
        notification_data = {
            "type": "notification",
            "timestamp": datetime.utcnow().isoformat(),
            "data": notification
        }
        
        # In a real implementation, you would:
        # 1. Store the notification in the database
        # 2. Send via WebSocket if user is online
        # 3. Send push notification if user is offline
        
        # For now, we'll just broadcast via WebSocket
        await manager.broadcast(json.dumps(notification_data))
    
    async def notify_new_bid(self, customer_id: str, bid_data: Dict):
        """Notify customer about a new bid"""
        notification = {
            "title": "New Bid Received",
            "message": f"You received a new bid of {bid_data['amount']} ETB",
            "type": "new_bid",
            "shipment_id": bid_data["shipment_id"],
            "bid_id": bid_data["id"],
            "driver_name": bid_data["driver_name"]
        }
        await self.send_notification(customer_id, notification)
    
    async def notify_bid_accepted(self, driver_id: str, bid_data: Dict):
        """Notify driver that their bid was accepted"""
        notification = {
            "title": "Bid Accepted!",
            "message": f"Your bid of {bid_data['amount']} ETB was accepted",
            "type": "bid_accepted",
            "shipment_id": bid_data["shipment_id"],
            "bid_id": bid_data["id"],
            "customer_name": bid_data["customer_name"]
        }
        await self.send_notification(driver_id, notification)
    
    async def notify_bid_rejected(self, driver_id: str, bid_data: Dict):
        """Notify driver that their bid was rejected"""
        notification = {
            "title": "Bid Not Selected",
            "message": "Your bid was not selected for this shipment",
            "type": "bid_rejected",
            "shipment_id": bid_data["shipment_id"],
            "bid_id": bid_data["id"]
        }
        await self.send_notification(driver_id, notification)
    
    async def notify_status_update(self, customer_id: str, status_data: Dict):
        """Notify customer about shipment status update"""
        status_messages = {
            "heading_to_pickup": "Driver is heading to pickup location",
            "arrived_at_pickup": "Driver has arrived at pickup location",
            "item_collected": "Item has been collected",
            "in_transit": "Your item is on the way",
            "delivered": "Your item has been delivered!"
        }
        
        notification = {
            "title": "Shipment Update",
            "message": status_messages.get(status_data["status"], "Shipment status updated"),
            "type": "status_update",
            "shipment_id": status_data["shipment_id"],
            "status": status_data["status"],
            "driver_name": status_data.get("driver_name")
        }
        await self.send_notification(customer_id, notification)
    
    async def notify_delivery_request(self, drivers: List[str], shipment_data: Dict):
        """Notify drivers about a new shipment request"""
        notification = {
            "title": "New Shipment Available",
            "message": f"New shipment from {shipment_data['pickup_location']} to {shipment_data['dropoff_location']}",
            "type": "new_shipment",
            "shipment_id": shipment_data["id"],
            "distance": shipment_data.get("distance"),
            "urgency": shipment_data.get("urgency")
        }
        
        # Send to all eligible drivers
        for driver_id in drivers:
            await self.send_notification(driver_id, notification)

# Global notification service instance
notification_service = NotificationService()

