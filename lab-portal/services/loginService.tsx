import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CreateAuditLog } from './auditService';
import { CreateErrorLog } from './errorLogService';
import { reload } from './helpers';
import { User } from './userService';

const API_URL = `${process.env.EXPO_PUBLIC_API}/Users`;
const HEARTBEAT_URL = `${process.env.EXPO_PUBLIC_API}/Heartbeat`;

export const checkHeartbeat = async (): Promise<boolean> => {
  try {
    const response = await axios.get(HEARTBEAT_URL);
    return response.status === 200;
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - the server is down.');
      await CreateErrorLog(new Error('Connection refused - the server is down.'), 'checkHeartbeat', 99999999, 'error');
      throw new Error('The server is currently unavailable.');
    } else {
      await CreateErrorLog(error, 'checkHeartbeat', 99999999, 'error');
      throw new Error('Failed to reach the server. Please try again later.');
    }
  }
};

export const getUserByToken = async (): Promise<User> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${API_URL}/GetUserByToken/${token}`);

    if (response.status == 404) {
      throw new Error('Invalid or expired token.');
    }

    return response.data; // Returns the user object
  } catch (error) {
    await CreateErrorLog(error, 'getUserByToken', 99999999, 'error');
    throw new Error('Failed to get user token!');
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
    await deleteToken();
    await reload();
    throw new Error('An error occurred. Please contact the administrator.');
  }
};

export const validateCredentials = async (username: number, password: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/ValidateCredentials`, {
      userId: username,
      password: password,
    });

    await CreateAuditLog('Login succeeded', Number(username), 'login');
    await AsyncStorage.setItem('token', response.data);
    return { success: true }; // Return success status
  } catch (error: any) {
    await CreateAuditLog('Login attempt failed', Number(username), 'login');
    await CreateErrorLog(error, 'validateCredentials', Number(username), 'error');
    // Check for retries and account lock messages
    if (error.response?.data?.message) {
      const errorMessage = error.response.data.message;
      // Check if the message indicates account lock
      if (errorMessage.includes('Account is locked')) {
        return { success: false, locked: true, message: 'Your account is locked due to too many failed attempts. Please contact the administrator or unlock your account.' };
      }

      // Check for retry attempts
      const retriesMatch = errorMessage.match(/Attempt (\d) of 5/);
      if (retriesMatch) {
        const retries = retriesMatch[1]; // Extract retries count from the message
        return { success: false, retries: Number(retries), message: `Invalid password. You have ${5 - retries} more attempt(s) before your account is locked.` };
      }
    }

    throw new Error('Invalid credentials.');
  }
};


export const updatePassword = async (userId: number, newPassword: string) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Token is missing. Please log in again.');
    }

    const response = await axios.put(
      `${API_URL}/UpdatePassword`,
      {
        userId: userId,
        password: newPassword, // Include the new password
      },
      {
        headers: {
          token: token, // Send token in the 'token' header as expected by the backend
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 400) {
      throw new Error('The old password does not match.');
    }

    if (response.status !== 204) {
      throw new Error('Failed to update the password.');
    }
  } catch (error) {
    await CreateErrorLog(error, 'updatePassword', userId, 'error');
    throw new Error(error.message || 'An error occurred. Please contact the administrator.');
  }
};





export const deleteToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      await AsyncStorage.removeItem('token');
      const response = await axios.delete(`${API_URL}/DeleteToken/${token}`);
      if (response.status !== 200) {
        throw new Error(response.data);
      }
    }
    return true;
  } catch (error) {
    await CreateErrorLog(error, 'deleteToken', 99999999, 'error');
    throw new Error('An error occurred. Please contact the administrator.');
  }
};
