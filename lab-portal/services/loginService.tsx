import { SHA256 } from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import axios from 'axios';
import { CreateAuditLog } from './auditService';
import { CreateErrorLog } from './errorLogService';
import { reload } from './helpers';

const API_URL = 'https://localhost:7282/api/Users';

export const getUserByToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${API_URL}/GetUserByToken/${token}`);
    
    if (response.status !== 200) {
      throw new Error('Invalid or expired token.');
    }

    return response.data; // Returns the user object
  } catch (error) {
    await CreateErrorLog(error, 'getUserByToken', 99999999, 'error'); // 99999999 will be generic id since we don't know who this user is 
    throw new Error('An error occurred. Please contact the administrator.');
  }
};

export const fetchLastUpdated = async (userid: number) => {
  try {
    const response = await axios.get(`${API_URL}/LastUpdated/${userid}`);
    
    if (response.status !== 200) {
      throw new Error('Failed to fetch lastUpdated value');
    }

    return response.data;
  } catch (error) {
    await CreateErrorLog(error, 'fetchLastUpdated', userid, 'error');
    throw new Error('An error occurred. Please contact the administrator.');
  }
};



export const logout = async () => {
  try {
    const user = await getUserByToken();
    await CreateAuditLog('User logged out', Number(user.userId), 'logout');
    await deleteToken();
    await reload();
  } catch (error) {
    await CreateErrorLog(error, 'logout', 99999999, 'error');
    throw new Error('An error occurred. Please contact the administrator.');
  }
};

export const validateCredentials = async (username: string, password: string): Promise<any> => {
  try {
    const lastUpdated = await fetchLastUpdated(Number(username));
    const formattedLastUpdated = lastUpdated.includes('Z')
      ? lastUpdated
      : `${lastUpdated}Z`;

    const concatenatedString = password + formattedLastUpdated;
    const hashedPassword = SHA256(concatenatedString).toString();

    const response = await axios.post(`${API_URL}/ValidateCredentials`, {
      userId: username,
      password: hashedPassword,
    });

    await CreateAuditLog('Login succeeded', Number(username), 'login');
    return response.data; // Returns the token
  } catch (error) {
    await CreateAuditLog('Login attempt failed!', Number(username), 'login');
    await CreateErrorLog(error, 'validateCredentials', Number(username), 'error');
    throw new Error('An error occurred. Please contact the administrator.');
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
    await CreateErrorLog(error, 'updatePassword', userId, 'error');
    throw new Error('An error occurred. Please contact the administrator.');
  }
};

export const deleteToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      await AsyncStorage.clear();
      const response = await axios.delete(`${API_URL}/DeleteToken/${token}`);
      if (response.status !== 200) {
        throw new Error(response.data);
      }
    }
    return true;
  } catch (error) {
    await CreateErrorLog(error, 'deleteToken', 0, 'error'); // Replace '0' with actual userId if available
    throw new Error('An error occurred. Please contact the administrator.');
  }
};
