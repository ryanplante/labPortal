import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = 'https://localhost:7282/api';

// Define a type for the possible error log types
type ErrorLogType = 'informative' | 'error' | 'warning' | 'critical';

// Define the structure of the error log object
interface ErrorLog {
  logType: number;
  timestamp: string;
  description: string;
  stack: string;
  source: string;
  errorType: string;
  userId: number;
  platform: string;  // New field for platform
  version: string;   // New field for app version
}

// Function to create the error log by sending it to the API
export const createErrorLog = async (errorLog: ErrorLog): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ErrorLogs`, errorLog);
    return response.data;
  } catch (error) {
    console.error('Error creating error log:', error);
    throw error;
  }
};

// Function to map string type to numeric ID
const mapErrorLogTypeToId = (type: ErrorLogType): number => {
  switch (type.toLowerCase()) {
    case 'informative':
      return 0;
    case 'error':
      return 1;
    case 'warning':
      return 2;
    case 'critical':
      return 3;
    default:
      throw new Error(`Invalid error log type: ${type}`);
  }
};

// Function to save error log to AsyncStorage
const saveErrorLogToAsyncStorage = async (errorLog: ErrorLog): Promise<void> => {
  try {
    const logs = await AsyncStorage.getItem('errorLogs');
    const parsedLogs: ErrorLog[] = logs ? JSON.parse(logs) : [];
    parsedLogs.push(errorLog);
    await AsyncStorage.setItem('errorLogs', JSON.stringify(parsedLogs));
    console.log('Error log saved to AsyncStorage');
  } catch (error) {
    console.error('Failed to save error log to AsyncStorage:', error);
  }
};

// Function to build and send the error log
export const CreateErrorLog = async (
  error: Error,
  source: string,
  userId: number,
  errorLogType: ErrorLogType
): Promise<void> => {
  // Map string type to numeric ID
  const logType = mapErrorLogTypeToId(errorLogType);

  // Capture platform info and app version
  const platform = `${Platform.OS} ${Platform.Version}`;
  const appVersion = "1.0.0"; // Replace with actual version or import dynamically

  // Create the error log object
  const errorLog: ErrorLog = {
    logType: logType,
    timestamp: new Date().toISOString(), // Generate current timestamp in ISO format
    description: error.message,
    stack: error.stack || 'No stack available',
    source: source,
    errorType: error.name || 'Informative',
    userId: userId,
    platform: platform,  // Include platform info
    version: appVersion,  // Include app version
  };

  // Send the error log to the API and save it to AsyncStorage
  try {
    await createErrorLog(errorLog);
    console.log('Error log created successfully');
  } catch (serverError) {
    console.error('Error sending log to server, saving locally:', serverError);
    await saveErrorLogToAsyncStorage(errorLog);
  }

  // Throw a custom error message for the user
  throw new Error('An error has occurred. Please contact the administrator.');
};
