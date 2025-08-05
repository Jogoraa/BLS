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
import { useShipment } from '../../context/ShipmentContext';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const BidReviewScreen = ({ navigation }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingBid, setAcceptingBid] = useState(null);

  const { currentShipment, setBids: setContextBids } = useShipment();
  const { user } = useAuth();

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch bids from the API
      // For now, we'll simulate some sample bids
      const sampleBids = [
        {
          id: '1',
          driverId: 'driver1',
          driverName: 'Ahmed Hassan',
          driverRating: 4.8,
          vehicleType: 'motorbike',
          amount: 150,
          estimatedTime: '30 minutes',
          status: 'pending',
          bidTime: new Date(Date.now() - 10 * 60 * 1000),
        },
        {
          id: '2',
          driverId: 'driver2',
          driverName: 'Meron Tadesse',
          driverRating: 4.9,
          vehicleType: 'pickup',
          amount: 280,
          estimatedTime: '45 minutes',
          status: 'pending',
          bidTime: new Date(Date.now() - 5 * 60 * 1000),
        },
        {
          id: '3',
          driverId: 'driver3',
          driverName: 'Solomon Bekele',
          driverRating: 4.6,
          vehicleType: 'motorbike',
          amount: 120,
          estimatedTime: '25 minutes',
          status: 'pending',
          bidTime: new Date(Date.now() - 15 * 60 * 1000),
        },
      ];
      
      setBids(sampleBids);
      setContextBids(sampleBids);
    } catch (error) {
      Alert.alert('Error', 'Failed to load bids. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBids();
    setRefreshing(false);
  };

  const acceptBid = async (bid) => {
    Alert.alert(
      'Accept Bid',
      `Accept ${bid.driverName}'s bid for ${bid.amount} ETB?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              setAcceptingBid(bid.id);
              
              // In a real implementation, you would call the API
              // await ApiService.acceptBid(bid.id);
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              Alert.alert(
                'Bid Accepted!',
                `${bid.driverName} will pick up your shipment. You'll receive tracking information soon.`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('OrderTracking', { bidId: bid.id }),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to accept bid. Please try again.');
            } finally {
              setAcceptingBid(null);
            }
          },
        },
      ]
    );
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
        return 'Pickup Truck';
      case 'truck':
        return 'Truck';
      default:
        return 'Vehicle';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color={colors.warning} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color={colors.warning} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color={colors.gray[300]} />
      );
    }

    return stars;
  };

  const renderBidCard = (bid) => {
    const isAccepting = acceptingBid === bid.id;

    return (
      <View key={bid.id} style={styles.bidCard}>
        <View style={styles.bidHeader}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{bid.driverName}</Text>
              <View style={styles.ratingContainer}>
                {renderStars(bid.driverRating)}
                <Text style={styles.ratingText}>({bid.driverRating})</Text>
              </View>
            </View>
          </View>
          <View style={styles.bidAmount}>
            <Text style={styles.amountText}>{bid.amount} ETB</Text>
            <Text style={styles.timeText}>{formatTimeAgo(bid.bidTime)}</Text>
          </View>
        </View>

        <View style={styles.bidDetails}>
          <View style={styles.detailItem}>
            <Ionicons name={getVehicleIcon(bid.vehicleType)} size={16} color={colors.gray[600]} />
            <Text style={styles.detailText}>{getVehicleName(bid.vehicleType)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color={colors.gray[600]} />
            <Text style={styles.detailText}>ETA: {bid.estimatedTime}</Text>
          </View>
        </View>

        <View style={styles.bidActions}>
          <Button
            title={isAccepting ? 'Accepting...' : 'Accept Bid'}
            onPress={() => acceptBid(bid)}
            style={styles.acceptButton}
            loading={isAccepting}
            disabled={acceptingBid && acceptingBid !== bid.id}
          />
          <TouchableOpacity
            style={styles.messageButton}
            disabled={acceptingBid}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading bids...</Text>
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
          <Text style={styles.title}>Review Bids</Text>
          <Text style={styles.subtitle}>
            {bids.length} driver{bids.length !== 1 ? 's' : ''} interested in your shipment
          </Text>
        </View>

        {bids.length === 0 ? (
          <View style={styles.noBidsContainer}>
            <Ionicons name="hourglass-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.noBidsTitle}>Waiting for Bids</Text>
            <Text style={styles.noBidsText}>
              Drivers are reviewing your shipment. Bids will appear here when available.
            </Text>
            <Button
              title="Refresh"
              onPress={onRefresh}
              variant="outline"
              style={styles.refreshButton}
            />
          </View>
        ) : (
          <View style={styles.bidsContainer}>
            {bids.map(renderBidCard)}
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            Compare bids carefully. Consider driver rating, vehicle type, and estimated time along with price.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Back to Edit"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.backButton}
          disabled={acceptingBid}
        />
        <Button
          title="Cancel Shipment"
          onPress={() => {
            Alert.alert(
              'Cancel Shipment',
              'Are you sure you want to cancel this shipment?',
              [
                { text: 'No', style: 'cancel' },
                { 
                  text: 'Yes, Cancel',
                  style: 'destructive',
                  onPress: () => navigation.navigate('Home')
                },
              ]
            );
          }}
          variant="outline"
          style={styles.cancelButton}
          disabled={acceptingBid}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  noBidsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noBidsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  noBidsText: {
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
  bidsContainer: {
    gap: 16,
  },
  bidCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  bidAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Roboto',
  },
  timeText: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
    fontFamily: 'Roboto',
  },
  bidDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  bidActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
    marginLeft: 12,
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});

export default BidReviewScreen;

