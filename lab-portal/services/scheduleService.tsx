import axios, { AxiosResponse } from 'axios';
import { CreateErrorLog } from './errorLogService';
import { CreateAuditLog, AuditLogType } from './auditService';
import { getUserByToken } from './loginService';

interface Schedule {
    scheduleId: number;
    userId: number | null;
    fkLab: number | null;
    timeIn: string;
    timeOut: string;
    dayOfWeek: number | null;
    fkScheduleType: number | null;
    location?: string | null;
}

interface ScheduleExemption {
    scheduleExemptionId: number;
    startDate: string;
    endDate: string;
    fkExemptionType: number;
    fkUser: number;
    fkLab: number;
    verified: boolean;
    fkSchedule: number | null;
}

interface LabScheduleSummary {
    labName: string;
    roomNum: string;
    scheduleSummary: string;
}

class ScheduleService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${process.env.EXPO_PUBLIC_API}/Schedule`;
    }

    private async handleError(error: any, source: string): Promise<void> {
        await CreateErrorLog(error as Error, source, null, 'error');
    }

    private async audit(auditType: AuditLogType, description: string, userID?: number): Promise<void> {
        try {
            const user = await getUserByToken();
            const userId = userID || Number(user.userId);
            await CreateAuditLog(description, userId, auditType);
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    // Get work schedule by department
    async getWorkScheduleByDepartment(departmentId: number, startDate: string, endDate: string): Promise<Schedule[]> {
        try {
            const response: AxiosResponse<Schedule[]> = await axios.get(`${this.baseUrl}/Department/${departmentId}`, {
                params: { startDate, endDate }
            });
            await this.audit('view', `Viewed work schedule for department ID: ${departmentId}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getWorkScheduleByDepartment');
            throw error;
        }
    }

    // Get lab schedule summary
    async getLabScheduleSummary(): Promise<LabScheduleSummary[]> {
        try {
            const response: AxiosResponse<LabScheduleSummary[]> = await axios.get(`${this.baseUrl}/LabSummary`);
            await this.audit('view', 'Viewed lab schedule summary');
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getLabScheduleSummary');
            throw error;
        }
    }

    // Get current lab for a user
    async getCurrentLabForUser(userId: number): Promise<number> {
        try {
            const response: AxiosResponse<number> = await axios.get(`${this.baseUrl}/CurrentLab/${userId}`);
            await this.audit('view', `Viewed current lab for user ID: ${userId}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getCurrentLabForUser');
            throw error;
        }
    }

    // Create a new schedule
    async createSchedule(scheduleData: Schedule): Promise<Schedule> {
        try {
            const response: AxiosResponse<Schedule> = await axios.post(this.baseUrl, scheduleData);
            await this.audit('insert', `Created new schedule for user ID: ${scheduleData.userId}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'createSchedule');
            throw error;
        }
    }

    // Update an existing schedule
    async updateSchedule(id: number, scheduleData: Schedule): Promise<void> {
        try {
            await axios.put(`${this.baseUrl}/${id}`, scheduleData);
            await this.audit('update', `Updated schedule with ID: ${id}`);
        } catch (error) {
            await this.handleError(error, 'updateSchedule');
            throw error;
        }
    }

    // Delete a schedule
    async deleteSchedule(id: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/${id}`);
            await this.audit('delete', `Deleted schedule with ID: ${id}`);
        } catch (error) {
            await this.handleError(error, 'deleteSchedule');
            throw error;
        }
    }

    // Get all schedule exemptions
    async getScheduleExemptions(): Promise<ScheduleExemption[]> {
        try {
            const response: AxiosResponse<ScheduleExemption[]> = await axios.get(`${this.baseUrl}/Exemptions`);
            await this.audit('view', 'Viewed all schedule exemptions');
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getScheduleExemptions');
            throw error;
        }
    }

    // Create a schedule exemption
    async createScheduleExemption(exemptionData: ScheduleExemption): Promise<ScheduleExemption> {
        try {
            const response: AxiosResponse<ScheduleExemption> = await axios.post(`${this.baseUrl}/Exemptions`, exemptionData);
            await this.audit('insert', `Created new schedule exemption for user ID: ${exemptionData.fkUser}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'createScheduleExemption');
            throw error;
        }
    }

    // Get a schedule exemption by ID
    async getScheduleExemptionById(id: number): Promise<ScheduleExemption> {
        try {
            const response: AxiosResponse<ScheduleExemption> = await axios.get(`${this.baseUrl}/Exemptions/${id}`);
            await this.audit('view', `Viewed schedule exemption with ID: ${id}`);
            return response.data;
        } catch (error) {
            await this.handleError(error, 'getScheduleExemptionById');
            throw error;
        }
    }

    // Delete a schedule exemption
    async deleteScheduleExemption(id: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/Exemptions/${id}`);
            await this.audit('delete', `Deleted schedule exemption with ID: ${id}`);
        } catch (error) {
            await this.handleError(error, 'deleteScheduleExemption');
            throw error;
        }
    }
}

export default new ScheduleService();
