import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { colors } from '../../config/colors';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const AvailableShipmentsScreen = ({ navigation }) => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    loadAvailableShipments();
  }, []);

  const loadAvailableShipments = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch from the API
      // const response = await ApiService.getAvailableShipments();
      
      // Sample data for demonstration
      const sampleShipments = [
        {
          id: '1',
          customerId: 'customer1',
          customerName: 'Sarah Johnson',
          pickupLocation: {
            address: 'Bole Atlas, Addis Ababa',
            coordinates: [38.7578, 9.0192],
          },
          dropoffLocation: {
            address: 'Piazza, Addis Ababa',
            coordinates: [38.7469, 9.0320],
          },
          itemDescription: 'Electronics package - laptop and accessories',
          weightKg: 3.5,
          urgency: 'medium',
          vehicleRequirements: ['motorbike', 'pickup'],
          estimatedDistance: 8.5,
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          photos: ['photo1.jpg', 'photo2.jpg'],
          bidCount: 2,
        },
        {
          id: '2',
          customerId: 'customer2',
          customerName: 'Ahmed Hassan',
          pickupLocation: {
            address: 'Merkato, Addis Ababa',
            coordinates: [38.7469, 8.9806],
          },
          dropoffLocation: {
            address: '4 Kilo, Addis Ababa',
            coordinates: [38.7578, 9.0320],
          },
          itemDescription: 'Furniture - small table and chairs',
          weightKg: 25.0,
          urgency: 'high',
          vehicleRequirements: ['pickup', 'truck'],
          estimatedDistance: 12.3,
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
          photos: ['photo3.jpg'],
          bidCount: 0,
        },
        {
          id: '3',
          customerId: 'customer3',
          customerName: 'Meron Tadesse',
          pickupLocation: {
            address: 'CMC, Addis Ababa',
            coordinates: [38.7578, 8.9806],
          },
          dropoffLocation: {
            address: 'Kazanchis, Addis Ababa',
            coordinates: [38.7469, 9.0192],
          },
          itemDescription: 'Documents and office supplies',
          weightKg: 1.2,
          urgency: 'low',
          vehicleRequirements: ['motorbike'],
          estimatedDistance: 5.8,
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
          photos: [],
          bidCount: 1,
        },
      ];
      
      setShipments(sampleShipments);
    } catch (error) {
      Alert.alert('Error', 'Failed to load shipments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAvailableShipments();
    setRefreshing(false);
  };

  const submitBid = (shipment) => {
    navigation.navigate('BidSubmission', { shipment });
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.gray[500];
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'high':
        return 'Urgent';
      case 'medium':
        return 'Express';
      case 'low':
        return 'Standard';
      default:
        return 'Standard';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'motorbike':
        return 'bicycle';
      case 'pickup':
        return 'car';
      case 'truck':
        return 'bus';
      default:
        return 'car';
    }
  };

  const getVehicleName = (vehicleType) => {
    switch (vehicleType) {
      case 'motorbike':
        return 'Motorbike';
      case 'pickup':
        return 'Pickup';
      case 'truck':
        return 'Truck';
      default:
        return 'Vehicle';
    }
  };

  const renderShipmentCard = (shipment) => {
    const canBid = shipment.vehicleRequirements.some(vehicle => 
      user?.vehicleTypes?.includes(vehicle)
    );

    return (
      <View key={shipment.id} style={styles.shipmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{shipment.customerName}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(shipment.createdAt)}</Text>
          </View>
          <View style={styles.urgencyBadge}>
            <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(shipment.urgency) }]} />
            <Text style={[styles.urgencyText, { color: getUrgencyColor(shipment.urgency) }]}>
              {getUrgencyLabel(shipment.urgency)}
            </Text>
          </View>
        </View>

        <View style={styles.locationSection}>
          <View style={styles.locationItem}>
            <View style={styles.locationIcon}>
              <Ionicons name="radio-button-on" size={12} color={colors.success} />
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {shipment.pickupLocation.address}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationItem}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={12} color={colors.error} />
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {shipment.dropoffLocation.address}
            </Text>
          </View>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemDescription} numberOfLines={2}>
            {shipment.itemDescription}
          </Text>
          <View style={styles.itemDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="scale" size={14} color={colors.gray[600]} />
              <Text style={styles.detailText}>{shipment.weightKg} kg</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="navigate" size={14} color={colors.gray[600]} />
              <Text style={styles.detailText}>{shipment.estimatedDistance} km</Text>
            </View>
            {shipment.photos.length > 0 && (
              <View style={styles.detailItem}>
                <Ionicons name="camera" size={14} color={colors.gray[600]} />
                <Text style={styles.detailText}>{shipment.photos.length} photo{shipment.photos.length > 1 ? 's' : ''}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.vehicleRequirements}>
          <Text style={styles.requirementsLabel}>Vehicle Types:</Text>
          <View style={styles.vehicleList}>
            {shipment.vehicleRequirements.map((vehicleType, index) => (
              <View key={index} style={styles.vehicleTag}>
                <Ionicons 
                  name={getVehicleIcon(vehicleType)} 
                  size={12} 
                  color={colors.primary} 
                />
                <Text style={styles.vehicleTagText}>
                  {getVehicleName(vehicleType)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.bidInfo}>
            <Text style={styles.bidCount}>
              {shipment.bidCount} bid{shipment.bidCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => navigation.navigate('ShipmentDetails', { shipment })}
            >
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
            <Button
              title="Submit Bid"
              onPress={() => submitBid(shipment)}
              style={[
                styles.bidButton,
                !canBid && styles.disabledButton,
              ]}
              disabled={!canBid}
            />
          </View>
        </View>

        {!canBid && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={16} color={colors.warning} />
            <Text style={styles.warningText}>
              Your vehicle type doesn't match the requirements
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading available shipments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Available Shipments</Text>
          <Text style={styles.subtitle}>
            {shipments.length} shipment{shipments.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        {shipments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>No Shipments Available</Text>
            <Text style={styles.emptyText}>
              Check back later for new shipment opportunities.
            </Text>
            <Button
              title="Refresh"
              onPress={onRefresh}
              variant="outline"
              style={styles.refreshButton}
            />
          </View>
        ) : (
          <View style={styles.shipmentsContainer}>
            {shipments.map(renderShipmentCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'Roboto',
  },
  refreshButton: {
    paddingHorizontal: 32,
  },
  shipmentsContainer: {
    gap: 16,
  },
  shipmentCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
    fontFamily: 'Roboto',
  },
  timeAgo: {
    fontSize: 12,
    color: colors.gray[500],
    fontFamily: 'Roboto',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  locationSection: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    width: 16,
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
    fontFamily: 'Roboto',
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: colors.gray[300],
    marginLeft: 8,
    marginVertical: 2,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.gray[800],
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  vehicleRequirements: {
    marginBottom: 16,
  },
  requirementsLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 6,
    fontFamily: 'Roboto',
  },
  vehicleList: {
    flexDirection: 'row',
    gap: 8,
  },
  vehicleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  vehicleTagText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidInfo: {
    flex: 1,
  },
  bidCount: {
    fontSize: 12,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  viewButtonText: {
    fontSize: 12,
    color: colors.gray[700],
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  bidButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  warningText: {
    fontSize: 12,
    color: colors.warning,
    fontFamily: 'Roboto',
  },
});

export default AvailableShipmentsScreen;

