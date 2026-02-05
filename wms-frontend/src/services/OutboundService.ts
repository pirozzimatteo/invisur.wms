export interface OutboundOrder {
    id: string;
    orderNumber: string;
    customerId: string;
    status: 'NEW' | 'PLANNED' | 'PICKING' | 'SHIPPED' | 'COMPLETED';
    lines: OutboundLine[];
    createdAt: string;
}

export interface OutboundLine {
    id: string;
    itemId: string;
    itemDescription: string;
    orderedQuantity: number;
    pickedQuantity: number;
}

export interface PickingTask {
    id: string;
    orderId: string;
    itemCode: string;
    locationCode: string; // "Aisle 1, Rack 2"
    targetQuantity: number;
    status: 'PENDING' | 'COMPLETED';
}

// Mocks removed

import api from './api';

export const OutboundService = {
    getAllOrders: async (): Promise<OutboundOrder[]> => {
        const response = await api.get<OutboundOrder[]>('/outbound/orders');
        return response.data;
    },

    createOrder: async (order: any): Promise<void> => {
        await api.post('/outbound/orders', order);
    },

    getPendingTasks: async (): Promise<PickingTask[]> => {
        const response = await api.get<PickingTask[]>('/outbound/picking-tasks');
        return response.data;
    },

    confirmTask: (taskId: string) => api.post(`/outbound/tasks/${taskId}/confirm`),

    shipOrder: (orderId: string) => api.post(`/outbound/orders/${orderId}/ship`)
};
