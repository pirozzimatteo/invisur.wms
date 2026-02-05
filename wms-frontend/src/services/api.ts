import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
});

// Response interceptor for error handling (optional but good practice)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const locationService = {
    getAll: (params?: any) => api.get('/locations', { params }),
    create: (data: any) => api.post('/locations', data),
    update: (id: string, data: any) => api.put(`/locations/${id}`, data),
    // Add other methods as needed
};

export const itemService = {
    getAll: () => api.get('/items'),
    create: (data: any) => api.post('/items', data),
    resolveByCode: (code: string) => api.get(`/items/resolve/${code}`),
};

export const inboundService = {
    confirmPutaway: (data: any) => api.post('/inbound/confirm-putaway', data), // Will 404 for now, backend not impl
};

export default api;
