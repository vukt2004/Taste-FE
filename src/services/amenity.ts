import { BACKEND_URL } from '../config/backend';

export interface Amenity {
  id: string;
  name: string;
  isActive: boolean;
}

export async function listAmenities(params?: { activeOnly?: boolean }) {
  const url = new URL(`${BACKEND_URL}/api/Amenity`);
  if (params?.activeOnly !== undefined) {
    url.searchParams.set('activeOnly', String(params.activeOnly));
  }
  const res = await fetch(url.toString());
  const data = await res.json();
  // Handle both array response and object with data property
  return Array.isArray(data) ? data : (data.data || []);
}

