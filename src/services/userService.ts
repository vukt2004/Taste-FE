import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';

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
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  ownedRestaurants?: Restaurant[];
  isOwner: boolean;
  isRestaurantOwner: boolean;
}

export interface Restaurant {
  id: string;
  restaurantName: string;
  description: string;
  latitude: number;
  longitude: number;
  priceRange: string;
  operatingHours: string;
  amenities: string;
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

export class UserService {
  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    
    // Kiểm tra nếu token đã hết hạn hoặc sắp hết hạn trong vòng 1 phút tới
    return currentTime >= (expirationTime - 1 * 60 * 1000);
  }

  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.log('Không có refresh token trong localStorage');
        return false;
      }

      console.log('Đang refresh token...');
      const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ RefreshToken: refreshToken }),
      });

      const data = await response.json();
      console.log('Refresh token response:', data);

      if (response.ok) {
        if (data.success && data.data) {
          localStorage.setItem('auth_token', data.data.accessToken);
          if (data.data.refreshToken) {
            localStorage.setItem('refresh_token', data.data.refreshToken);
          }
          if (data.data.expiresAt) {
            localStorage.setItem('token_expires_at', data.data.expiresAt);
          }
          console.log('Refresh token thành công');
          return true;
        }
      } else {
        console.error('Refresh token thất bại:', data.message);
        // Nếu refresh token không hợp lệ, xóa tokens và logout
        if (data.message?.includes('không hợp lệ') || data.message?.includes('hết hạn')) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_data');
          localStorage.removeItem('token_expires_at');
        }
      }
      return false;
    } catch (error) {
      console.error('Lỗi refresh token:', error);
      return false;
    }
  }

  static getAuthHeaders(includeJson: boolean = true): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {};
    if (includeJson) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, options);
    
    // If unauthorized, try to refresh token
    if (response.status === 401) {
      console.log('Got 401, attempting to refresh token...');
      const refreshSuccess = await this.refreshToken();
      if (refreshSuccess) {
        console.log('Token refreshed successfully, retrying request...');
        // Retry request with new token
        const newHeaders = new Headers(options.headers);
        const newToken = localStorage.getItem('auth_token');
        if (newToken) {
          newHeaders.set('Authorization', `Bearer ${newToken}`);
        }
        const retryResponse = await fetch(url, { ...options, headers: newHeaders });
        console.log('Retry response status:', retryResponse.status);
        return retryResponse;
      } else {
        console.log('Token refresh failed');
      }
    }
    
    return response;
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.USER.GET_BY_ID}/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Lỗi lấy thông tin user:', error);
      return null;
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.USER.GET_PROFILE}/${userId}/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Lỗi lấy profile user:', error);
      return null;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    // Check if user data is cached in localStorage
    const cachedUserData = localStorage.getItem('user_data');
    if (cachedUserData) {
      try {
        return JSON.parse(cachedUserData);
      } catch {
        // If parsing fails, remove cached data
        localStorage.removeItem('user_data');
      }
    }
    
    const userId = localStorage.getItem('user_id');
    if (!userId) return null;
    
    // Check token expiration
    if (this.isTokenExpired()) {
      const refreshSuccess = await this.refreshToken();
      if (!refreshSuccess) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        localStorage.removeItem('user_data');
        return null;
      }
    }
    
    // Fallback to getUserById if no cached data
    return this.getUserById(userId);
  }

  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    const userId = localStorage.getItem('user_id');
    if (!userId) return null;
    
    // Kiểm tra token expiration và refresh nếu cần
    if (this.isTokenExpired()) {
      const refreshSuccess = await this.refreshToken();
      if (!refreshSuccess) {
        // Nếu không thể refresh, xóa tất cả token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        return null;
      }
    }
    
    return this.getUserProfile(userId);
  }
}

// Review interfaces
export interface CreateReviewPayload {
  restaurantId: string;
  rating: number;
  content?: string;
  images?: string;
}

export interface ApiResponse<T> {
  isSuccess?: boolean;
  success?: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

// Review service
export class ReviewService {
  static async uploadImages(files: File[]): Promise<string[]> {
    const form = new FormData();
    files.forEach(f => form.append('images', f));
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.REVIEWS.UPLOAD_IMAGES}`, {
      method: 'POST',
      headers: UserService.getAuthHeaders(false),
      body: form,
    });
    const data = await res.json();
    return data.urls ?? [];
  }

  static async createReview(payload: CreateReviewPayload): Promise<ApiResponse<unknown>> {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.REVIEWS.CREATE}`, {
      method: 'POST',
      headers: {
        ...UserService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  static async toggleLike(reviewId: string): Promise<ApiResponse<unknown>> {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.REVIEWS.LIKE(reviewId)}`, {
      method: 'POST',
      headers: UserService.getAuthHeaders(),
    });
    return res.json();
  }

  static async toggleDislike(reviewId: string): Promise<ApiResponse<unknown>> {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.REVIEWS.TOGGLE_DISLIKE(reviewId)}`, {
      method: 'POST',
      headers: UserService.getAuthHeaders(),
    });
    return res.json();
  }
}

// Restaurant service
export class RestaurantService {
  static async create(formData: FormData): Promise<ApiResponse<unknown>> {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.CREATE}`, {
      method: 'POST',
      headers: UserService.getAuthHeaders(false),
      body: formData,
    });
    return res.json();
  }

  static async update(id: string, formData: FormData): Promise<ApiResponse<unknown>> {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.UPDATE(id)}`, {
      method: 'PUT',
      headers: UserService.getAuthHeaders(false),
      body: formData,
    });
    return res.json();
  }

  static async toggleEdit(restaurantId: string, canEdit: boolean, reason?: string): Promise<ApiResponse<unknown>> {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.TOGGLE_EDIT}`, {
      method: 'POST',
      headers: {
        ...UserService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ restaurantId, canEdit, reason }),
    });
    return res.json();
  }
}

// Amenity service
export class AmenityService {
  static async list(params?: { category?: string; activeOnly?: boolean }) {
    const url = new URL(`${BACKEND_URL}${API_ENDPOINTS.AMENITIES.LIST}`);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.activeOnly !== undefined) url.searchParams.set('activeOnly', String(params.activeOnly));
    const res = await fetch(url.toString());
    return res.json();
  }

  static async addToRestaurant(payload: { restaurantId: string; amenityName: string; description?: string; category?: string; icon?: string; reason?: string; }) {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.AMENITIES.ADD_TO_RESTAURANT}`, {
      method: 'POST',
      headers: {
        ...UserService.getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
}

// Dish service
export class DishService {
  static async list(params?: { searchTerm?: string; categoryId?: string; signatureOnly?: boolean }) {
    const url = new URL(`${BACKEND_URL}${API_ENDPOINTS.DISHES.LIST}`);
    if (params?.searchTerm) url.searchParams.set('searchTerm', params.searchTerm);
    if (params?.categoryId) url.searchParams.set('categoryId', params.categoryId);
    if (params?.signatureOnly !== undefined) url.searchParams.set('signatureOnly', String(params.signatureOnly));
    const res = await fetch(url.toString());
    return res.json();
  }

  static async detail(id: string) {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISHES.DETAIL(id)}`);
    return res.json();
  }

  static async create(payload: { name: string; description?: string; tags?: string; typeIds?: string[] }) {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISHES.LIST}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...UserService.getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  static async addCategories(dishId: string, typeIds: string[]) {
    const res = await fetch(`${BACKEND_URL}/api/dish/${dishId}/categories/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...UserService.getAuthHeaders(),
      },
      body: JSON.stringify({ typeIds }),
    });
    return res.json();
  }

  static async removeCategories(dishId: string, typeIds: string[]) {
    const res = await fetch(`${BACKEND_URL}/api/dish/${dishId}/categories/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...UserService.getAuthHeaders(),
      },
      body: JSON.stringify({ typeIds }),
    });
    return res.json();
  }
}

export interface MapBounds {
  north: number; south: number; east: number; west: number;
}

export class RestaurantSearchService {
  // Backend chưa có endpoint này; tạm thời mock qua /api/restaurant-dish hoặc bạn có thể bổ sung phía BE.
  static async byDishInBounds(dishId: string, bounds: MapBounds) {
    const url = `${BACKEND_URL}${API_ENDPOINTS.RESTAURANTS.SEARCH_BY_DISH_IN_BOUNDS(dishId, bounds.north, bounds.south, bounds.east, bounds.west)}`;
    const res = await fetch(url);
    return res.json();
  }
}

export class DishContributionService {
  static async create(payload: { name: string; description?: string; tags?: string; category?: string; icon?: string; }) {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISH_CONTRIBUTION.CREATE}`, {
      method: 'POST',
      headers: {
        ...UserService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  }
}

export class DishTypeService {
  static async list() {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISH_TYPES.LIST}`);
    return res.json();
  }

  static async create(payload: { typeName: string; description?: string; displayOrder?: number; isActive?: boolean }) {
    const res = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISH_TYPES.LIST}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  }
}
