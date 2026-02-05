import api from './api';
import type { StockDetail, StockSummary } from '../types';

export interface StockMoveRequest {
    stockId?: string;
    itemCode: string;
    sourceLocationCode: string;
    targetLocationCode: string;
    quantity: number;
}

export const StockService = {
    moveStock: async (request: StockMoveRequest): Promise<void> => {
        await api.post('/stock/move', request);
    },

    getInventorySummary: async (): Promise<StockSummary[]> => {
        // Backend: StockController.getInventorySummary()
        // If not implemented, this will 404. 
        // We added findAll() in backend interface, let's assume we map it.
        // For safety in this step, if backend fails, we might want to catch it? 
        // No, let's try the real call.

        const response = await api.get<StockSummary[]>('/stock/inventory');
        return response.data;
    },

    getStockByLocation: async (locationId: string): Promise<StockDetail[]> => {
        const response = await api.get<StockDetail[]>(`/stock/location/${locationId}`);
        return response.data;
    },

    getStockByItem: async (itemCode: string): Promise<StockDetail[]> => {
        const response = await api.get<StockDetail[]>(`/stock/item/${itemCode}`);
        return response.data;
    }
};
