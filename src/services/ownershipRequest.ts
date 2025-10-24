 import { BACKEND_URL } from '../config/backend';
import { UserService } from './userService';

export interface OwnershipRequestDto {
  id: string;
  restaurantId: string;
  requestedById: string;
  businessRelationship: string;
  additionalInfo?: string;
  proofImages?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reviewedById?: string;
  reviewedAt?: string;
  adminNotes?: string;
  restaurantName?: string;
  requestedByName?: string;
}

export interface ProcessOwnershipRequestDto {
  isApproved: boolean;
  adminNotes?: string;
}

export async function listOwnershipRequests() {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/admin/ownership-requests`, {
    method: 'GET',
    headers: UserService.getAuthHeaders(),
  });
  return res.json();
}

export async function approveOwnershipRequest(requestId: string, dto: ProcessOwnershipRequestDto) {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/admin/ownership-request/${requestId}/approve`, {
    method: 'POST',
    headers: {
      ...UserService.getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  return res.json();
}

