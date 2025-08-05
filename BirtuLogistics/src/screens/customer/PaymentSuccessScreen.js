import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { colors } from '../../config/colors';

const PaymentSuccessScreen = ({ route, navigation }) => {
  const { shipment, acceptedBid, paymentMethod, amount } = route.params;

  const goToHome = () => {
    navigation.navigate('Home');
  };

  const trackDelivery = () => {
    navigation.navigate('DeliveryTracking', { shipment });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>
            Your payment has been processed successfully. The driver will start the delivery soon.
          </Text>
        </View>

        {/* Payment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={styles.detailValue}>{amount?.toFixed(2)} ETB</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>{paymentMethod?.name}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue}>TXN{Date.now().toString().slice(-8)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {/* Shipment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Shipment Details</Text>
          
          <View style={styles.locationSection}>
            <View style={styles.locationItem}>
              <Ionicons name="radio-button-on" size={14} color={colors.success} />
              <Text style={styles.locationText}>
                From: {shipment.pickupLocation?.address}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.locationItem}>
              <Ionicons name="location" size={14} color={colors.error} />
              <Text style={styles.locationText}>
                To: {shipment.dropoffLocation?.address}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Driver:</Text>
            <Text style={styles.detailValue}>{acceptedBid?.driverName || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Time:</Text>
            <Text style={styles.detailValue}>{acceptedBid?.estimatedTime || 'N/A'} min</Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.cardTitle}>What's Next?</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              The driver will be notified and will start heading to the pickup location
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              You'll receive real-time updates about the delivery progress
            </Text>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Track your delivery in real-time and get notified when it's completed
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.contactCard}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.contactText}>
            Need help? Contact our support team at +251-911-123456 or support@birtulogistics.com
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Go to Home"
          onPress={goToHome}
          variant="outline"
          style={styles.homeButton}
        />
        <Button
          title="Track Delivery"
          onPress={trackDelivery}
          style={styles.trackButton}
        />
      </View>
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
    alignItems: 'center',
  },
  successIcon: {
    marginVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontFamily: 'Roboto',
  },
  detailsCard: {
    width: '100%',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  locationSection: {
    marginBottom: 16,
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
    marginLeft: 7,
    marginVertical: 2,
  },
  nextStepsCard: {
    width: '100%',
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
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
    fontFamily: 'Roboto',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  contactCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '20',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: colors.info,
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 10,
    gap: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  homeButton: {
    flex: 1,
  },
  trackButton: {
    flex: 1,
  },
});

export default PaymentSuccessScreen;

