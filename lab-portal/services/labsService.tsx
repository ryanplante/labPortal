import axios, { AxiosResponse } from 'axios';
import { CreateErrorLog } from './errorLogService';
import { CreateAuditLog, AuditLogType } from './auditService';
import { getUserByToken } from './loginService';

interface Lab {
    labId: number;
    name: string;
    roomNum: string;
    deptId: number;
}

interface LabCreate {
    name: string;
    roomNum: string;
    deptId: number;
}

class LabService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = 'https://localhost:7282/api/Labs';
    }

    // GET: /api/Labs
    async getAllLabs(): Promise<Lab[]> {
        try {
            const response: AxiosResponse<Lab[]> = await axios.get(this.baseUrl);
            await this.audit('view', `Viewed all labs`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getAllLabs');
            throw error;
        }
    }

    // GET: /api/Labs/{id}
    async getLabById(id: number): Promise<Lab> {
        try {
            const response: AxiosResponse<Lab> = await axios.get(`${this.baseUrl}/${id}`);
            await this.audit('view', `Viewed lab with ID: ${id}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getLabById');
            throw error;
        }
    }

    // GET: /api/Labs/Department/{id}
    async getLabByDept(deptId: number): Promise<number> {
        try {
            const response: AxiosResponse<number> = await axios.get(`${this.baseUrl}/Department`, { params: { id: deptId } });
            await this.audit('view', `Viewed lab by department ID: ${deptId}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getLabByDept');
            throw error;
        }
    }

    // PUT: /api/Labs/{id}
    async updateLab(id: number, labDto: Lab): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${id}`, labDto);
            await this.audit('update', `Updated lab with ID: ${id}`);
        } catch (error) {
            await this.handleError(error, 'updateLab');
            throw error;
        }
    }

    // POST: /api/Labs
    async createLab(labCreateDto: LabCreate): Promise<void> {
        try {
            await axios.post(this.baseUrl, labCreateDto);
            await this.audit('insert', `Created new lab with name: ${labCreateDto.name}`);
        } catch (error) {
            await this.handleError(error, 'createLab');
            throw error;
        }
    }

    // DELETE: /api/Labs/{id}
    async deleteLab(id: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/${id}`);
            await this.audit('delete', `Deleted lab with ID: ${id}`);
        } catch (error) {
            await this.handleError(error, 'deleteLab');
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

export default new LabService();
