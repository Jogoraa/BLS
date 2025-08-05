import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { colors } from '../../config/colors';
import { useShipment } from '../../context/ShipmentContext';

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 2;

const PhotoCaptureScreen = ({ navigation }) => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { setPhotos: setContextPhotos } = useShipment();

  const maxPhotos = 4;

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to capture and select photos.'
      );
      return false;
    }
    return true;
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Camera',
          onPress: takePhoto,
        },
        {
          text: 'Photo Library',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        addPhoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        addPhoto(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const addPhoto = (asset) => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only add up to ${maxPhotos} photos.`);
      return;
    }

    const newPhoto = {
      id: Date.now().toString(),
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    };

    setPhotos(prev => [...prev, newPhoto]);
  };

  const removePhoto = (photoId) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter(photo => photo.id !== photoId));
          },
        },
      ]
    );
  };

  const uploadPhotos = async () => {
    // This would typically upload to Cloudinary
    // For now, we'll simulate the upload process
    setUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would upload to Cloudinary here
      // and get back the URLs
      const photoUrls = photos.map(photo => photo.uri);
      
      setContextPhotos(photoUrls);
      setUploading(false);
      
      navigation.navigate('BidReview');
    } catch (error) {
      setUploading(false);
      Alert.alert('Upload Failed', 'Failed to upload photos. Please try again.');
    }
  };

  const handleContinue = () => {
    if (photos.length === 0) {
      Alert.alert(
        'No Photos',
        'Would you like to continue without photos?',
        [
          {
            text: 'Add Photos',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: () => {
              setContextPhotos([]);
              navigation.navigate('BidReview');
            },
          },
        ]
      );
      return;
    }

    uploadPhotos();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderPhotoGrid = () => {
    const photoSlots = Array.from({ length: maxPhotos }, (_, index) => {
      const photo = photos[index];
      
      if (photo) {
        return (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoSlot}
            onPress={() => removePhoto(photo.id)}
          >
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            <View style={styles.removeButton}>
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </View>
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          key={index}
          style={[styles.photoSlot, styles.emptySlot]}
          onPress={showImagePickerOptions}
          disabled={photos.length >= maxPhotos}
        >
          <Ionicons
            name="camera"
            size={32}
            color={photos.length >= maxPhotos ? colors.gray[300] : colors.gray[500]}
          />
          <Text
            style={[
              styles.addPhotoText,
              photos.length >= maxPhotos && styles.disabledText,
            ]}
          >
            Add Photo
          </Text>
        </TouchableOpacity>
      );
    });

    return <View style={styles.photoGrid}>{photoSlots}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Photos</Text>
          <Text style={styles.subtitle}>
            Take photos of your items to help drivers understand what they'll be transporting
          </Text>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.photoHeader}>
            <Text style={styles.photoTitle}>Item Photos</Text>
            <Text style={styles.photoCount}>
              {photos.length}/{maxPhotos}
            </Text>
          </View>
          
          {renderPhotoGrid()}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Photo Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Take clear, well-lit photos</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Show different angles of your items</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Include packaging if applicable</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Avoid blurry or dark images</Text>
            </View>
          </View>
        </View>

        {photos.length > 0 && (
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={showImagePickerOptions}
            disabled={photos.length >= maxPhotos}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.addMoreText}>Add More Photos</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Back"
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
          disabled={uploading}
        />
        <Button
          title={uploading ? 'Uploading...' : 'Continue'}
          onPress={handleContinue}
          style={styles.continueButton}
          loading={uploading}
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
    lineHeight: 22,
    fontFamily: 'Roboto',
  },
  photoSection: {
    marginBottom: 24,
  },
  photoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    fontFamily: 'Roboto',
  },
  photoCount: {
    fontSize: 14,
    color: colors.gray[600],
    fontFamily: 'Roboto',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  photoSlot: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    position: 'relative',
  },
  emptySlot: {
    backgroundColor: colors.gray[50],
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  addPhotoText: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4,
    fontFamily: 'Roboto',
  },
  disabledText: {
    color: colors.gray[300],
  },
  tipsSection: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.gray[700],
    fontFamily: 'Roboto',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
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

export default PhotoCaptureScreen;

