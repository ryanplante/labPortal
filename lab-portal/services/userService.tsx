import axios, { AxiosResponse } from 'axios';
import { CreateErrorLog } from './errorLogService';
import { CreateAuditLog, AuditLogType } from './auditService';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Assuming token is stored here
import { getUserByToken } from './loginService';

export interface User {
    userId: number;
    fName: string;
    lName: string;
    userDept: number;
    privLvl: number;
    position: number;
    isTeacher: boolean;
}

export interface Ban {
    banId: number;
    userId: number;
    reason: string;
    expirationDate: Date;
}

export interface BanCreateDto {
    userId: number;
    reason: string;
    expirationDate: Date;
}

class UserService {
    private baseUrl: string;
    private bansBaseUrl: string;
    constructor() {
        this.baseUrl = `${process.env.EXPO_PUBLIC_API}/Users`;
        this.bansBaseUrl = `${process.env.EXPO_PUBLIC_API}/Bans`;
    }

    // GET: /api/Users
    async getAllUsers(): Promise<User[]> {
        try {
            const token = await this.getToken();
            const response: AxiosResponse<User[]> = await axios.get(this.baseUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await this.audit('view', `Viewed all users`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getAllUsers');
            throw error;
        }
    }

    async getNameById(Id: number): Promise<string> {
        try {
          if (Id) {
            const monitor = await this.getUserById(Id);
            return `${monitor.fName} ${monitor.lName}`;
          }
          return 'Unknown'; // Return 'Unknown' if monitorID is null or invalid
        } catch (error) {
          console.error('Error fetching monitor name:', error);
          return 'Unknown'; // Handle errors gracefully
        }
      };

    // POST: /api/Users
    async createUser(userDto: User): Promise<User> {
        try {
            const token = await this.getToken();
            const response: AxiosResponse<User> = await axios.post(this.baseUrl, userDto, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await this.audit('insert', `Created new user: ${userDto.fName} ${userDto.lName}`, userDto.userId);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'createUser');
            throw error;
        }
    }

    // GET: /api/Users/{id}
    async getUserById(userId: number): Promise<User> {
        try {
            const token = await this.getToken();
            const response: AxiosResponse<User> = await axios.get(`${this.baseUrl}/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            //await this.audit('view', `Viewed user with ID: ${userId}`, userId);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getUserById');
            throw error;
        }
    }

    // PUT: /api/Users/{id}
    async updateUser(userId: number, userDto: User): Promise<void> {
        try {
            const token = await this.getToken();
            await axios.put(`${this.baseUrl}/${userId}`, userDto, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await this.audit('update', `Updated user with ID: ${userId}`, userId);
        } catch (error) {
            await this.handleError(error, 'updateUser');
            throw error;
        }
    }

    // PUT: /api/Users/UpdatePermission/{id}
    async updatePermission(userId: number, newPermissionLevel: number): Promise<void> {
        try {
            const token = await this.getToken();
            await axios.put(`${this.baseUrl}/UpdatePermission/${userId}`, newPermissionLevel, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            await this.audit('update', `Updated permission level for user with ID: ${userId} to ${newPermissionLevel}`, userId);
        } catch (error) {
            await this.handleError(error, 'updatePermission');
            throw error;
        }
    }

    // GET: /api/Users/FuzzySearchById/{id}
    async fuzzySearchById(id: number): Promise<User[]> {
        try {
            const token = await this.getToken();
            const response: AxiosResponse<User[]> = await axios.get(`${this.baseUrl}/FuzzySearchById/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await this.audit('view', `Fuzzy searched users by ID: ${id}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'fuzzySearchById');
            throw error;
        }
    }
    async createBan(banDto: BanCreateDto): Promise<void> {
        try {
            const token = await this.getToken();
            await axios.post(this.bansBaseUrl, banDto, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await this.audit('insert', `Created new ban for User ID: ${banDto.userId}`);
        } catch (error) {
            await this.handleError(error, 'createBan');
            throw error;
        }
    }

    // PUT: /api/Bans/{id}
    async updateBan(banId: number, banDto: BanCreateDto): Promise<void> {
        try {
            const token = await this.getToken();
            await axios.put(`${this.bansBaseUrl}/${banId}`, banDto, {
                headers: { Authorization: `Bearer ${token}` },
            });
            await this.audit('update', `Updated ban with ID: ${banId}`);
        } catch (error) {
            await this.handleError(error, 'updateBan');
            throw error;
        }
    }
    // GET: /api/Users/FuzzySearchByName
    async fuzzySearchByName(fName?: string, lName?: string): Promise<User[]> {
        try {
            const token = await this.getToken();
            const params = { fName, lName };
            const response: AxiosResponse<User[]> = await axios.get(`${this.baseUrl}/FuzzySearchByName`, {
                params,
                headers: { Authorization: `Bearer ${token}` },
            });
            await this.audit('view', `Fuzzy searched users by Name: ${fName || ''} ${lName || ''}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'fuzzySearchByName');
            throw error;
        }
    }

        // DELETE: /api/Bans/{id}
        async deleteBan(banId: number): Promise<void> {
            try {
                const token = await this.getToken();
                await axios.delete(`${this.bansBaseUrl}/${banId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await this.audit('delete', `Deleted ban with ID: ${banId}`);
            } catch (error) {
                await this.handleError(error, 'deleteBan');
                throw error;
            }
        }
    
        // GET: /api/Bans/CheckBan/{userId}
        async checkUserBan(userId: number): Promise<Ban | null> {
            try {
                const token = await this.getToken();
                const response: AxiosResponse<Ban> = await axios.get(`${this.bansBaseUrl}/CheckBan/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await this.audit('view', `Checked ban for User ID: ${userId}`);
                return response.data;
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    return null; // No active ban found
                }
                await this.handleError(error, 'checkUserBan');
                throw error;
            }
        }

    // Helper method for error handling
    private async handleError(error: any, source: string): Promise<void> {
        await CreateErrorLog(error as Error, source, null, 'error');
    }

    // Helper method for auditing
    private async audit(auditType: AuditLogType, description: string, userID?: number): Promise<void> {
        try {
            const user = await getUserByToken(); // Get user by token from loginService
            const userId = userID || Number(user.userId); // Use the resolved user ID or default to provided userID
            await CreateAuditLog(description, userId, auditType);
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    // Helper method to get the user token from AsyncStorage
    private async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem('token');
    }
}

export default new UserService();
