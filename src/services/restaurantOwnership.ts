import { BACKEND_URL } from '../config/backend';
import { UserService } from './userService';

export interface CreateRestaurantOwnershipRequestDto {
  restaurantId: string;
  businessRelationship: string;
  additionalInfo?: string;
  proofImages?: string; // JSON array of image URLs
}

export async function createRestaurantOwnershipRequest(dto: CreateRestaurantOwnershipRequestDto) {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/restaurant/ownership/request`, {
    method: 'POST',
    headers: {
      ...UserService.getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra khi tạo yêu cầu ownership');
  }
  
  return data;
}

