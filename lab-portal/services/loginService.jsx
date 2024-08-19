import { SHA256 } from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import axios from 'axios';

const API_URL = 'https://localhost:7282/api/Users';

export const getUserByToken = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await axios.get(`${API_URL}/GetUserByToken/${token}`);
  
  if (response.status !== 200) {
    throw new Error('Invalid or expired token.');
  }

  return response.data; // Returns the user object
};

export const fetchLastUpdated = async (username) => {
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

export const validateCredentials = async (username, password, lastUpdated) => {
  const formattedLastUpdated = lastUpdated.includes('Z')
    ? lastUpdated
    : `${lastUpdated}Z`;

  console.log('Formatted lastUpdated:', formattedLastUpdated);

  const concatenatedString = password + formattedLastUpdated;
  const hashedPassword = SHA256(concatenatedString).toString();

  console.log('Hashed Password:', hashedPassword);

  try {
    const response = await axios.post(`${API_URL}/ValidateCredentials`, {
      userId: username,
      password: hashedPassword,
    });

    return response.data; // Returns the token
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw new Error(error.response ? error.response.data : 'Error validating credentials');
  }
};

export const updatePassword = async (userId, newPassword) => {
  try {
    const currentTimestamp = Math.round(new Date().getTime());
    const currentDate = new Date(currentTimestamp);
    const currentDateISO = currentDate.toISOString();

    console.log('Current Date ISO:', currentDateISO);

    const concatenatedString = newPassword + currentDateISO;
    const hashedPassword = SHA256(concatenatedString).toString();

    console.log('Hashed Password:', hashedPassword);

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
    console.error('Error:', error.response ? error.response.data : error.message);
    Alert.alert('Error', error.response ? error.response.data : error.message);
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
      console.error('Error:', error.response ? error.response.data : error.message);
      throw new Error(error.response ? error.response.data : 'Error deleting token');
    }
  }
  return true;
};
