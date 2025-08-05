import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors } from '../../config/colors';
import { useShipment } from '../../context/ShipmentContext';

const LocationScreen = ({ navigation }) => {
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [selectingPickup, setSelectingPickup] = useState(true);
  const [region, setRegion] = useState({
    latitude: 9.0320,
    longitude: 38.7469,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { setPickupLocation: setContextPickupLocation, setDropoffLocation: setContextDropoffLocation } = useShipment();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setCurrentLocation(coords);
      setRegion({
        ...coords,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location.');
    }
  };

  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    
    try {
      const address = await reverseGeocode(coordinate);
      
      if (selectingPickup) {
        setPickupLocation(coordinate);
        setPickupAddress(address);
      } else {
        setDropoffLocation(coordinate);
        setDropoffAddress(address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const reverseGeocode = async (coordinate) => {
    try {
      const result = await Location.reverseGeocodeAsync(coordinate);
      if (result.length > 0) {
        const location = result[0];
        return `${location.street || ''} ${location.city || ''} ${location.region || ''}`.trim();
      }
      return `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`;
    } catch (error) {
      return `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`;
    }
  };

  const useCurrentLocationForPickup = () => {
    if (currentLocation) {
      setPickupLocation(currentLocation);
      reverseGeocode(currentLocation).then(setPickupAddress);
    }
  };

  const switchToDropoffSelection = () => {
    if (!pickupLocation) {
      Alert.alert('Select Pickup Location', 'Please select a pickup location first.');
      return;
    }
    setSelectingPickup(false);
  };

  const switchToPickupSelection = () => {
    setSelectingPickup(true);
  };

  const handleContinue = () => {
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert('Incomplete Selection', 'Please select both pickup and dropoff locations.');
      return;
    }

    setContextPickupLocation({
      coordinates: [pickupLocation.longitude, pickupLocation.latitude],
      address: pickupAddress,
    });

    setContextDropoffLocation({
      coordinates: [dropoffLocation.longitude, dropoffLocation.latitude],
      address: dropoffAddress,
    });

    navigation.navigate('ReceiverInfo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Locations</Text>
        <Text style={styles.subtitle}>
          {selectingPickup ? 'Tap on the map to select pickup location' : 'Tap on the map to select dropoff location'}
        </Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, selectingPickup && styles.activeToggle]}
          onPress={switchToPickupSelection}
        >
          <Text style={[styles.toggleText, selectingPickup && styles.activeToggleText]}>
            Pickup
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !selectingPickup && styles.activeToggle]}
          onPress={switchToDropoffSelection}
        >
          <Text style={[styles.toggleText, !selectingPickup && styles.activeToggleText]}>
            Dropoff
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
        >
          {pickupLocation && (
            <Marker
              coordinate={pickupLocation}
              title="Pickup Location"
              description={pickupAddress}
              pinColor={colors.primary}
            />
          )}
          {dropoffLocation && (
            <Marker
              coordinate={dropoffLocation}
              title="Dropoff Location"
              description={dropoffAddress}
              pinColor={colors.error}
            />
          )}
        </MapView>
      </View>

      <View style={styles.addressContainer}>
        {pickupLocation && (
          <View style={styles.addressItem}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.addressText}>
              <Text style={styles.addressLabel}>Pickup Location</Text>
              <Text style={styles.addressValue}>{pickupAddress}</Text>
            </View>
          </View>
        )}

        {dropoffLocation && (
          <View style={styles.addressItem}>
            <Ionicons name="flag" size={20} color={colors.error} />
            <View style={styles.addressText}>
              <Text style={styles.addressLabel}>Dropoff Location</Text>
              <Text style={styles.addressValue}>{dropoffAddress}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {selectingPickup && currentLocation && (
          <Button
            title="Use Current Location"
            onPress={useCurrentLocationForPickup}
            variant="outline"
            style={styles.currentLocationButton}
          />
        )}

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!pickupLocation || !dropoffLocation}
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
  header: {
    padding: 20,
    paddingBottom: 10,
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
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  activeToggleText: {
    color: colors.white,
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  addressContainer: {
    padding: 20,
    paddingTop: 10,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  addressText: {
    marginLeft: 12,
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    fontFamily: 'Roboto',
  },
  addressValue: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
    fontFamily: 'Roboto',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  currentLocationButton: {
    marginBottom: 12,
  },
  continueButton: {
    marginBottom: 10,
  },
});

export default LocationScreen;

