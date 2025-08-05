import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Context Providers
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ShipmentProvider } from './src/context/ShipmentContext';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Customer Screens
import LocationScreen from './src/screens/customer/LocationScreen';
import ReceiverInfoScreen from './src/screens/customer/ReceiverInfoScreen';
import VehicleSelectionScreen from './src/screens/customer/VehicleSelectionScreen';
import ScheduleScreen from './src/screens/customer/ScheduleScreen';
import PhotoCaptureScreen from './src/screens/customer/PhotoCaptureScreen';
import BidReviewScreen from './src/screens/customer/BidReviewScreen';
import PaymentScreen from './src/screens/customer/PaymentScreen';
import PaymentSuccessScreen from './src/screens/customer/PaymentSuccessScreen';

// Colors
import { colors } from './src/config/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Customer Stack Navigator
const CustomerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Roboto',
        },
      }}
    >
      <Stack.Screen 
        name="Location" 
        component={LocationScreen}
        options={{ title: 'Select Locations' }}
      />
      <Stack.Screen 
        name="ReceiverInfo" 
        component={ReceiverInfoScreen}
        options={{ title: 'Receiver Info' }}
      />
      <Stack.Screen 
        name="VehicleSelection" 
        component={VehicleSelectionScreen}
        options={{ title: 'Vehicle Type' }}
      />
      <Stack.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{ title: 'Schedule & Details' }}
      />
      <Stack.Screen 
        name="PhotoCapture" 
        component={PhotoCaptureScreen}
        options={{ title: 'Add Photos' }}
      />
      <Stack.Screen 
        name="BidReview" 
        component={BidReviewScreen}
        options={{ title: "Review Bids" }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{ title: "Make Payment" }}
      />
      <Stack.Screen 
        name="PaymentSuccess" 
        component={PaymentSuccessScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Placeholder screens for other tabs
const HomeScreen = () => {
  return null; // Will be implemented later
};

const OrdersScreen = () => {
  return null; // Will be implemented later
};

const ProfileScreen = () => {
  return null; // Will be implemented later
};

// Main Tab Navigator for authenticated users
const MainTabs = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'NewShipment') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Roboto',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="NewShipment" 
        component={CustomerStack}
        options={{ 
          title: 'New Shipment',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Show loading screen
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <ShipmentProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </ShipmentProvider>
    </AuthProvider>
  );
}

