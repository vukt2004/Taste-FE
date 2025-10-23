import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';
import { getAuthHeaders } from './user';
import { UserService } from './userService';

export async function listDishes(params?: { searchTerm?: string; categoryId?: string; signatureOnly?: boolean }) {
  const url = new URL(`${BACKEND_URL}${API_ENDPOINTS.DISHES.LIST}`);
  if (params?.searchTerm) url.searchParams.set('searchTerm', params.searchTerm);
  if (params?.categoryId) url.searchParams.set('categoryId', params.categoryId);
  if (params?.signatureOnly !== undefined) url.searchParams.set('signatureOnly', String(params.signatureOnly));
  const res = await fetch(url.toString());
  return res.json();
}

export async function dishDetail(id: string) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISHES.DETAIL(id)}`);
  return res.json();
}

export async function createDish(payload: { name: string; description?: string; tags?: string; typeIds?: string[] }) {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.DISHES.LIST}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function addDishCategories(dishId: string, typeIds: string[]) {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/dish/${dishId}/categories/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ typeIds }),
  });
  return res.json();
}

export async function removeDishCategories(dishId: string, typeIds: string[]) {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/dish/${dishId}/categories/remove`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ typeIds }),
  });
  return res.json();
}


