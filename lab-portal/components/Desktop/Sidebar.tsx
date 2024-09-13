import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SignalR from '@microsoft/signalr';
import { checkHeartbeat, getUserByToken } from '../../services/loginService';
import ScheduleService from '../../services/scheduleService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crossPlatformAlert, reload } from '../../services/helpers';
import { User } from '../../services/userService';

const Sidebar = ({ onProfilePress, onClose }: { onProfilePress: () => void; onClose: () => void }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [unverifiedCount, setUnverifiedCount] = useState<number>(0);
  const [retry, setRetry] = useState<boolean>(true);
  const [isTutorAvailable, setIsTutorAvailable] = useState<boolean>(false);
  const [studentCount, setStudentCount] = useState<number>(0);
  const connectionRef = useRef<SignalR.HubConnection | null>(null); // Notification hub connection reference

  // Initialize the SignalR connection once
  const initializeSignalRConnection = async (user: User) => {
    if (connectionRef.current) {
      return; // If the connection already exists, return
    }

    const connection = new SignalR.HubConnectionBuilder()
      .withUrl(process.env.EXPO_PUBLIC_NOTIFICATION_SOCKET) // Notifications hub URL
      .configureLogging(SignalR.LogLevel.Information)
      .build();

    // Handle the statuses response from the server
    connection.on('tutor_count', (available) => {
      setIsTutorAvailable(available);
    });

    connection.on('student_count', (count) => {
      setStudentCount(count);
    });

    // Start the connection
    try {
      await connection.start();
      connectionRef.current = connection; // Store connection in ref

      // Invoke the new method to get both statuses
      connection.invoke('GetStatuses', user.userDept);

      // Ensure cleanup if the component unmounts or connection stops
      return () => {
        connection.stop(); // Stop the connection when done
        connectionRef.current = null; // Clear the connection reference
      };
    } catch (error) {
      console.error('Error connecting to NotificationsHub: ', error);
    }
  };

  // Fetch user data and check API status
  const fetchUserData = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const isApiHealthy = await checkHeartbeat();
      if (!isApiHealthy) {
        throw new Error('The server is currently unavailable.');
      }
      if (token) {
        const user = await getUserByToken();
        if (!user) {
          await reload(); // Reload the app if token fails
        }
        setUser(user);

        // Fetch count of unverified exemptions
        if (user.privLvl > 3) {
          const count = await ScheduleService.getUnverifiedExemptionCountByDept(user.userDept);
          setUnverifiedCount(count);
        }

        // Initialize the SignalR connection once
        initializeSignalRConnection(user);
      } else {
        await reload();
      }
    } catch (error) {
      const errorMessage = error.message.includes('server')
        ? 'Server is currently down. Please try again later.'
        : error.message;
      setRetry(false);
      crossPlatformAlert('Error', errorMessage);
      await reload();
      setRetry(true);
    }
  };

  // Fetch user data and handle updates
  useEffect(() => {
    if (retry) {
      fetchUserData();
    }

    const intervalId = setInterval(() => {
      // Reinvoke the check method every 5 seconds
      if (connectionRef.current && user) {
        connectionRef.current.invoke('GetStatuses', user.userDept);
      }
      fetchUserData(); // Fetch user data every 5 seconds
    }, 5000);

    return () => {
      clearInterval(intervalId); // Clear the interval when the component unmounts
      connectionRef.current?.stop(); // Clean up the connection
    };
  }, [retry]);

  // Handle navigation and permissions
  const handlePress = async (screenName: string, permittedLevels: number[]) => {
    await fetchUserData();
    if (user && permittedLevels.includes(user.privLvl)) {
      onClose();
      navigation.navigate(screenName);
    } else {
      crossPlatformAlert('Access Denied', 'You do not have permission to access this screen.');
    }
  };

  // Sidebar menu content
  const labMonitors = "   Add/Edit\nLab Monitors";
  const deptManager = "  Department\n    Manager";

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
          <Text style={styles.menuText}>{labMonitors}</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl === 5) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('DepartmentManager', [5])}>
          <Image source={require('../../assets/department-icon.png')} style={styles.icon} />
          <Text style={styles.menuText}>{deptManager}</Text>
        </TouchableOpacity>
      )}
      {(user?.privLvl >= 1) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Schedule', [1, 2, 3, 4, 5])}>
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
          {user?.privLvl < 2 && !user?.IsTeacher && (
            <View style={[styles.chatBubble, { backgroundColor: isTutorAvailable ? 'green' : 'red' }]} />
          )}
          {(user?.privLvl >= 2 || user?.IsTeacher) && (
            <Text style={styles.studentCountBubble}>{studentCount}</Text>
          )}
          <Text style={styles.menuText}>
            Chat
          </Text>
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
      {(user?.privLvl >= 4) && (
        <TouchableOpacity style={styles.menuItem} onPress={() => handlePress('Item', [4, 5])}>
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
  chatBubble: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  studentCountBubble: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    fontSize: 12,
    color: 'white',
  },
});

export default Sidebar;
