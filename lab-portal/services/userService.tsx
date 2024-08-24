import axios, { AxiosResponse } from 'axios';
import { CreateErrorLog } from './errorLogService';
import { CreateAuditLog, AuditLogType } from './auditService';
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

class UserService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://localhost:7282/api/Users'; 
    }

    // GET: /api/Users
    async getAllUsers(): Promise<User[]> {
        try {
            const response: AxiosResponse<User[]> = await axios.get(this.baseUrl);
            await this.audit('view', `Viewed all users`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getAllUsers');
            throw error;
        }
    }

    // POST: /api/Users
    async createUser(userDto: User): Promise<User> {
        try {
            const response: AxiosResponse<User> = await axios.post(this.baseUrl, userDto);
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
            const response: AxiosResponse<User> = await axios.get(`${this.baseUrl}/${userId}`);
            await this.audit('view', `Viewed user with ID: ${userId}`, userId);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getUserById');
            throw error;
        }
    }

    // PUT: /api/Users/{id}
    async updateUser(userId: number, userDto: User): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${userId}`, userDto);
            await this.audit('update', `Updated user with ID: ${userId}`, userId);
        } catch (error) {
            await this.handleError(error, 'updateUser');
            throw error;
        }
    }

    // GET: /api/Users/FuzzySearchById/{id}
    async fuzzySearchById(id: number): Promise<User[]> {
        try {
            const response: AxiosResponse<User[]> = await axios.get(`${this.baseUrl}/FuzzySearchById/${id}`);
            await this.audit('view', `Fuzzy searched users by ID: ${id}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'fuzzySearchById');
            throw error;
        }
    }

    // GET: /api/Users/FuzzySearchByName
    async fuzzySearchByName(fName?: string, lName?: string): Promise<User[]> {
        try {
            const params = { fName, lName };
            const response: AxiosResponse<User[]> = await axios.get(`${this.baseUrl}/FuzzySearchByName`, { params });
            await this.audit('view', `Fuzzy searched users by Name: ${fName || ''} ${lName || ''}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'fuzzySearchByName');
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
}

export default new UserService();
