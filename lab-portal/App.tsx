import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Desktop/Login';
import MainPage from './components/Desktop/MainPage';
import Labs from './components/Desktop/Labs';
import Reports from './components/Desktop/Reports';
import Schedule from './components/Desktop/Schedule';
import ManageLabs from './components/Desktop/ManageLabs';
import LabSchedules from './components/Desktop/LabSchedules';
import Chat from './components/Desktop/Chat';
import ScanItem from './components/Desktop/ScanItem';
import LogHistory from './components/Desktop/LogHistory';
import Admin from './components/Desktop/Admin';
import Sidebar from './components/Desktop/Sidebar';
import ProfileSidebar from './components/Modals/ProfileSidebar';
import { isMobile } from 'react-device-detect';
import { checkHeartbeat, deleteToken, getUserByToken } from './services/loginService';
import ChangePassword from './components/Desktop/ChangePassword';
import { crossPlatformAlert, reload } from './services/helpers';
import { CreateAuditLog } from './services/auditService';
import HelpScreen from './components/Desktop/HelpScreen';
import SampleScreen from './components/Desktop/Sample';
import ExamplePage from './components/Desktop/Example';
import MobileSidebar from './components/Mobile/Sidebar';
import * as Device from 'expo-device'
import * as ScreenOrientation from 'expo-screen-orientation'
import MobileMainPage from './components/Mobile/MainPage';
import MobileLabs from './components/Mobile/Labs';
import MobileReports from './components/Mobile/Reports';
import MobileSchedule from './components/Mobile/Schedule';
import MobileManageLabs from './components/Mobile/ManageLabs';
import MobileLabSchedules from './components/Mobile/LabSchedules';
import MobileChat from './components/Mobile/Chat';
import MobileScanItem from './components/Mobile/ScanItem';
import MobileLogHistory from './components/Mobile/LogHistory';
import MobileAdmin from './components/Mobile/Admin';
import MobileProfile from './components/Mobile/Profile';

const Stack = createStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  
  const [isProfileSidebarVisible, setIsProfileSidebarVisible] = useState(false);
  const [orientation, setOrientation] = useState('LANDSCAPE');

  const determineAndSetOrientation = () => {
    let width = Dimensions.get('window').width;
    let height = Dimensions.get('window').height;

    if (width < height) {
        setOrientation('PORTRAIT');
      } else {
        setOrientation('LANDSCAPE');
      }
  }

  useEffect(() => {

    determineAndSetOrientation();
    const test = Dimensions.addEventListener('change', determineAndSetOrientation);

    return () => {
      test.remove()
    }
  }, []);

  //if a phone(1) or a tablet(2) in portrait, then the device is mobile
  const isMobile = ((Device.deviceType == 1) || (Device.deviceType == 2 && orientation == "PORTRAIT"))

  const adaptiveFlexDirection = {
    flexDirection: isMobile ? "column" : "row"
  }

  useEffect(() => {
    const validateToken = async () => {
      try {
        const isApiHealthy = await checkHeartbeat();
        if (!isApiHealthy) {
          throw new Error('The server is currently unavailable.');
        }

        const token = await AsyncStorage.getItem('token');
        if (token) {
          const user = await getUserByToken();
          await CreateAuditLog('Starting login process with token', Number(user.userId), 'login');
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        const errorMessage = error.message.includes('unavailable')
          ? 'Server is currently down. Please try again later.'
          : 'Token has expired. Please refresh the app and re-login to continue.';
        crossPlatformAlert('Error', error.message);

        await deleteToken();
        setUser(null);
      } finally {
        setLoading(false);  
      }
    };

    validateToken();
  }, []);

  const toggleProfileSidebar = () => {
    setIsProfileSidebarVisible(!isProfileSidebarVisible);
  };

  if (loading) {  
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffc107" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={[styles.container, adaptiveFlexDirection]}>
        {user && !isMobile && (
          <>
            <Sidebar onProfilePress={toggleProfileSidebar} />
            {isProfileSidebarVisible && (
              <ProfileSidebar visible={isProfileSidebarVisible} onClose={toggleProfileSidebar} />
            )}
          </>
        )}
        <View style={styles.mainContent}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
              isMobile ? (
                <>
                  <Stack.Screen name="Main" component={MobileMainPage} />
                  <Stack.Screen name="Labs" component={MobileLabs} />
                  <Stack.Screen name="Reports" component={MobileReports} />
                  <Stack.Screen name="Schedule" component={MobileSchedule} />
                  <Stack.Screen name="ManageLabs" component={MobileManageLabs} />
                  <Stack.Screen name="LabSchedules" component={MobileLabSchedules} />
                  <Stack.Screen name="Chat" component={MobileChat} />
                  <Stack.Screen name="ScanItem" component={MobileScanItem} />
                  <Stack.Screen name="LogHistory" component={MobileLogHistory} />
                  <Stack.Screen name="Admin" component={MobileAdmin} />
                  <Stack.Screen name="Profile" component={MobileProfile} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Main" component={MainPage} />
                  <Stack.Screen name="ChangePassword" component={ChangePassword} />
                  <Stack.Screen name="Labs" component={Labs} />
                  <Stack.Screen name="Reports" component={Reports} />
                  <Stack.Screen name="Schedule" component={Schedule} />
                  <Stack.Screen name="ManageLabs" component={ManageLabs} />
                  <Stack.Screen name="LabSchedules" component={LabSchedules} />
                  <Stack.Screen name="Chat" component={Chat} />
                  <Stack.Screen name="Help" component={HelpScreen} />
                  <Stack.Screen name="ScanItem" component={ScanItem} />
                  <Stack.Screen name="LogHistory" component={LogHistory} />
                  <Stack.Screen name="Admin" component={Admin} />
                  <Stack.Screen name="Sample" component={SampleScreen} />
                  <Stack.Screen name="Example" component={ExamplePage} />
                </>
              )
            ) : (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Help" component={HelpScreen} />
              </>
            )}
          </Stack.Navigator>
        </View>
        {user && isMobile && <MobileSidebar onProfilePress={toggleProfileSidebar} />}
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    // flexDirection: 'row',
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  loadingContainer: {  
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
