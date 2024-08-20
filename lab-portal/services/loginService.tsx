import { SHA256 } from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import axios from 'axios';
import { CreateAuditLog } from './auditService';

const API_URL = 'https://localhost:7282/api/Users';

export const getUserByToken = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.get(`${API_URL}/GetUserByToken/${token}`);
  
  if (response.status !== 200) {
    throw new Error('Invalid or expired token.');
  }

  return response.data; // Returns the user object
};

export const fetchLastUpdated = async (username: number) => {
  const response = await axios.get(`${API_URL}/LastUpdated/${username}`);
  
  if (response.status !== 200) {
    throw new Error('Failed to fetch lastUpdated value');
  }

  return response.data;
};

export const reload = async () => {
  if (Platform.OS === 'ios') {
    console.log('Running on iOS, reloading with Updates.reloadAsync');
    await Updates.reloadAsync(); // Reload the app using Expo's reload for iOS
  } else {
    console.log('Running on Android or another platform, reloading with window.reload()');
    window.location.reload(); // Restart the app using window.location.reload for other platforms
  }
};

export const logout = async () => {
  // record who's logging out
  const user = await getUserByToken();
  await CreateAuditLog('User logged out', Number(user.userId), 'logout');
  await deleteToken();
  // Force a reload of the app
  await reload();
}

export const validateCredentials = async (username: string, password: string, lastUpdated: string): Promise<any> => {
  const formattedLastUpdated = lastUpdated.includes('Z')
    ? lastUpdated
    : `${lastUpdated}Z`;

  const concatenatedString = password + formattedLastUpdated;
  const hashedPassword = SHA256(concatenatedString).toString();

  try {
    const response = await axios.post(`${API_URL}/ValidateCredentials`, {
      userId: username,
      password: hashedPassword,
    });

    // Log success in audit log
    await CreateAuditLog('Login succeeded', Number(username), 'login');
    
    return response.data; // Returns the token
  } catch (error) {
    // Log failure in audit log
    await CreateAuditLog('Login attempt failed!', Number(username), 'login');
    // This will be changed to error service later...
    throw new Error('Error validating credentials');
    //throw new Error(error.response ? error.response.data : 'Error validating credentials');
  }
};

export const updatePassword = async (userId: number, newPassword: string) => {
  try {
    const currentTimestamp = Math.round(new Date().getTime());
    const currentDate = new Date(currentTimestamp);
    const currentDateISO = currentDate.toISOString();

    const concatenatedString = newPassword + currentDateISO;
    const hashedPassword = SHA256(concatenatedString).toString();
    await CreateAuditLog('User changed password', userId, 'update');

    const response = await axios.put(`${API_URL}/UpdatePassword/${userId}`, {
      password: hashedPassword,
      lastUpdated: currentDateISO,
    });

    if (response.status === 200) {
      Alert.alert('Success', 'Password updated successfully.');
    } else {
      Alert.alert('Update Failed', 'There was a problem updating the password.');
    }
  } catch (error) {
    throw new Error('Error');
    //Alert.alert('Error', error.response ? error.response.data : error.message); // We'll change this to the error service once I get to it
  }
};

export const deleteToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    await AsyncStorage.clear();
    try {
      const response = await axios.delete(`${API_URL}/DeleteToken/${token}`);
      if (response.status !== 200) {
        throw new Error(response.data);
      }
    } catch (error) {
      //console.error('Error:', error.response ? error.response.data : error.message);
      throw new Error('Error deleting token');
      //throw new Error(error.response ? error.response.data : 'Error deleting token');
    }
  }
  return true;
};
