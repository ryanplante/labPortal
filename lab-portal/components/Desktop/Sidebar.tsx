import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkHeartbeat, deleteToken, getUserByToken } from '../../services/loginService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateAuditLog } from '../../services/auditService';
import { crossPlatformAlert, reload } from '../../services/helpers';

const Sidebar = ({ onProfilePress }: { onProfilePress: () => void }) => {
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

  const labMonitors = "   Add/Edit\nLab Monitors";

  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Main', [0, 1, 2, 3, 4, 5])}>
        <Image source={require('../../assets/logo.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={onProfilePress}>
        <Image source={require('../../assets/user-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>
      {(privLvl > 4) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Labs', [5])}>
          <Image source={require('../../assets/labs-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>{labMonitors}</Text>
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
          <Text style={styles.menuText}>Scanner</Text>
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
      <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Help', [0, 1, 2, 3, 4, 5])}>
        <Image source={require('../../assets/help-icon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Help</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Sample', [0, 1, 2, 3, 4, 5])}>
        <Image source={require('../../assets/favicon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Sample</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Example', [0, 1, 2, 3, 4, 5])}>
        <Image source={require('../../assets/favicon.png')} style={styles.icon} />
        <Text style={styles.menuText}>Example</Text>
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
    backgroundImage: 'linear-gradient(to bottom, #002147, #000000)',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 20,
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
});

export default Sidebar;
