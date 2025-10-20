import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';

export async function listDishTypes() {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISH_TYPES.LIST}`);
  return res.json();
}

export async function createDishType(payload: { typeName: string; description?: string; displayOrder?: number; isActive?: boolean }) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISH_TYPES.LIST}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}


