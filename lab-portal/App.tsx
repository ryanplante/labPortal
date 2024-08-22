import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
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
import MobileSidebar from './components/Mobile/Sidebar';
import MobileProfileSidebar from './components/Mobile/ProfileSidebar';
import { isMobile } from 'react-device-detect';
import { getUserByToken } from './services/loginService';
import ChangePassword from './components/Desktop/ChangePassword';
import { crossPlatformAlert } from './services/helpers';
import { CreateAuditLog } from './services/auditService';
import HelpScreen from './components/Desktop/HelpScreen';
import SampleScreen from './components/Desktop/Sample';

const Stack = createStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [isProfileSidebarVisible, setIsProfileSidebarVisible] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const user = await getUserByToken();
          console.log(user)
          await CreateAuditLog('Starting login process with token', Number(user.userId), 'login');
          setUser(user);
        } catch (error) {
          crossPlatformAlert('Error', error.message);
          await AsyncStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    validateToken();
  }, []);

  const toggleProfileSidebar = () => {
    setIsProfileSidebarVisible(!isProfileSidebarVisible);
  };


  return (
    <NavigationContainer>
      <View style={styles.container}>
        {user && (
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
