import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API;

export type AuditLogType =
  | 'insert'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'view'
  | 'access'
  | 'permission change'
  | 'data export'
  | 'information';

interface AuditLog {
  description: string;
  userID: number;
  auditLogTypeId: number;
  timestamp: string;
}

interface ChatLog {
  userId: number;
  message: string;
  timestamp: string;
}

export const getAllChatLogs = async (): Promise<ChatLog[]> => {
  try {
    const response: AxiosResponse<ChatLog[]> = await axios.get(`${API_BASE_URL}/ChatLogs`);
    return response.data.$values;
  } catch (error) {
    console.error('Error fetching chat logs:', error);
    throw error;
  }
};

// Fetch all audit logs from the server
export const getAllAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    const response: AxiosResponse<AuditLog[]> = await axios.get(`${API_BASE_URL}/AuditLogs`);
    return response.data.$values;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

export const fetchFilteredAuditLogs = async (date: Date, auditLogTypeId: number, page: number): Promise<AuditLog[]> => {
  try {
    // Format the date to YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0]; 
    const response = await axios.get(`${API_BASE_URL}/AuditLogs/Date/${formattedDate}/Type/${auditLogTypeId}?page=${page}`);
    return response.data.$values;
  } catch (error) {
    // Handle 404 error specifically
    if (error.response && error.response.status === 404) {
      console.warn('No audit logs found for the specified criteria.');
      return []; // Return an empty list
    }

    console.error('Error fetching filtered audit logs:', error);
    throw error; // Throw the error for other status codes
  }
};



// Function to create the audit log by sending it to the API
export const createAuditLog = async (auditLog: AuditLog): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/AuditLogs`, auditLog);
    return response.data;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
};

// Function to map string type to numeric ID
export const mapAuditLogTypeToId = (type: AuditLogType): number => {
  switch (type.toLowerCase()) {
    case 'insert':
      return 1;
    case 'update':
      return 2;
    case 'delete':
      return 3;
    case 'login':
      return 4;
    case 'logout':
      return 5;
    case 'view':
      return 6;
    case 'access':
      return 7;
    case 'permission change':
      return 8;
    case 'data export':
      return 9;
    case 'information':
      return 10;
    default:
      throw new Error(`Invalid audit log type: ${type}`);
  }
};

// Function to build and send the audit log
export const CreateAuditLog = async (
  description: string,
  userID: number,
  auditLogType: AuditLogType
): Promise<any> => {
  // Map string type to numeric ID
  const auditLogTypeId = mapAuditLogTypeToId(auditLogType);

  // Create the audit log object
  const auditLog: AuditLog = {
    description: description,
    userID: userID,
    auditLogTypeId: auditLogTypeId,
    timestamp: new Date().toISOString(), // Generate current timestamp in ISO format
  };

  // Send the audit log to the API
  try {
    const result = await createAuditLog(auditLog);
    console.log('Audit log created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error building and creating audit log:', error);
    throw error;
  }
};
