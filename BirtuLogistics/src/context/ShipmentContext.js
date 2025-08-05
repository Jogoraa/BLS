import React, { createContext, useContext, useState } from 'react';

const ShipmentContext = createContext();

export const useShipment = () => {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error('useShipment must be used within a ShipmentProvider');
  }
  return context;
};

export const ShipmentProvider = ({ children }) => {
  const [currentShipment, setCurrentShipment] = useState({
    pickupLocation: null,
    dropoffLocation: null,
    receiverInfo: null,
    vehicleTypes: [],
    schedule: null,
    urgency: 'medium',
    itemDetails: null,
    photos: [],
    bids: [],
    status: 'draft',
    acceptedBid: null, // New field for accepted bid
  });

  const [shipments, setShipments] = useState([]); // For customer's past shipments or driver's available shipments

  const setLocations = (pickup, dropoff) => {
    setCurrentShipment(prev => ({
      ...prev,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
    }));
  };

  const setReceiverInfo = (receiverInfo) => {
    setCurrentShipment(prev => ({
      ...prev,
      receiverInfo,
    }));
  };

  const setVehicleTypes = (vehicleTypes) => {
    setCurrentShipment(prev => ({
      ...prev,
      vehicleTypes,
    }));
  };

  const setSchedule = (datetime, urgency) => {
    setCurrentShipment(prev => ({
      ...prev,
      schedule: datetime,
      urgency,
    }));
  };

  const setItemDetails = (description, weight) => {
    setCurrentShipment(prev => ({
      ...prev,
      itemDetails: {
        description,
        weight,
      },
    }));
  };

  const setPhotos = (photos) => {
    setCurrentShipment(prev => ({
      ...prev,
      photos,
    }));
  };

  const setBids = (bids) => {
    setCurrentShipment(prev => ({
      ...prev,
      bids,
    }));
  };

  const setAcceptedBid = (bid) => {
    setCurrentShipment(prev => ({
      ...prev,
      acceptedBid: bid,
      status: 'accepted', // Update shipment status when a bid is accepted
    }));
  };

  const resetShipment = () => {
    setCurrentShipment({
      pickupLocation: null,
      dropoffLocation: null,
      receiverInfo: null,
      vehicleTypes: [],
      schedule: null,
      urgency: 'medium',
      itemDetails: null,
      photos: [],
      bids: [],
      status: 'draft',
      acceptedBid: null,
    });
  };

  const publishShipment = async () => {
    try {
      // In a real implementation, this would call the API to publish the shipment
      // const response = await ApiService.createShipment(currentShipment);
      
      setCurrentShipment(prev => ({
        ...prev,
        status: 'published',
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentShipment,
    shipments,
    setShipments,
    setLocations,
    setReceiverInfo,
    setVehicleTypes,
    setSchedule,
    setItemDetails,
    setPhotos,
    setBids,
    setAcceptedBid,
    resetShipment,
    publishShipment,
  };

  return (
    <ShipmentContext.Provider value={value}>
      {children}
    </ShipmentContext.Provider>
  );
};

