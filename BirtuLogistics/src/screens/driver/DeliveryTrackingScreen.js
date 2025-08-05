import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { colors } from '../../config/colors';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const DeliveryTrackingScreen = ({ route, navigation }) => {
  const { shipment: initialShipment } = route.params;
  const [shipment, setShipment] = useState(initialShipment);
  const [currentStatus, setCurrentStatus] = useState('accepted');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const deliverySteps = [
    {
      id: 'accepted',
      title: 'Bid Accepted',
      description: 'Your bid has been accepted by the customer',
      icon: 'checkmark-circle',
      completed: true,
    },
    {
      id: 'heading_to_pickup',
      title: 'Heading to Pickup',
      description: 'On the way to pickup location',
      icon: 'navigate',
      completed: currentStatus !== 'accepted',
    },
    {
      id: 'arrived_at_pickup',
      title: 'Arrived at Pickup',
      description: 'Arrived at pickup location',
      icon: 'location',
      completed: ['arrived_at_pickup', 'item_collected', 'in_transit', 'delivered'].includes(currentStatus),
    },
    {
      id: 'item_collected',
      title: 'Item Collected',
      description: 'Item has been collected from sender',
      icon: 'cube',
      completed: ['item_collected', 'in_transit', 'delivered'].includes(currentStatus),
    },
    {
      id: 'in_transit',
      title: 'In Transit',
      description: 'On the way to delivery location',
      icon: 'car',
      completed: ['in_transit', 'delivered'].includes(currentStatus),
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Item successfully delivered to recipient',
      icon: 'trophy',
      completed: currentStatus === 'delivered',
    },
  ];

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
      
      // In a real implementation, you would call the API
      // await ApiService.updateShipmentStatus(shipment.id, newStatus);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentStatus(newStatus);
      
      // Show appropriate message
      const messages = {
        heading_to_pickup: 'Status updated! Customer has been notified.',
        arrived_at_pickup: 'Great! Let the customer know you\'ve arrived.',
        item_collected: 'Item collected! Now heading to delivery location.',
        in_transit: 'In transit! Customer can track your progress.',
        delivered: 'Delivery completed! Great job!',
      };
      
      if (messages[newStatus]) {
        Alert.alert('Status Updated', messages[newStatus]);
      }
      
      if (newStatus === 'delivered') {
        // Navigate to completion screen or back to main screen
        setTimeout(() => {
          navigation.navigate('DeliveryComplete', { shipment });
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getNextAction = () => {
    switch (currentStatus) {
      case 'accepted':
        return {
          title: 'Start Journey',
          action: () => updateStatus('heading_to_pickup'),
          icon: 'play',
        };
      case 'heading_to_pickup':
        return {
          title: 'Arrived at Pickup',
          action: () => updateStatus('arrived_at_pickup'),
          icon: 'location',
        };
      case 'arrived_at_pickup':
        return {
          title: 'Collect Item',
          action: () => updateStatus('item_collected'),
          icon: 'cube',
        };
      case 'item_collected':
        return {
          title: 'Start Delivery',
          action: () => updateStatus('in_transit'),
          icon: 'car',
        };
      case 'in_transit':
        return {
          title: 'Mark as Delivered',
          action: () => confirmDelivery(),
          icon: 'checkmark-circle',
        };
      default:
        return null;
    }
  };

  const confirmDelivery = () => {
    Alert.alert(
      'Confirm Delivery',
      'Are you sure the item has been delivered to the recipient?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => updateStatus('delivered'),
        },
      ]
    );
  };

  const callCustomer = () => {
    Alert.alert(
      'Call Customer',
      `Would you like to call ${shipment.customerName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, this would initiate a phone call
            Alert.alert('Calling...', 'This would open the phone dialer');
          },
        },
      ]
    );
  };

  const openMaps = () => {
    const currentLocation = currentStatus === 'accepted' || currentStatus === 'heading_to_pickup'
      ? shipment.pickupLocation
      : shipment.dropoffLocation;
    
    Alert.alert(
      'Open Maps',
      `Navigate to ${currentLocation.address}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Maps',
          onPress: () => {
            // In a real app, this would open maps with navigation
            Alert.alert('Opening Maps...', 'This would open navigation to the location');
          },
        },
      ]
    );
  };

  const renderProgressStep = (step, index) => {
    const isActive = step.id === currentStatus;
    const isCompleted = step.completed;

    return (
      <View key={step.id} style={styles.stepContainer}>
        <View style={styles.stepIndicator}>
          <View style={[
            styles.stepIcon,
            isCompleted && styles.completedStepIcon,
            isActive && styles.activeStepIcon,
          ]}>
            <Ionicons
              name={isCompleted ? 'checkmark' : step.icon}
              size={20}
              color={isCompleted || isActive ? colors.white : colors.gray[400]}
            />
          </View>
          {index < deliverySteps.length - 1 && (
            <View style={[
              styles.stepLine,
              isCompleted && styles.completedStepLine,
            ]} />
          )}
        </View>
        <View style={styles.stepContent}>
          <Text style={[
            styles.stepTitle,
            isActive && styles.activeStepTitle,
            isCompleted && styles.completedStepTitle,
          ]}>
            {step.title}
          </Text>
          <Text style={[
            styles.stepDescription,
            isActive && styles.activeStepDescription,
          ]}>
            {step.description}
          </Text>
        </View>
      </View>
    );
  };

  const nextAction = getNextAction();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Delivery Tracking</Text>
          <Text style={styles.subtitle}>
            Shipment #{shipment.id.slice(-6).toUpperCase()}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.customerCard}>
          <View style={styles.customerHeader}>
            <View style={styles.customerAvatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{shipment.customerName}</Text>
              <Text style={styles.customerLabel}>Customer</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={callCustomer}
            >
              <Ionicons name="call" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Location */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Text style={styles.locationTitle}>Current Destination</Text>
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={openMaps}
            >
              <Ionicons name="navigate" size={16} color={colors.primary} />
              <Text style={styles.mapsButtonText}>Open Maps</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationInfo}>
            <Ionicons
              name={currentStatus === 'accepted' || currentStatus === 'heading_to_pickup' ? 'radio-button-on' : 'location'}
              size={16}
              color={currentStatus === 'accepted' || currentStatus === 'heading_to_pickup' ? colors.success : colors.error}
            />
            <Text style={styles.locationAddress}>
              {currentStatus === 'accepted' || currentStatus === 'heading_to_pickup'
                ? shipment.pickupLocation.address
                : shipment.dropoffLocation.address}
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Delivery Progress</Text>
          <View style={styles.stepsContainer}>
            {deliverySteps.map((step, index) => renderProgressStep(step, index))}
          </View>
        </View>

        {/* Shipment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Shipment Details</Text>
          <View style={styles.detailsContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Item:</Text>
              <Text style={styles.detailValue}>{shipment.itemDescription}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weight:</Text>
              <Text style={styles.detailValue}>{shipment.weightKg} kg</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance:</Text>
              <Text style={styles.detailValue}>{shipment.estimatedDistance} km</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Your Bid:</Text>
              <Text style={styles.detailValue}>{shipment.acceptedBid?.amount || 'N/A'} ETB</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      {nextAction && currentStatus !== 'delivered' && (
        <View style={styles.actionContainer}>
          <Button
            title={nextAction.title}
            onPress={nextAction.action}
            style={styles.actionButton}
            loading={loading}
            leftIcon={nextAction.icon}
          />
        </View>
      )}
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
  customerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  customerLabel: {
    fontSize: 12,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    fontFamily: 'Roboto',
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapsButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationAddress: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
    fontFamily: 'Roboto',
  },
  progressContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  stepsContainer: {
    gap: 0,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedStepIcon: {
    backgroundColor: colors.success,
  },
  activeStepIcon: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.gray[200],
    marginTop: 4,
  },
  completedStepLine: {
    backgroundColor: colors.success,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  activeStepTitle: {
    color: colors.primary,
  },
  completedStepTitle: {
    color: colors.gray[900],
  },
  stepDescription: {
    fontSize: 14,
    color: colors.gray[500],
    fontFamily: 'Roboto',
  },
  activeStepDescription: {
    color: colors.gray[600],
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  detailsContent: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  detailValue: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  actionContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  actionButton: {
    width: '100%',
  },
});

export default DeliveryTrackingScreen;

