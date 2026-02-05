import { useQuery } from '@tanstack/react-query';
import { locationService } from '../services/api';

export const useLocations = () => {
    return useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const response = await locationService.getAll();
            return response.data;
        },
    });
};
