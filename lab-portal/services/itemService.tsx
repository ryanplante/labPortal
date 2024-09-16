import axios, { AxiosResponse } from 'axios';
import { CreateErrorLog } from './errorLogService';
import { CreateAuditLog, AuditLogType } from './auditService';
import { getUserByToken } from './loginService';

interface Item {
    itemId: number;
    description: string;
    quantity: number;
    serialNum: string;
    picture: string | null; // Base64 string or null
    lab: number; 
}

interface ItemCreate {
    description: string;
    quantity: number;
    serialNum: string;
    picture: string | null; // Base64 string
    lab: number; 
}

class ItemService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${process.env.EXPO_PUBLIC_API}/Items`;
    }

    async getItems(departmentId?: number): Promise<Item[]> {
        try {
            // Build URL with optional departmentId query parameter
            const url = departmentId ? `${this.baseUrl}?departmentId=${departmentId}` : this.baseUrl;
    
            const response: AxiosResponse<{ $values: Item[] }> = await axios.get(url);
            await this.audit('view', departmentId ? `Viewed items for department ${departmentId}` : 'Viewed all items');
    
            return response.data.$values.map(item => ({
                ...item,
                picture: item.picture ? atob(item.picture) : null, // Convert from Base64 or set to null
            }));
        } catch (error: any) {
            if (error.response?.status === 404) {
                return []; // Return empty array on 404
            }
            await this.handleError(error, 'getItems');
            throw error;
        }
    }    

    async getItemById(id: number): Promise<Item> {
        try {
            const response: AxiosResponse<Item> = await axios.get(`${this.baseUrl}/${id}`);
            await this.audit('view', `Viewed item with ID: ${id}`);
            const item = response.data;
            return {
                ...item,
                picture: item.picture ? atob(item.picture) : null, // Convert from Base64 or set to null
            };
        } catch (error: any) {
            if (error.response?.status === 404) {
                return {} as Item; // Return an empty object on 404
            }
            await this.handleError(error, 'getItemById');
            throw error;
        }
    }

    async getNameById(Id: number): Promise<string> {
        try {
          if (Id) {
            const item = await this.getItemById(Id);
            return `${item.description}`;
          }
          return 'Unknown'; // Return 'Unknown' if monitorID is null or invalid
        } catch (error) {
          console.error('Error fetching monitor name:', error);
          return 'Unknown'; // Handle errors gracefully
        }
      };

    async searchItems(labId: number, query: string): Promise<Item[]> {
        try {
            const response: AxiosResponse<{ $values: Item[] }> = await axios.get(`${this.baseUrl}/search/${labId}/${query}`);
            await this.audit('view', `Searched items in lab ${labId} with query: "${query}"`);
            return response.data.$values.map(item => ({
                ...item,
                picture: item.picture ? atob(item.picture) : null, // Convert from Base64 or set to null
            }));
        } catch (error: any) {
            if (error.response?.status === 404) {
                return []; // Return empty array on 404
            }
            await this.handleError(error, 'searchItems');
            throw error;
        }
    }

    async createItem(item: ItemCreate): Promise<void> {
        try {
            const newItem = {
                description: item.description,
                quantity: item.quantity,
                serialNum: item.serialNum,
                picture: item.picture ? btoa(item.picture) : null, // Convert to Base64 if picture is provided
                lab: item.lab, // Correctly setting `lab` in the payload
            };
            await axios.post(this.baseUrl, newItem);
            await this.audit('insert', `Created new item with serial number: ${item.serialNum}`);
        } catch (error) {
            await this.handleError(error, 'createItem');
            throw error;
        }
    }

    async updateItem(id: number, item: ItemCreate): Promise<void> {
        try {
            const updatedItem = {
                description: item.description,
                quantity: item.quantity,
                serialNum: item.serialNum,
                picture: item.picture ? btoa(item.picture) : null, // Convert to Base64 if picture is provided
                lab: item.lab, // Correctly setting `lab` in the payload
            };
            await axios.put(`${this.baseUrl}/${id}`, updatedItem);
            await this.audit('update', `Updated item with ID: ${id}`);
        } catch (error) {
            await this.handleError(error, 'updateItem');
            throw error;
        }
    }

    async deleteItem(id: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/${id}`);
            await this.audit('delete', `Deleted item with ID: ${id}`);
        } catch (error) {
            await this.handleError(error, 'deleteItem');
            throw error;
        }
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
}

export default new ItemService();
