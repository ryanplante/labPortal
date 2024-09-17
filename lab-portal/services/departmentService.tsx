import axios, { AxiosResponse } from 'axios';
import { CreateErrorLog } from './errorLogService';
import { CreateAuditLog, AuditLogType } from './auditService';
import { getUserByToken } from './loginService';

export interface Department {
    deptId: number;
    name: string;
    password: string | null;
}

interface DepartmentCreate {
    name: string;
    password?: string; // Password is optional when creating a department
    departmentHeadId?: number | null; // Add department head user ID
}

class DepartmentService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${process.env.EXPO_PUBLIC_API}/Departments`;
    }

    // GET: /api/Departments
    async getAllDepartments(): Promise<Department[]> {
        try {
            const response: AxiosResponse<{ $id: string; $values: Department[] }> = await axios.get(this.baseUrl);
            return response.data.$values;  // Extracting the array of departments from $values
        } catch (error) {
            await this.handleError(error, 'getAllDepartments');
            throw error;
        }
    }

    // GET: /api/Departments/{id}
    async getDepartmentById(deptId: number): Promise<Department> {
        try {
            const response: AxiosResponse<Department> = await axios.get(`${this.baseUrl}/${deptId}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getDepartmentById');
            throw error;
        }
    }

    // PUT: /api/Departments/{id}
    async updateDepartment(deptId: number, departmentDto: DepartmentCreate): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${deptId}`, departmentDto);
            await this.audit('update', `Updated department with ID: ${deptId}`);
        } catch (error) {
            await this.handleError(error, 'updateDepartment');
            throw error;
        }
    }

    // POST: /api/Departments
    async createDepartment(departmentCreateDto: DepartmentCreate): Promise<Department> {
        try {
            const response: AxiosResponse<Department> = await axios.post(this.baseUrl, departmentCreateDto);
            await this.audit('insert', `Created new department with name: ${departmentCreateDto.name}`);
            return response.data; // Return the created department with its ID
        } catch (error) {
            await this.handleError(error, 'createDepartment');
            throw error;
        }
    }

    // DELETE: /api/Departments/{id}
    async deleteDepartment(deptId: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/${deptId}`);
            await this.audit('delete', `Deleted department with ID: ${deptId}`);
        } catch (error) {
            await this.handleError(error, 'deleteDepartment');
            throw error;
        }
    }

    // POST: /api/Departments/verify-password
    async verifyPassword(deptId: number, password: string): Promise<void> {
        try {
            // Send parameters in the query string, not in the body
            const response = await axios.post(
                `${this.baseUrl}/verify-password`,
                null, // No request body is needed, so send null
                {
                    params: {
                        deptId: deptId,
                        password: password
                    }
                }
            );
            await this.audit('view', `Verified password for department ID: ${deptId}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'verifyPassword');
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
            const user = await getUserByToken();
            const userId = userID || Number(user.userId);
            await CreateAuditLog(description, userId, auditType);
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
}

export default new DepartmentService();
