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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors } from '../../config/colors';
import { useShipment } from '../../context/ShipmentContext';

const ScheduleScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [urgency, setUrgency] = useState('medium');
  const [itemDescription, setItemDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const { setSchedule, setItemDetails } = useShipment();

  const urgencyLevels = [
    {
      id: 'low',
      name: 'Standard',
      description: 'Delivery within 2-3 days',
      icon: 'time',
      color: colors.info,
      multiplier: '1x',
    },
    {
      id: 'medium',
      name: 'Express',
      description: 'Delivery within 24 hours',
      icon: 'flash',
      color: colors.warning,
      multiplier: '1.5x',
    },
    {
      id: 'high',
      name: 'Urgent',
      description: 'Same day delivery',
      icon: 'rocket',
      color: colors.error,
      multiplier: '2x',
    },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!itemDescription.trim()) {
      newErrors.itemDescription = 'Item description is required';
    }

    if (!weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }

    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(selectedTime.getHours());
    selectedDateTime.setMinutes(selectedTime.getMinutes());

    if (selectedDateTime <= now) {
      newErrors.datetime = 'Please select a future date and time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleContinue = () => {
    if (!validateForm()) return;

    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(selectedTime.getHours());
    selectedDateTime.setMinutes(selectedTime.getMinutes());

    setSchedule(selectedDateTime, urgency);
    setItemDetails(itemDescription.trim(), parseFloat(weight));

    navigation.navigate('PhotoCapture');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderUrgencyCard = (urgencyLevel) => {
    const isSelected = urgency === urgencyLevel.id;

    return (
      <TouchableOpacity
        key={urgencyLevel.id}
        style={[styles.urgencyCard, isSelected && styles.selectedUrgencyCard]}
        onPress={() => setUrgency(urgencyLevel.id)}
      >
        <View style={styles.urgencyHeader}>
          <View style={[styles.urgencyIcon, { backgroundColor: urgencyLevel.color }]}>
            <Ionicons name={urgencyLevel.icon} size={24} color={colors.white} />
          </View>
          <View style={styles.urgencyInfo}>
            <Text style={[styles.urgencyName, isSelected && styles.selectedText]}>
              {urgencyLevel.name}
            </Text>
            <Text style={[styles.urgencyDescription, isSelected && styles.selectedSubText]}>
              {urgencyLevel.description}
            </Text>
          </View>
          <View style={styles.urgencyMultiplier}>
            <Text style={[styles.multiplierText, isSelected && styles.selectedText]}>
              {urgencyLevel.multiplier}
            </Text>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule & Details</Text>
          <Text style={styles.subtitle}>
            When would you like your shipment to be picked up?
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Date & Time</Text>
          
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.dateTimeText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.gray[500]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={styles.dateTimeText}>{formatTime(selectedTime)}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.gray[500]} />
          </TouchableOpacity>

          {errors.datetime && (
            <Text style={styles.errorText}>{errors.datetime}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          
          <Input
            label="Item Description"
            placeholder="Describe what you're shipping"
            value={itemDescription}
            onChangeText={setItemDescription}
            multiline
            numberOfLines={3}
            error={errors.itemDescription}
          />

          <Input
            label="Weight (kg)"
            placeholder="Enter weight in kilograms"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            leftIcon="scale"
            error={errors.weight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Urgency</Text>
          <Text style={styles.sectionSubtitle}>
            Higher urgency levels may result in higher bids
          </Text>
          
          <View style={styles.urgencyList}>
            {urgencyLevels.map(renderUrgencyCard)}
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 16,
    fontFamily: 'Roboto',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
    marginLeft: 12,
    fontFamily: 'Roboto',
  },
  urgencyList: {
    gap: 12,
  },
  urgencyCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 16,
  },
  selectedUrgencyCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  urgencyInfo: {
    flex: 1,
  },
  urgencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    fontFamily: 'Roboto',
  },
  urgencyDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
    fontFamily: 'Roboto',
  },
  urgencyMultiplier: {
    alignItems: 'center',
    gap: 4,
  },
  multiplierText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    fontFamily: 'Roboto',
  },
  selectedText: {
    color: colors.white,
  },
  selectedSubText: {
    color: colors.secondary,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
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

export default ScheduleScreen;

