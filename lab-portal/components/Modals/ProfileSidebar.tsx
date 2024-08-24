import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity, Animated, Easing, Alert, Platform } from 'react-native';
import { checkHeartbeat, deleteToken, getUserByToken, logout } from '../../services/loginService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { crossPlatformAlert, reload } from '../../services/helpers';
import { CreateAuditLog } from '../../services/auditService';

const ProfileSidebar = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const navigation = useNavigation();
  const [userName, setUserName] = useState('[Name]'); // Default value before loading user data

  useEffect(() => {
    const fetchUserData = async () => {

      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const isApiHealthy = await checkHeartbeat();
          if (!isApiHealthy) {
            throw new Error('The server is currently unavailable.');
          }
          const user = await getUserByToken();
          setUserName(`${user.fName} ${user.lName}`);
        } catch (error) {
          const errorMessage = error.message.includes('server')
              ? 'Server is currently down. Please try again later.'
              : 'Token has expired. Please refresh the app and re-login to continue.';
            crossPlatformAlert('Error', errorMessage);
          await deleteToken()
          await reload();
        }
      }
    };

    fetchUserData();

    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -300,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleLogout = async () => {

    onClose(); // Close the profile sidebar
    // Force a reload of the app
    await logout();
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
    onClose();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: slideAnim }] }]}>
      <View style={styles.profileContainer} >
        <Image source={require('../../assets/user-icon.png')} style={styles.profileImage} />
        <Text style={styles.profileName}>{userName}</Text>
      </View>
      <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
        <Text style={styles.menuText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Text style={styles.menuText}>Logout ⇦</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 80, // Positioned next to the sidebar
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#e0e0e0',
    paddingVertical: 20,
    paddingHorizontal: 10,
    zIndex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
  },
});

export default ProfileSidebar;
