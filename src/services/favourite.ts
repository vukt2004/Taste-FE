import { BACKEND_URL } from '../config/backend';
import { UserService } from './userService';

export const toggleFavourite = async (restaurantId: string): Promise<{ success: boolean; isFavourite: boolean }> => {
  const response = await UserService.fetchWithAuth(`${BACKEND_URL}/api/favourite/${restaurantId}`, {
    method: 'POST',
  });

  const data = await response.json();
  
  if (response.ok && data.isSuccess) {
    return { success: true, isFavourite: data.data };
  }
  
  throw new Error(data.message || 'Failed to toggle favourite');
};

