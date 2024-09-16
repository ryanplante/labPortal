import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuditLogType, CreateAuditLog } from "./auditService";
import { CreateErrorLog } from "./errorLogService";
import { getUserByToken } from "./loginService";
import axios, { AxiosResponse } from "axios";

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
                headers: { token: token, 'Content-Type': 'application/json' }
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
                headers: { token: token, 'Content-Type': 'application/json' }
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
                headers: { token: token, 'Content-Type': 'application/json' }
            });
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
                headers: { token: token, 'Content-Type': 'application/json' }
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
                headers: { token: token, 'Content-Type': 'application/json' }
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
                headers: { token: token, 'Content-Type': 'application/json' }
            });
            await this.audit('view', `Fuzzy searched users by ID: ${id}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'fuzzySearchById');
            throw error;
        }
    }

    // POST: /api/Bans
    async createBan(banDto: BanCreateDto): Promise<void> {
        try {
            const token = await this.getToken();
            await axios.post(this.bansBaseUrl, banDto, {
                headers: { token: token, 'Content-Type': 'application/json' }
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
                headers: { token: token, 'Content-Type': 'application/json' }
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
                headers: { token: token, 'Content-Type': 'application/json' }
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
                headers: { token: token, 'Content-Type': 'application/json' }
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
                headers: { token: token, 'Content-Type': 'application/json' }
            });
            await this.audit('view', `Checked ban for User ID: ${userId}`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null; // No active ban found
            }
            await this.handleError(error, 'checkUserBan');
            throw error;
        }
    }

    async getLockedOutUsers(): Promise<User[]> {
        try {
            const token = await this.getToken();
            const response: AxiosResponse<User[]> = await axios.get(`${this.baseUrl}/LockedOut`, {
                headers: { token: token, 'Content-Type': 'application/json' }
            });
            await this.audit('view', `Viewed all locked-out users`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getLockedOutUsers');
            throw error;
        }
    }

    // GET: /api/Users/LockedOut/{id}
    async checkIfUserIsLockedOut(userId: number): Promise<{ isLockedOut: boolean, user?: User }> {
        try {
            const token = await this.getToken();
            const response: AxiosResponse<{ isLockedOut: boolean, user?: User }> = await axios.get(`${this.baseUrl}/LockedOut/${userId}`, {
                headers: { token: token, 'Content-Type': 'application/json' }
            });
            await this.audit('view', `Checked lockout status for user with ID: ${userId}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'checkIfUserIsLockedOut');
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
