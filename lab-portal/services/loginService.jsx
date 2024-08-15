import { SHA256 } from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const validateCredentials = async (username, password, lastUpdated) => {
  const formattedLastUpdated = new Date(lastUpdated).toISOString();
  const concatenatedString = password + formattedLastUpdated;
  const hashedPassword = SHA256(concatenatedString).toString();

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

export const updatePassword = async (userId, newPassword, lastUpdated) => {
    try {
        // Encrypt the new password with the lastUpdated timestamp
        const hashedPassword = SHA256(newPassword + new Date(lastUpdated).toISOString()).toString();

        // Send the encrypted password and lastUpdated to the API
        const response = await fetch(`${API_URL}/UpdatePassword/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                encryptedPassword: hashedPassword,
                lastUpdated: lastUpdated
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
  if (token) 
  {
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

