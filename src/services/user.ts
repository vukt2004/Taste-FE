import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';
import { UserService } from './userService';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  userType: string;
  authProvider: string;
  points: number;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  restaurantName: string;
  description: string;
  latitude?: number;
  longitude?: number;
  priceRange: string;
  operatingHours: string;
  amenities: string;
  story?: string;
  verificationStatus: string;
  isActive: boolean;
  isVerified: boolean;
  canEdit: boolean;
  ownerId: string;
  ownerName: string;
  isClaimed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  ownedRestaurants?: Restaurant[];
  favouriteRestaurants?: Restaurant[];
  blacklistedRestaurants?: Restaurant[];
  isOwner: boolean;
  isRestaurantOwner: boolean;
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const response = await UserService.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.USER.GET_BY_ID}/${userId}`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) return await response.json();
    return null;
  } catch {
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await UserService.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.USER.GET_PROFILE}/${userId}/profile`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) return await response.json();
    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const userId = localStorage.getItem('user_id');
  if (!userId) return null;
  return getUserById(userId);
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const userId = localStorage.getItem('user_id');
  if (!userId) return null;
  return getUserProfile(userId);
}

export async function getMyProfile(): Promise<UserProfile | null> {
  try {
    const response = await UserService.fetchWithAuth(`${BACKEND_URL}/api/User/profile`, {
      headers: getAuthHeaders(),
    });
    if (response.ok) return await response.json();
    return null;
  } catch {
    return null;
  }
}


