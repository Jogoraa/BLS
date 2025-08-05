import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { colors } from '../../config/colors';
import { useAuth } from '../../context/AuthContext';
import ApiService from '../../services/api';

const PaymentScreen = ({ route, navigation }) => {
  const { shipment, acceptedBid } = route.params;
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would fetch from the API
      // const response = await ApiService.getPaymentMethods();
      
      // Sample payment methods for demonstration
      const methods = [
        {
          id: 'telebirr',
          name: 'Telebirr',
          description: 'Pay using Telebirr mobile wallet',
          icon: 'phone-portrait',
          supported: true,
          processingFee: 0.02, // 2%
        },
        {
          id: 'cbe_birr',
          name: 'CBE Birr',
          description: 'Pay using Commercial Bank of Ethiopia Birr',
          icon: 'card',
          supported: true,
          processingFee: 0.015, // 1.5%
        },
      ];
      
      setPaymentMethods(methods);
      setSelectedMethod(methods[0]); // Default to first method
    } catch (error) {
      Alert.alert('Error', 'Failed to load payment methods. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const bidAmount = acceptedBid?.amount || 0;
    const processingFee = selectedMethod ? bidAmount * selectedMethod.processingFee : 0;
    return bidAmount + processingFee;
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }

    try {
      setProcessing(true);
      
      const paymentData = {
        shipment_id: shipment.id,
        amount: calculateTotal(),
        payment_method: selectedMethod.id,
      };

      // In a real implementation, you would call the API
      // const response = await ApiService.initiatePayment(paymentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Alert.alert(
        'Payment Successful!',
        `Your payment of ${calculateTotal().toFixed(2)} ETB has been processed successfully via ${selectedMethod.name}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PaymentSuccess', { 
              shipment, 
              acceptedBid, 
              paymentMethod: selectedMethod,
              amount: calculateTotal()
            }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentMethod = (method) => {
    const isSelected = selectedMethod?.id === method.id;

    return (
      <TouchableOpacity
        key={method.id}
        style={[styles.methodCard, isSelected && styles.selectedMethodCard]}
        onPress={() => setSelectedMethod(method)}
        disabled={!method.supported}
      >
        <View style={styles.methodHeader}>
          <View style={styles.methodIcon}>
            <Ionicons
              name={method.icon}
              size={24}
              color={isSelected ? colors.primary : colors.gray[600]}
            />
          </View>
          <View style={styles.methodInfo}>
            <Text style={[styles.methodName, isSelected && styles.selectedMethodName]}>
              {method.name}
            </Text>
            <Text style={[styles.methodDescription, isSelected && styles.selectedMethodDescription]}>
              {method.description}
            </Text>
          </View>
          <View style={styles.selectionIndicator}>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </View>
        </View>
        
        {method.processingFee > 0 && (
          <View style={styles.feeInfo}>
            <Text style={styles.feeText}>
              Processing fee: {(method.processingFee * 100).toFixed(1)}%
            </Text>
          </View>
        )}

        {!method.supported && (
          <View style={styles.unsupportedBanner}>
            <Text style={styles.unsupportedText}>Coming Soon</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>
            Complete your payment to confirm the delivery
          </Text>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Delivery Service</Text>
            <Text style={styles.summaryValue}>{acceptedBid?.amount || 0} ETB</Text>
          </View>

          {selectedMethod && selectedMethod.processingFee > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>
                Processing Fee ({(selectedMethod.processingFee * 100).toFixed(1)}%)
              </Text>
              <Text style={styles.summaryValue}>
                {((acceptedBid?.amount || 0) * selectedMethod.processingFee).toFixed(2)} ETB
              </Text>
            </View>
          )}

          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
            <Text style={styles.summaryTotalValue}>
              {calculateTotal().toFixed(2)} ETB
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.methodsTitle}>Select Payment Method</Text>
          <View style={styles.methodsList}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </View>

        {/* Shipment Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Shipment Details</Text>
          
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

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={styles.securityText}>
            Your payment is secured with bank-level encryption
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
          disabled={processing}
        />
        <Button
          title={processing ? 'Processing...' : `Pay ${calculateTotal().toFixed(2)} ETB`}
          onPress={processPayment}
          style={styles.payButton}
          loading={processing}
          disabled={!selectedMethod || processing}
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
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  summaryValue: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    fontFamily: 'Roboto',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Roboto',
  },
  methodsSection: {
    marginBottom: 20,
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  methodsList: {
    gap: 12,
  },
  methodCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedMethodCard: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
    fontFamily: 'Roboto',
  },
  selectedMethodName: {
    color: colors.primary,
  },
  methodDescription: {
    fontSize: 14,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  selectedMethodDescription: {
    color: colors.gray[700],
  },
  selectionIndicator: {
    width: 24,
    alignItems: 'center',
  },
  feeInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  feeText: {
    fontSize: 12,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  unsupportedBanner: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  unsupportedText: {
    fontSize: 12,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  detailsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 16,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: colors.success,
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
  cancelButton: {
    flex: 1,
  },
  payButton: {
    flex: 2,
  },
});

export default PaymentScreen;

