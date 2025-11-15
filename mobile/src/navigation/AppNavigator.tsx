import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import PremiumLoginScreen from '../screens/PremiumLoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import FeedScreen from '../screens/FeedScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import DonateScreen from '../screens/DonateScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FaceVerificationScreen from '../screens/FaceVerificationScreen';
import CommentThreadScreen from '../screens/CommentThreadScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import ChatPrivacySettingsScreen from '../screens/ChatPrivacySettingsScreen';
import ChatInfoScreen from '../screens/ChatInfoScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const MessagesStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Feed" component={FeedScreen} />
      <HomeStack.Screen name="CommentThread" component={CommentThreadScreen} />
      <HomeStack.Screen name="UserProfile" component={UserProfileScreen} />
    </HomeStack.Navigator>
  );
}

function MessagesStackScreen() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="ChatList" component={ChatListScreen} />
      <MessagesStack.Screen name="Chat" component={ChatScreen} />
      <MessagesStack.Screen name="ChatInfo" component={ChatInfoScreen} />
      <MessagesStack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <MessagesStack.Screen name="ChatPrivacySettings" component={ChatPrivacySettingsScreen} />
    </MessagesStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStackScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Donate"
        component={DonateScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.centerTabIconContainer}>
              <View style={styles.centerTabIcon}>
                <MaterialIcon
                  name="hand-heart"
                  size={28}
                  color="#FFFFFF"
                />
              </View>
            </View>
          ),
          tabBarLabel: 'Donate',
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcon
              name={focused ? 'store' : 'store-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Main'>('Login');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        setInitialRoute('Main');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={PremiumLoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="FaceVerification"
          component={FaceVerificationScreen}
          options={{
            headerShown: true,
            title: 'Face Verification',
            headerStyle: {
              backgroundColor: '#3B82F6',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centerTabIconContainer: {
    position: 'absolute',
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTabIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
