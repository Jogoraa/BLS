import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { colors } from '../../config/colors';
import { useShipment } from '../../context/ShipmentContext';

const VehicleSelectionScreen = ({ navigation }) => {
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const { setVehicleRequirements } = useShipment();

  const vehicleTypes = [
    {
      id: 'motorbike',
      name: 'Motorbike',
      description: 'Small packages, documents, food delivery',
      capacity: 'Up to 20kg',
      dimensions: '40cm x 30cm x 25cm',
      icon: 'bicycle',
      estimatedPrice: '50-150 ETB',
    },
    {
      id: 'pickup',
      name: 'Pickup Truck',
      description: 'Medium packages, furniture, appliances',
      capacity: 'Up to 500kg',
      dimensions: '180cm x 120cm x 80cm',
      icon: 'car',
      estimatedPrice: '200-500 ETB',
    },
    {
      id: 'truck',
      name: 'Truck',
      description: 'Large items, bulk deliveries, commercial goods',
      capacity: 'Up to 2000kg',
      dimensions: '400cm x 200cm x 200cm',
      icon: 'bus',
      estimatedPrice: '500-1500 ETB',
    },
  ];

  const toggleVehicleSelection = (vehicleId) => {
    setSelectedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedVehicles.length === 0) {
      alert('Please select at least one vehicle type');
      return;
    }

    setVehicleRequirements(selectedVehicles);
    navigation.navigate('Schedule');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderVehicleCard = (vehicle) => {
    const isSelected = selectedVehicles.includes(vehicle.id);

    return (
      <TouchableOpacity
        key={vehicle.id}
        style={[styles.vehicleCard, isSelected && styles.selectedCard]}
        onPress={() => toggleVehicleSelection(vehicle.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={vehicle.icon}
              size={32}
              color={isSelected ? colors.white : colors.primary}
            />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleName, isSelected && styles.selectedText]}>
              {vehicle.name}
            </Text>
            <Text style={[styles.vehicleDescription, isSelected && styles.selectedSubText]}>
              {vehicle.description}
            </Text>
          </View>
          <View style={styles.checkboxContainer}>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            )}
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isSelected && styles.selectedSubText]}>
              Capacity:
            </Text>
            <Text style={[styles.detailValue, isSelected && styles.selectedText]}>
              {vehicle.capacity}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isSelected && styles.selectedSubText]}>
              Max Dimensions:
            </Text>
            <Text style={[styles.detailValue, isSelected && styles.selectedText]}>
              {vehicle.dimensions}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isSelected && styles.selectedSubText]}>
              Estimated Price:
            </Text>
            <Text style={[styles.detailValue, isSelected && styles.selectedText]}>
              {vehicle.estimatedPrice}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Vehicle Type</Text>
          <Text style={styles.subtitle}>
            Choose the vehicle types suitable for your shipment
          </Text>
        </View>

        <View style={styles.vehicleList}>
          {vehicleTypes.map(renderVehicleCard)}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            You can select multiple vehicle types to get more bids from drivers. 
            Final price will be determined through the bidding process.
          </Text>
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
  vehicleList: {
    marginBottom: 20,
  },
  vehicleCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
    fontFamily: 'Roboto',
  },
  vehicleDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
    fontFamily: 'Roboto',
  },
  selectedText: {
    color: colors.white,
  },
  selectedSubText: {
    color: colors.secondary,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
  },
  cardDetails: {
    paddingLeft: 60,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    fontFamily: 'Roboto',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
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
  continueButton: {
    flex: 2,
  },
});

export default VehicleSelectionScreen;

