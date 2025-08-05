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

const MyBidsScreen = ({ navigation }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, accepted, rejected

  const { user } = useAuth();

  useEffect(() => {
    loadMyBids();
  }, []);

  const loadMyBids = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch from the API
      // const response = await ApiService.getMyBids();
      
      // Sample data for demonstration
      const sampleBids = [
        {
          id: '1',
          shipmentId: 'ship1',
          customerId: 'customer1',
          customerName: 'Sarah Johnson',
          amount: 150,
          estimatedTimeMinutes: 30,
          status: 'accepted',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          respondedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          pickupLocation: 'Bole Atlas, Addis Ababa',
          dropoffLocation: 'Piazza, Addis Ababa',
          itemDescription: 'Electronics package',
          distance: 8.5,
          notes: 'I can pick up immediately',
        },
        {
          id: '2',
          shipmentId: 'ship2',
          customerId: 'customer2',
          customerName: 'Ahmed Hassan',
          amount: 280,
          estimatedTimeMinutes: 45,
          status: 'pending',
          submittedAt: new Date(Date.now() - 30 * 60 * 1000),
          pickupLocation: 'Merkato, Addis Ababa',
          dropoffLocation: '4 Kilo, Addis Ababa',
          itemDescription: 'Furniture - small table',
          distance: 12.3,
          notes: 'Have pickup truck available',
        },
        {
          id: '3',
          shipmentId: 'ship3',
          customerId: 'customer3',
          customerName: 'Meron Tadesse',
          amount: 120,
          estimatedTimeMinutes: 25,
          status: 'rejected',
          submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          respondedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          pickupLocation: 'CMC, Addis Ababa',
          dropoffLocation: 'Kazanchis, Addis Ababa',
          itemDescription: 'Documents',
          distance: 5.8,
          notes: 'Quick delivery available',
        },
        {
          id: '4',
          shipmentId: 'ship4',
          customerId: 'customer4',
          customerName: 'Daniel Bekele',
          amount: 200,
          estimatedTimeMinutes: 40,
          status: 'pending',
          submittedAt: new Date(Date.now() - 15 * 60 * 1000),
          pickupLocation: 'Lebu, Addis Ababa',
          dropoffLocation: 'Bole, Addis Ababa',
          itemDescription: 'Medical supplies',
          distance: 15.2,
          notes: 'Careful handling guaranteed',
        },
      ];
      
      setBids(sampleBids);
    } catch (error) {
      Alert.alert('Error', 'Failed to load bids. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyBids();
    setRefreshing(false);
  };

  const getFilteredBids = () => {
    if (activeTab === 'all') return bids;
    return bids.filter(bid => bid.status === activeTab);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'pending':
        return colors.warning;
      default:
        return colors.gray[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
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

  const startDelivery = (bid) => {
    navigation.navigate('DeliveryTracking', { 
      shipment: {
        id: bid.shipmentId,
        customerName: bid.customerName,
        pickupLocation: { address: bid.pickupLocation },
        dropoffLocation: { address: bid.dropoffLocation },
        itemDescription: bid.itemDescription,
        weightKg: 0, // This would come from the full shipment data
        estimatedDistance: bid.distance,
        acceptedBid: bid,
      }
    });
  };

  const renderTabButton = (tab, label, count) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[styles.tabBadge, isActive && styles.activeTabBadge]}>
            <Text style={[styles.tabBadgeText, isActive && styles.activeTabBadgeText]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderBidCard = (bid) => {
    return (
      <View key={bid.id} style={styles.bidCard}>
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{bid.customerName}</Text>
            <Text style={styles.timeAgo}>Bid submitted {formatTimeAgo(bid.submittedAt)}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons
              name={getStatusIcon(bid.status)}
              size={16}
              color={getStatusColor(bid.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(bid.status) }]}>
              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.locationSection}>
          <View style={styles.locationItem}>
            <Ionicons name="radio-button-on" size={12} color={colors.success} />
            <Text style={styles.locationText} numberOfLines={1}>
              {bid.pickupLocation}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationItem}>
            <Ionicons name="location" size={12} color={colors.error} />
            <Text style={styles.locationText} numberOfLines={1}>
              {bid.dropoffLocation}
            </Text>
          </View>
        </View>

        <View style={styles.bidDetails}>
          <Text style={styles.itemDescription} numberOfLines={1}>
            {bid.itemDescription}
          </Text>
          <View style={styles.bidInfo}>
            <View style={styles.bidInfoItem}>
              <Text style={styles.bidLabel}>Your Bid:</Text>
              <Text style={styles.bidAmount}>{bid.amount} ETB</Text>
            </View>
            <View style={styles.bidInfoItem}>
              <Text style={styles.bidLabel}>ETA:</Text>
              <Text style={styles.bidValue}>{bid.estimatedTimeMinutes} min</Text>
            </View>
            <View style={styles.bidInfoItem}>
              <Text style={styles.bidLabel}>Distance:</Text>
              <Text style={styles.bidValue}>{bid.distance} km</Text>
            </View>
          </View>
        </View>

        {bid.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Your Notes:</Text>
            <Text style={styles.notesText}>{bid.notes}</Text>
          </View>
        )}

        {bid.status === 'accepted' && (
          <View style={styles.acceptedSection}>
            <View style={styles.acceptedInfo}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.acceptedText}>
                Accepted {formatTimeAgo(bid.respondedAt)}
              </Text>
            </View>
            <Button
              title="Start Delivery"
              onPress={() => startDelivery(bid)}
              style={styles.startButton}
            />
          </View>
        )}

        {bid.status === 'rejected' && bid.respondedAt && (
          <View style={styles.rejectedSection}>
            <Ionicons name="close-circle" size={16} color={colors.error} />
            <Text style={styles.rejectedText}>
              Rejected {formatTimeAgo(bid.respondedAt)}
            </Text>
          </View>
        )}

        {bid.status === 'pending' && (
          <View style={styles.pendingSection}>
            <Ionicons name="time" size={16} color={colors.warning} />
            <Text style={styles.pendingText}>
              Waiting for customer response
            </Text>
          </View>
        )}
      </View>
    );
  };

  const filteredBids = getFilteredBids();
  const bidCounts = {
    all: bids.length,
    pending: bids.filter(b => b.status === 'pending').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your bids...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bids</Text>
        <Text style={styles.subtitle}>
          Track your submitted bids and deliveries
        </Text>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('all', 'All', bidCounts.all)}
        {renderTabButton('pending', 'Pending', bidCounts.pending)}
        {renderTabButton('accepted', 'Accepted', bidCounts.accepted)}
        {renderTabButton('rejected', 'Rejected', bidCounts.rejected)}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBids.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'all' ? 'No Bids Yet' : `No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bids`}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'all' 
                ? 'Start bidding on available shipments to see them here.'
                : `You don't have any ${activeTab} bids at the moment.`}
            </Text>
            {activeTab === 'all' && (
              <Button
                title="Find Shipments"
                onPress={() => navigation.navigate('AvailableShipments')}
                style={styles.findShipmentsButton}
              />
            )}
          </View>
        ) : (
          <View style={styles.bidsContainer}>
            {filteredBids.map(renderBidCard)}
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
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    gap: 4,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  activeTabButtonText: {
    color: colors.white,
  },
  tabBadge: {
    backgroundColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: colors.white,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  activeTabBadgeText: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
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
  findShipmentsButton: {
    paddingHorizontal: 32,
  },
  bidsContainer: {
    gap: 16,
  },
  bidCard: {
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
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
    marginLeft: 6,
    marginVertical: 2,
  },
  bidDetails: {
    marginBottom: 12,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.gray[800],
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  bidInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bidInfoItem: {
    alignItems: 'center',
  },
  bidLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 2,
    fontFamily: 'Roboto',
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Roboto',
  },
  bidValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    fontFamily: 'Roboto',
  },
  notesSection: {
    backgroundColor: colors.gray[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  notesText: {
    fontSize: 14,
    color: colors.gray[800],
    fontFamily: 'Roboto',
  },
  acceptedSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    padding: 12,
    borderRadius: 8,
  },
  acceptedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptedText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  startButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rejectedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  rejectedText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  pendingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  pendingText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
});

export default MyBidsScreen;

