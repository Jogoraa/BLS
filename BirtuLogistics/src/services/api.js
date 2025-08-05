import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = await AsyncStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async register(userData) {
    return this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async verifyOTP(otpData) {
    return this.request(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  }

  // Shipments
  async createShipment(shipmentData) {
    return this.request(API_ENDPOINTS.SHIPMENTS, {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  }

  async updateShipmentLocation(id, locationData) {
    return this.request(API_ENDPOINTS.UPDATE_LOCATION(id), {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async updateShipmentReceiver(id, receiverData) {
    return this.request(API_ENDPOINTS.UPDATE_RECEIVER(id), {
      method: 'PUT',
      body: JSON.stringify(receiverData),
    });
  }

  async updateShipmentVehicle(id, vehicleData) {
    return this.request(API_ENDPOINTS.UPDATE_VEHICLE(id), {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateShipmentSchedule(id, scheduleData) {
    return this.request(API_ENDPOINTS.UPDATE_SCHEDULE(id), {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  }

  async updateShipmentPhotos(id, photosData) {
    return this.request(API_ENDPOINTS.UPDATE_PHOTOS(id), {
      method: 'PUT',
      body: JSON.stringify(photosData),
    });
  }

  async publishShipment(id) {
    return this.request(API_ENDPOINTS.PUBLISH_SHIPMENT(id), {
      method: 'POST',
    });
  }

  async getAvailableShipments() {
    return this.request(API_ENDPOINTS.SHIPMENTS_AVAILABLE);
  }

  async getShipments() {
    return this.request(API_ENDPOINTS.SHIPMENTS);
  }

  // Bidding
  async submitBid(bidData) {
    return this.request(API_ENDPOINTS.BIDS, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  async acceptBid(bidId) {
    return this.request(API_ENDPOINTS.ACCEPT_BID(bidId), {
      method: 'PUT',
    });
  }

  // Tracking & Delivery
  async updateTracking(shipmentId, locationData) {
    return this.request(API_ENDPOINTS.TRACKING(shipmentId), {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async confirmPickup(deliveryId) {
    return this.request(API_ENDPOINTS.PICKUP(deliveryId), {
      method: 'POST',
    });
  }

  async confirmDelivery(deliveryId, deliveryData) {
    return this.request(API_ENDPOINTS.DELIVER(deliveryId), {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    });
  }

  async confirmDeliveryReceived(deliveryId) {
    return this.request(API_ENDPOINTS.CONFIRM_DELIVERY(deliveryId), {
      method: 'POST',
    });
  }

  // Payments
  async initiatePayment(paymentData) {
    return this.request(API_ENDPOINTS.INITIATE_PAYMENT, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async uploadPhoto(shipmentId, photoUri) {
    const formData = new FormData();
    formData.append('file', {
      uri: photoUri,
      name: `photo_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });

    return this.request(API_ENDPOINTS.UPLOAD_PHOTO(shipmentId), {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default new ApiService();

