import { BACKEND_URL } from '../config/backend';
import { UserService } from './userService';

export const toggleBlacklist = async (restaurantId: string): Promise<{ success: boolean; isBlacklisted: boolean }> => {
  const response = await UserService.fetchWithAuth(`${BACKEND_URL}/api/blacklist/${restaurantId}`, {
    method: 'POST',
  });

  const data = await response.json();
  
  if (response.ok && data.isSuccess) {
    return { success: true, isBlacklisted: data.data };
  }
  
  throw new Error(data.message || 'Failed to toggle blacklist');
};

