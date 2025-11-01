import { BACKEND_URL } from '../config/backend';
import { getAuthHeaders } from './user';
import { UserService } from './userService';

export interface Review {
  id: string;
  restaurantId: string;
  reviewerDisplayName: string;
  rating: number;
  content?: string;
  reviewScore: number;
  createdAt?: string;
  isApproved?: boolean;
}

// Lấy tất cả reviews của restaurant (không filter IsApproved)
export async function getAllReviewsByRestaurant(restaurantId: string): Promise<Review[]> {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/review/restaurant/${restaurantId}/all`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    // Nếu response không có body hoặc không phải JSON, throw error với status
    const text = await res.text();
    if (!text) {
      throw new Error(`Failed to fetch reviews: ${res.status} ${res.statusText}`);
    }
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || `Failed to fetch reviews: ${res.status}`);
    } catch {
      throw new Error(`Failed to fetch reviews: ${res.status} ${res.statusText}`);
    }
  }
  
  const data = await res.json();
  return data.data || [];
}

// Approve review
export async function approveReview(reviewId: string): Promise<void> {
  await UserService.fetchWithAuth(`${BACKEND_URL}/api/review/${reviewId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

// Reject review (từ chối nhưng vẫn lưu trữ)
export async function rejectReview(reviewId: string): Promise<void> {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/review/${reviewId}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to reject review');
  }
}

// Delete review (xóa hoàn toàn khỏi hệ thống)
export async function deleteReview(reviewId: string): Promise<void> {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/review/${reviewId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to delete review');
  }
}

