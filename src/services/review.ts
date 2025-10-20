import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';
import { getAuthHeaders } from './user';

export async function uploadReviewImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach(f => form.append('images', f));
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.REVIEWS.UPLOAD_IMAGES}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: form as any,
  } as any);
  const data = await res.json();
  return data.urls ?? [];
}

export async function createReview(payload: unknown) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.REVIEWS.CREATE}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function toggleReviewLike(reviewId: string) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.REVIEWS.LIKE(reviewId)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function toggleReviewDislike(reviewId: string) {
  const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.REVIEWS.TOGGLE_DISLIKE(reviewId)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json();
}


