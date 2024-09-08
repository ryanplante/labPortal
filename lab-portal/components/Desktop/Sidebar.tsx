import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkHeartbeat, getUserByToken } from '../../services/loginService';
import ScheduleService from '../../services/scheduleService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crossPlatformAlert, reload } from '../../services/helpers';

const Sidebar = ({ onProfilePress, onClose }: { onProfilePress: () => void; onClose: () => void }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [unverifiedCount, setUnverifiedCount] = useState<number>(0);

  const fetchUserData = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const isApiHealthy = await checkHeartbeat();
      if (!isApiHealthy) {
        throw new Error('The server is currently unavailable.');
      }
      if (token) {
        const user = await getUserByToken();
        if (!user)
          await reload();
        setUser(user);

        // Fetch unverified schedule exemptions count
        if (user.privLvl > 3) {
          const count = await ScheduleService.getUnverifiedExemptionCountByDept(user.userDept);
          setUnverifiedCount(count);
        }
      } else {
        await reload();
      }
    } catch (error) {
      const errorMessage = error.message.includes('server')
        ? 'Server is currently down. Please try again later.'
        : error.message;
      crossPlatformAlert('Error', errorMessage);
      await reload();
    }
  };

  useEffect(() => {
    fetchUserData();

    // Set up interval for polling unverified exemptions count every 15 seconds
    const intervalId = setInterval(() => {
      fetchUserData();
    }, 5000); // fetch user data in the background every 5 seconds to make sure their token didn't expire, update notifications, etc.

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handlePress = async (screenName: string, permittedLevels: number[]) => {
    await fetchUserData();
    if (user && permittedLevels.includes(user.privLvl)) {
      onClose(); // Close the profile sidebar only when navigating
      navigation.navigate(screenName);
    } else {
      crossPlatformAlert('Access Denied', 'You do not have permission to access this screen.');
    }
  };

  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Main', [0, 1, 2, 3, 4, 5])}>
        <Image source={require('../../assets/logo.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={onProfilePress}>
        <Image source={require('../../assets/user-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>
      {(user?.privLvl >= 4) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('ManageLabs', [4, 5])}>
          <Image source={require('../../assets/labs-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Manage Labs</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl === 5) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('DepartmentManager', [5])}>
          <Image source={require('../../assets/department-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Dept Manager</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl >= 1) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('LabSchedules', [1, 2, 3, 4, 5])}>
          <View>
            <Image source={require('../../assets/schedule-icon.png')} style={styles.icon} />
            {unverifiedCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unverifiedCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.menuText}>Schedule</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl <= 3) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Chat', [0, 1, 2, 3])}>
          <Image source={require('../../assets/chat-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Chat</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl >= 1 && user?.privLvl <= 3) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('ScanItem', [1, 2, 3])}>
          <Image source={require('../../assets/scan-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Scanner</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl >= 1) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('LogHistory', [1, 2, 3, 4, 5])}>
          <Image source={require('../../assets/logs-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>View Logs</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl >= 4) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Reports', [4, 5])}>
          <Image source={require('../../assets/reports-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Reports</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl === 5) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Admin', [5])}>
          <Image source={require('../../assets/admin-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Admin</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl === 5) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Item', [5])}>
          <Image source={require('../../assets/item-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Item Manager</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Help', [0, 1, 2, 3, 4, 5])}>
        <Image source={require('../../assets/help-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 80,
    backgroundColor: '#002147',
    alignItems: 'center',
    paddingVertical: 20,
    height: '100%',
    zIndex: 1, // Ensure it is behind the profile sidebar
  },
  menuItem: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    width: 30,
    height: 30,
    marginBottom: 5,
  },
  menuText: {
    color: '#fff',
    fontSize: 12,
  },
  badgeContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 3,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Sidebar;
