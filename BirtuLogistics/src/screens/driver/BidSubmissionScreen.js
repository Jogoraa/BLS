import React, { useState } from 'react';
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
import Input from '../../components/common/Input';
import { colors } from '../../config/colors';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const BidSubmissionScreen = ({ route, navigation }) => {
  const { shipment } = route.params;
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { user } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!bidAmount.trim()) {
      newErrors.bidAmount = 'Bid amount is required';
    } else if (isNaN(parseFloat(bidAmount)) || parseFloat(bidAmount) <= 0) {
      newErrors.bidAmount = 'Please enter a valid amount';
    } else if (parseFloat(bidAmount) < 50) {
      newErrors.bidAmount = 'Minimum bid amount is 50 ETB';
    }

    if (!estimatedTime.trim()) {
      newErrors.estimatedTime = 'Estimated time is required';
    } else if (isNaN(parseInt(estimatedTime)) || parseInt(estimatedTime) <= 0) {
      newErrors.estimatedTime = 'Please enter a valid time in minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSuggestedBid = () => {
    // Simple calculation based on distance, weight, and urgency
    const baseRate = 15; // ETB per km
    const weightMultiplier = Math.max(1, shipment.weightKg / 10);
    const urgencyMultiplier = shipment.urgency === 'high' ? 2 : shipment.urgency === 'medium' ? 1.5 : 1;
    
    const suggested = Math.round(
      shipment.estimatedDistance * baseRate * weightMultiplier * urgencyMultiplier
    );
    
    return suggested;
  };

  const suggestedBid = calculateSuggestedBid();

  const submitBid = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const bidData = {
        shipmentId: shipment.id,
        driverId: user.id,
        amount: parseFloat(bidAmount),
        estimatedTimeMinutes: parseInt(estimatedTime),
        notes: notes.trim(),
        vehicleType: user.vehicleType,
      };

      // In a real implementation, you would call the API
      // await ApiService.submitBid(bidData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Bid Submitted!',
        'Your bid has been submitted successfully. The customer will review it and get back to you.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const useSuggestedBid = () => {
    setBidAmount(suggestedBid.toString());
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Submit Your Bid</Text>
          <Text style={styles.subtitle}>
            Provide your best offer for this shipment
          </Text>
        </View>

        {/* Shipment Summary */}
        <View style={styles.shipmentSummary}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Shipment Details</Text>
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
                <Ionicons name="radio-button-on" size={14} color={colors.success} />
              </View>
              <Text style={styles.locationText}>
                From: {shipment.pickupLocation.address}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.locationItem}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={14} color={colors.error} />
              </View>
              <Text style={styles.locationText}>
                To: {shipment.dropoffLocation.address}
              </Text>
            </View>
          </View>

          <View style={styles.shipmentDetails}>
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
          </View>
        </View>

        {/* Bid Form */}
        <View style={styles.bidForm}>
          <Text style={styles.formTitle}>Your Bid</Text>

          <View style={styles.suggestedBidContainer}>
            <View style={styles.suggestedBidInfo}>
              <Text style={styles.suggestedBidLabel}>Suggested Bid:</Text>
              <Text style={styles.suggestedBidAmount}>{suggestedBid} ETB</Text>
            </View>
            <TouchableOpacity
              style={styles.useSuggestedButton}
              onPress={useSuggestedBid}
            >
              <Text style={styles.useSuggestedText}>Use This</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Bid Amount (ETB)"
            placeholder="Enter your bid amount"
            value={bidAmount}
            onChangeText={setBidAmount}
            keyboardType="numeric"
            leftIcon="cash"
            error={errors.bidAmount}
          />

          <Input
            label="Estimated Pickup Time (minutes)"
            placeholder="How long to reach pickup location"
            value={estimatedTime}
            onChangeText={setEstimatedTime}
            keyboardType="numeric"
            leftIcon="time"
            error={errors.estimatedTime}
          />

          <Input
            label="Additional Notes (Optional)"
            placeholder="Any special considerations or messages"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            leftIcon="chatbubble-outline"
          />
        </View>

        {/* Bid Guidelines */}
        <View style={styles.guidelines}>
          <Text style={styles.guidelinesTitle}>Bidding Guidelines</Text>
          <View style={styles.guidelinesList}>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.guidelineText}>
                Consider distance, weight, and urgency when pricing
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.guidelineText}>
                Be realistic with your estimated pickup time
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.guidelineText}>
                Competitive bids have higher chances of acceptance
              </Text>
            </View>
            <View style={styles.guidelineItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.guidelineText}>
                Clear communication builds trust with customers
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
          disabled={submitting}
        />
        <Button
          title={submitting ? 'Submitting...' : 'Submit Bid'}
          onPress={submitBid}
          style={styles.submitButton}
          loading={submitting}
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
  shipmentSummary: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
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
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    width: 18,
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
    marginLeft: 9,
    marginVertical: 2,
  },
  shipmentDetails: {
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
  bidForm: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  suggestedBidContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  suggestedBidInfo: {
    flex: 1,
  },
  suggestedBidLabel: {
    fontSize: 12,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  suggestedBidAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Roboto',
  },
  useSuggestedButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  useSuggestedText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  guidelines: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 12,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  guidelinesList: {
    gap: 8,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  guidelineText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default BidSubmissionScreen;

