import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';
import { getAuthHeaders } from './user';

export interface RestaurantFilter {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  southWestLat?: number;
  southWestLng?: number;
  northEastLat?: number;
  northEastLng?: number;
  dishIds?: string[];
  amenityIds?: string[];
  priceRange?: string;
  searchKeyword?: string;
  verifiedOnly?: boolean;
  activeOnly?: boolean;
  limit?: number;
  skip?: number;
}

export async function filterRestaurants(filter: RestaurantFilter) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.FILTER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filter),
  });
  return res.json();
}

export async function createRestaurant(formData: FormData) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.CREATE}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return res.json();
}

export async function updateRestaurant(id: string, formData: FormData) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.UPDATE(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
  return res.json();
}

export async function claimRestaurant(id: string) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.CLAIM(id)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function toggleRestaurantEdit(restaurantId: string, canEdit: boolean, reason?: string) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.TOGGLE_EDIT}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ restaurantId, canEdit, reason }),
  });
  return res.json();
}


