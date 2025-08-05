import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import WebSocketService from '../services/websocket';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    checkAuthState();

    // Setup notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can add custom logic here to display the notification in-app
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      // Handle notification tap, e.g., navigate to a specific screen
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && state.user?.id) {
      // Connect WebSocket when user logs in
      WebSocketService.connect(state.user.id);
      WebSocketService.onMessage(handleWebSocketMessage);
    } else if (!state.isAuthenticated && WebSocketService.ws) {
      // Close WebSocket when user logs out
      WebSocketService.close();
    }
  }, [state.isAuthenticated, state.user?.id]);

  const handleWebSocketMessage = (message) => {
    console.log('Received WebSocket message:', message);
    // Handle different types of real-time notifications
    switch (message.type) {
      case 'notification':
        // This is a generic notification, can be further categorized by message.data.type
        Notifications.scheduleNotificationAsync({
          content: {
            title: message.data.title || 'New Notification',
            body: message.data.message || 'You have a new update.',
            data: message.data, // Pass along the full data
          },
          trigger: null, // Show immediately
        });
        break;
      case 'new_bid':
        // Specific handling for new bid notifications
        Notifications.scheduleNotificationAsync({
          content: {
            title: message.data.title || 'New Bid Received!',
            body: message.data.message || `A new bid has been placed on your shipment.`, 
            data: message.data,
          },
          trigger: null,
        });
        break;
      case 'bid_accepted':
        // Specific handling for bid accepted notifications
        Notifications.scheduleNotificationAsync({
          content: {
            title: message.data.title || 'Your Bid Accepted!',
            body: message.data.message || `Your bid for a shipment has been accepted.`, 
            data: message.data,
          },
          trigger: null,
        });
        break;
      // Add more cases for other notification types (e.g., status updates)
      default:
        console.log('Unhandled WebSocket message type:', message.type);
    }
  };

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      
      if (token && user) {
        dispatch({
          type: 'LOGIN',
          payload: {
            token,
            user: JSON.parse(user),
          },
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (token, user) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN',
        payload: { token, user },
      });
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error removing auth data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

