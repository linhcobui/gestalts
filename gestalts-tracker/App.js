import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';

import ProfileTab from './components/ProfileTab';
import RecordTab from './components/RecordTab';
import SessionsTab from './components/SessionsTab';

const Tab = createBottomTabNavigator();

// Dev mode toggle
const DEV_MODE = true;

// Mock user for development
const mockUser = {
  name: 'Linh Co Bui',
  email: 'linhcobui@example.com',
  picture: 'https://scontent.fmel18-1.fna.fbcdn.net/v/t39.30808-1/440414533_829342372395831_733636898518807187_n.jpg?stp=dst-jpg_s320x320_tt6&_nc_cat=109&ccb=1-7&_nc_sid=e99d92&_nc_ohc=LSi2CezEUJUQ7kNvwGUiCNQ&_nc_oc=AdkFE01nhyy1GJa6iuC-e6RbV_Jc8fc5ANkzhhxhtOB--nCdTdugyNttxriVIHax6h8&_nc_zt=24&_nc_ht=scontent.fmel18-1.fna&_nc_gid=C3PuIoqzLlubRkVj5IVdQg&oh=00_AfWUlHRJ9uwilYl21KUu4HrRMY_ExIND68FPHrQn2xDo6Q&oe=68A1F01A',
};

function ProfileScreen() {
  const handleLogout = () => {
    if (DEV_MODE) {
      Alert.alert('Dev Mode', 'Logout disabled in development mode');
    } else {
      // TODO: Implement real Auth0 logout
      Alert.alert('Logout', 'Logging out...');
    }
  };

  return (
    <ProfileTab 
      user={mockUser} 
      onLogout={handleLogout}
      devMode={DEV_MODE}
    />
  );
}

function SessionsScreen() {
  return <SessionsTab />;
}

function RecordScreen() {
  return <RecordTab />;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(DEV_MODE);
  const [isLoading, setIsLoading] = useState(false);

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Login screen (when DEV_MODE is false and not authenticated)
  if (!isAuthenticated && !DEV_MODE) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Gestalts Tracker</Text>
        <Button
          title="Log In / Sign Up"
          onPress={() => {
            // TODO: Implement Auth0 login
            Alert.alert('Login', 'Auth0 login to be implemented');
            setIsAuthenticated(true);
          }}
        />
      </View>
    );
  }

  // Main app with bottom tab navigation
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Sessions') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Record') {
              iconName = focused ? 'radio-button-on' : 'radio-button-on-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerShown: true,
        })}
      >
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <Tab.Screen 
          name="Sessions" 
          component={SessionsScreen}
          options={{ title: 'Sessions' }}
        />
        <Tab.Screen 
          name="Record" 
          component={RecordScreen}
          options={{ title: 'Record' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },
});