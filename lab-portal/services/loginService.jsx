import { SHA256 } from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as Updates from 'expo-updates';

const API_URL = 'https://localhost:7282/api/Users';

export const getUserByToken = async () => {
  const token = await AsyncStorage.getItem('token');
  const response = await fetch(`${API_URL}/GetUserByToken/${token}`);
  if (!response.ok) {
    throw new Error('Invalid or expired token.');
  }
  return response.json(); // Returns the user object
};

export const fetchLastUpdated = async (username) => {
  const response = await fetch(`${API_URL}/LastUpdated/${username}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lastUpdated value');
  }
  return response.json();
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
  // Ensure lastUpdated includes 'Z' if it's missing
  const formattedLastUpdated = lastUpdated.includes('Z')
    ? lastUpdated
    : `${lastUpdated}Z`;

  console.log('Formatted lastUpdated:', formattedLastUpdated);

  const concatenatedString = password + formattedLastUpdated;
  const hashedPassword = SHA256(concatenatedString).toString();

  console.log('Hashed Password:', hashedPassword);

  const response = await fetch(`${API_URL}/ValidateCredentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: username,
      password: hashedPassword,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(responseText);
  }
  
  return response.text(); // Returns the token
};


export const updatePassword = async (userId, newPassword) => {
  try {
      // Get the current date as a rounded timestamp (milliseconds since epoch)
      const currentTimestamp = Math.round(new Date().getTime());
      
      // Create a Date object from the rounded timestamp
      const currentDate = new Date(currentTimestamp);

      // Convert the Date object to an ISO string (UTC format)
      const currentDateISO = currentDate.toISOString();

      console.log('Current Date ISO:', currentDateISO);

      const concatenatedString = newPassword + currentDateISO;

      // Encrypt the new password with the current date in ISO string format
      const hashedPassword = SHA256(concatenatedString).toString();

      console.log('Hashed Password:', hashedPassword);

      // Send the encrypted password and current date in ISO format to the API
      const response = await fetch(`${API_URL}/UpdatePassword/${userId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              password: hashedPassword,
              lastUpdated: currentDateISO,
          }),
      });

      if (response.ok) {
          Alert.alert('Success', 'Password updated successfully.');
      } else {
          Alert.alert('Update Failed', 'There was a problem updating the password.');
      }
  } catch (error) {
      Alert.alert('Error', error.message);
  }
};


export const deleteToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
      await AsyncStorage.clear();
      const response = await fetch(`${API_URL}/DeleteToken/${token}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText);
      }
  }
  return true;
};
