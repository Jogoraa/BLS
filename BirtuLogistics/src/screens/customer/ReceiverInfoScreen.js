import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors } from '../../config/colors';
import { useShipment } from '../../context/ShipmentContext';

const ReceiverInfoScreen = ({ navigation }) => {
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [errors, setErrors] = useState({});

  const { setReceiverInfo } = useShipment();

  const validateForm = () => {
    const newErrors = {};

    if (!receiverName.trim()) {
      newErrors.receiverName = 'Receiver name is required';
    }

    if (!receiverPhone.trim()) {
      newErrors.receiverPhone = 'Receiver phone number is required';
    } else if (!/^(\+251|0)[79]\d{8}$/.test(receiverPhone.trim())) {
      newErrors.receiverPhone = 'Please enter a valid Ethiopian phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    setReceiverInfo({
      name: receiverName.trim(),
      phone: receiverPhone.trim(),
    });

    navigation.navigate('VehicleSelection');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Receiver Information</Text>
            <Text style={styles.subtitle}>
              Please provide the receiver's contact details
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Receiver's Full Name"
              placeholder="Enter receiver's full name"
              value={receiverName}
              onChangeText={setReceiverName}
              leftIcon="person"
              error={errors.receiverName}
            />

            <Input
              label="Receiver's Phone Number"
              placeholder="Enter receiver's phone number"
              value={receiverPhone}
              onChangeText={setReceiverPhone}
              keyboardType="phone-pad"
              leftIcon="call"
              error={errors.receiverPhone}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Important Note</Text>
              <Text style={styles.infoText}>
                The receiver will be contacted by the driver for delivery confirmation. 
                Please ensure the phone number is correct and active.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
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
  form: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  infoText: {
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
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});

export default ReceiverInfoScreen;

