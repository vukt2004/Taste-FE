import { BACKEND_URL } from '../config/backend';
import { UserService } from './userService';

export interface CreateQRPaymentDto {
  description: string;
}

export interface QRPaymentResponse {
  qrCodeUrl: string;
  accountNo: string;
  accountName: string;
  acqId: string;
  amount: number;
  description: string;
  bankName: string;
}

export async function createQRPayment(dto: CreateQRPaymentDto): Promise<QRPaymentResponse> {
  const res = await UserService.fetchWithAuth(`${BACKEND_URL}/api/Payment/qr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    let errorMessage = 'Failed to create QR payment';
    try {
      const errorData = await res.json();
      if (errorData.message || errorData.details) {
        errorMessage = errorData.details || errorData.message || errorMessage;
      }
    } catch {
      // Nếu không parse được JSON, dùng message mặc định
    }
    throw new Error(errorMessage);
  }

  const response = await res.json();
  // API trả về format ApiResponse { isSuccess, data, message, ... }
  if (response.isSuccess && response.data) {
    return response.data;
  }
  // Fallback nếu response không đúng format
  return response;
}

