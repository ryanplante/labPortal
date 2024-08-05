import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Login';
import MainPage from './components/MainPage';
import Labs from './components/Labs';
import Reports from './components/Reports';
import Schedule from './components/Schedule';
import ManageLabs from './components/ManageLabs';
import LabSchedules from './components/LabSchedules';
import Chat from './components/Chat';
import ScanItem from './components/ScanItem';
import LogHistory from './components/LogHistory';
import Admin from './components/Admin';
import Sidebar from './components/Sidebar';
import ProfileSidebar from './components/ProfileSidebar';

const Stack = createStackNavigator();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isProfileSidebarVisible, setIsProfileSidebarVisible] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');
    };
    checkLoginStatus();
  }, []);

  const handleSetLoggedIn = async (value: boolean) => {
    await AsyncStorage.setItem('isLoggedIn', value.toString());
    setIsLoggedIn(value);
  };

  const toggleProfileSidebar = () => {
    setIsProfileSidebarVisible(!isProfileSidebarVisible);
  };

  if (isLoggedIn === null) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <NavigationContainer>
      <View style={styles.container}>
        {isLoggedIn && (
          <>
            <Sidebar onProfilePress={toggleProfileSidebar} />
            {isProfileSidebarVisible && (
              <ProfileSidebar visible={isProfileSidebarVisible} onClose={toggleProfileSidebar} />
            )}
          </>
        )}
        <View style={styles.mainContent}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
              <Stack.Screen name="Login">
                {(props) => <Login {...props} setIsLoggedIn={handleSetLoggedIn} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Main" component={MainPage} />
                <Stack.Screen name="Labs" component={Labs} />
                <Stack.Screen name="Reports" component={Reports} />
                <Stack.Screen name="Schedule" component={Schedule} />
                <Stack.Screen name="ManageLabs" component={ManageLabs} />
                <Stack.Screen name="LabSchedules" component={LabSchedules} />
                <Stack.Screen name="Chat" component={Chat} />
                <Stack.Screen name="ScanItem" component={ScanItem} />
                <Stack.Screen name="LogHistory" component={LogHistory} />
                <Stack.Screen name="Admin" component={Admin} />
              </>
            )}
          </Stack.Navigator>
        </View>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
});

export default App;
