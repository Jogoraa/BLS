export const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Authentication
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  VERIFY_OTP: '/auth/verify-otp',
  
  // Shipments
  SHIPMENTS: '/shipments',
  SHIPMENTS_AVAILABLE: '/shipments/available',
  PUBLISH_SHIPMENT: (id) => `/shipments/${id}/publish`,
  UPDATE_LOCATION: (id) => `/shipments/${id}/location`,
  UPDATE_RECEIVER: (id) => `/shipments/${id}/receiver`,
  UPDATE_VEHICLE: (id) => `/shipments/${id}/vehicle`,
  UPDATE_SCHEDULE: (id) => `/shipments/${id}/schedule`,
  UPDATE_PHOTOS: (id) => `/shipments/${id}/photos`,
  
  // Bidding
  BIDS: '/bids',
  ACCEPT_BID: (id) => `/bids/${id}/accept`,
  
  // Tracking & Delivery
  TRACKING: (shipmentId) => `/tracking/${shipmentId}`,
  PICKUP: (id) => `/deliveries/${id}/pickup`,
  DELIVER: (id) => `/deliveries/${id}/deliver`,
  CONFIRM_DELIVERY: (id) => `/deliveries/${id}/confirm`,
  
  // Payments
  INITIATE_PAYMENT: '/payments/initiate',
  PAYMENT_WEBHOOK: '/payments/webhook',
};

