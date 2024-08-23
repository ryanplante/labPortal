import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getUserByToken } from './loginService';

// Use require to import the package.json file
const { version: appVersion } = require('../package.json');

const API_BASE_URL = 'https://localhost:7282/api';

type ErrorLogType = 'informative' | 'error' | 'warning' | 'critical';

export interface ErrorLog {
  logType: number;
  timestamp: string;
  description: string;
  stack: string;
  source: string;
  errorType: string;
  userId: number;
  platform: string;
  version: string;
}

const createErrorLog = async (errorLog: ErrorLog): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ErrorLogs`, errorLog);
    return response.data;
  } catch (error) {
    console.error('Error creating error log:', error);
    throw error;
  }
};

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

const saveErrorLogToAsyncStorage = async (errorLog: ErrorLog): Promise<void> => {
  try {
    const logs = await AsyncStorage.getItem('errorLogs');
    const parsedLogs: ErrorLog[] = logs ? JSON.parse(logs) : [];
    parsedLogs.push(errorLog);
    await AsyncStorage.setItem('errorLogs', JSON.stringify(parsedLogs));
  } catch (error) {
    console.error('Failed to save error log to AsyncStorage:', error);
  }
};

export const getErrorLogsFromAsyncStorage = async (): Promise<ErrorLog[]> => {
  try {
    const logs = await AsyncStorage.getItem('errorLogs');
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Failed to retrieve error logs from AsyncStorage:', error);
    return [];
  }
};

export const getLatestErrorLog = async (): Promise<ErrorLog | null> => {
  try {
    const logs = await getErrorLogsFromAsyncStorage();
    return logs.length ? logs[logs.length - 1] : null;
  } catch (error) {
    console.error('Failed to retrieve latest error log:', error);
    return null;
  }
};

export const clearErrorLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('errorLogs');
    console.log('Error logs cleared from AsyncStorage');
  } catch (error) {
    console.error('Failed to clear error logs:', error);
  }
};

export const getErrorLogsFromApi = async (): Promise<ErrorLog[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ErrorLogs`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving error logs from API:', error);
    throw error;
  }
};

export const CreateErrorLog = async (
  error: Error,
  source: string,
  userId: number | null, // Accept null to indicate that the user ID is not known yet
  errorLogType: ErrorLogType
): Promise<void> => {
  let resolvedUserId = userId;

  if (!userId) {
    try {
      const user = await getUserByToken();
      resolvedUserId = user?.userId || 99999999; // Use user.userId if available, otherwise fallback to 99999999
    } catch (userError) {
      console.error('Failed to retrieve user by token, using generic ID:', userError);
      resolvedUserId = 99999999;
    }
  }

  const logType = mapErrorLogTypeToId(errorLogType);
  const platform = `${Platform.OS} ${Platform.Version}`;

  const errorLog: ErrorLog = {
    logType: logType,
    timestamp: new Date().toISOString(),
    description: error.message,
    stack: error.stack || 'No stack available',
    source: source,
    errorType: error.name || 'Informative',
    userId: resolvedUserId,
    platform: platform,
    version: appVersion,  // Use version from package.json
  };

  try {
    await createErrorLog(errorLog);
    console.log('Error log sent to server successfully');
  } catch (serverError) {
    console.error('Error sending log to server, saving locally:', serverError);
  } finally {
    await saveErrorLogToAsyncStorage(errorLog);
  }

  throw new Error('An error has occurred. Please contact the administrator.');
};

// Example usage for LogsService
export interface Log {
  logId: number;
  studentId: number;
  timeIn: string;
  timeOut?: string;
  labId: number;
}

export const getLogs = async (type: 'students' | 'items'): Promise<Log[]> => {
  try {
    const endpoint = type === 'students' ? '/StudentLogs' : '/ItemLogs';
    const response = await axios.get(`${API_BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    await CreateErrorLog(error as Error, `getLogs ${type}`, null, 'error');
    throw error;
  }
};

export const postLog = async (logData: Log): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/Logs`, logData);
  } catch (error) {
    await CreateErrorLog(error as Error, 'postLog', null, 'error');
    throw error;
  }
};
