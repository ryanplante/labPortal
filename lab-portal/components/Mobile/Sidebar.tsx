import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkHeartbeat, getUserByToken } from '../../services/loginService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crossPlatformAlert, reload } from '../../services/helpers';

interface MobileSidebarProps {
  onProfilePress: () => void;
}

const MobileSidebar = ({ onProfilePress }: MobileSidebarProps) => {
  const navigation = useNavigation();
  const [privLvl, setPrivLvl] = useState<number>(0);

  const fetchUserData = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const isApiHealthy = await checkHeartbeat();
      if (!isApiHealthy) {
        throw new Error('The server is currently unavailable.');
      }
      if (token) {
        const user = await getUserByToken();
        setPrivLvl(user.privLvl);
      } else {
        crossPlatformAlert('Error', 'Token has expired. Please refresh the app and re-login to continue.');
        await reload();
      }
    } catch (error) {
      const errorMessage = error.message.includes('server')
        ? 'Server is currently down. Please try again later.'
        : 'Token has expired. Please refresh the app and re-login to continue.';
      crossPlatformAlert('Error', errorMessage);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handlePress = async (screenName: string, permittedLevels: number[]) => {
    await fetchUserData();
    if (permittedLevels.includes(privLvl)) {
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

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile')}>
        <Image source={require('../../assets/user-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>

      {(privLvl >= 4) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('MobileLabManager', [4, 5])}>
          <Image source={require('../../assets/labs-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Manage Labs</Text>
        </TouchableOpacity>
      )}

      {(privLvl === 5) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('DepartmentManager', [5])}>
          <Image source={require('../../assets/department-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Department Manager</Text>
        </TouchableOpacity>
      )}

      {(privLvl >= 1 && privLvl <= 3) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('LabSchedules', [1, 2, 3])}>
          <Image source={require('../../assets/schedule-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Schedule</Text>
        </TouchableOpacity>
      )}

      {(privLvl <= 3) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Chat', [0, 1, 2, 3])}>
          <Image source={require('../../assets/chat-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Chat</Text>
        </TouchableOpacity>
      )}

      {(privLvl >= 1 && privLvl <= 3) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('ScanItem', [1, 2, 3])}>
          <Image source={require('../../assets/scan-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Scan Item</Text>
        </TouchableOpacity>
      )}

      {(privLvl >= 1) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('LogHistory', [1, 2, 3, 4, 5])}>
          <Image source={require('../../assets/logs-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>View Logs</Text>
        </TouchableOpacity>
      )}

      {(privLvl >= 4) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Reports', [4, 5])}>
          <Image source={require('../../assets/reports-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Reports</Text>
        </TouchableOpacity>
      )}

      {(privLvl === 5) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Admin', [5])}>
          <Image source={require('../../assets/admin-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>Admin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: "100%",
    backgroundColor: '#002147',
    height: 100,
    flexDirection: "row",
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  menuItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  menuText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default MobileSidebar;
