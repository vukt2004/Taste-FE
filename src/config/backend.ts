export const BACKEND_URL = 'https://tastemapbe.onrender.com';

export const API_ENDPOINTS = {
  AUTH: {
    INIT_SESSION: '/api/Auth/init-session',
    GOOGLE_LOGIN: '/api/Auth/google',
    GOOGLE_CALLBACK: '/api/Auth/google-callback',
    REGISTER: '/api/Auth/register',
    LOGIN: '/api/Auth/login',
  },
  EMAIL_VERIFICATION: {
    VERIFY: '/api/EmailVerification/verify',
    RESEND_OTP: '/api/EmailVerification/resend-otp',
  },
  REVIEWS: {
    UPLOAD_IMAGES: '/api/review/upload-images',
    CREATE: '/api/review',
    LIKE: (reviewId: string) => `/api/review/${reviewId}/like`,
    TOGGLE_DISLIKE: (reviewId: string) => `/api/review/${reviewId}/toggle-dislike`,
  },
  DISHES: {
    LIST: '/api/dish',
    DETAIL: (id: string) => `/api/dish/${id}`,
  },
  DISH_CONTRIBUTION: {
    CREATE: '/api/dish/contribution',
    LIST: '/api/dish/contribution',
  },
  RESTAURANT_CONTRIBUTION: {
    CREATE: '/api/RestaurantContribution',
    LIST: '/api/RestaurantContribution',
  },
  DISH_TYPES: {
    LIST: '/api/dishtype',
  },
  RESTAURANTS: {
    CREATE: '/api/restaurant',
    UPDATE: (id: string) => `/api/restaurant/${id}`,
    GET: (id: string) => `/api/restaurant/${id}`,
    GET_ALL: '/api/restaurant/all',
    TOGGLE_EDIT: '/api/restaurant/toggle-edit',
    FILTER: '/api/restaurant/filter',
    SEARCH_BY_DISH_IN_BOUNDS: (dishId: string, n: number, s: number, e: number, w: number) =>
      `/api/restaurant/search-by-dish?dishId=${dishId}&north=${n}&south=${s}&east=${e}&west=${w}`,
  },
  ADMIN: {
    RESTAURANTS: '/api/admin/restaurants',
    USERS: '/api/admin/users',
  },
  AMENITIES: {
    LIST: '/api/amenity',
    ADD_TO_RESTAURANT: '/api/amenity/add-to-restaurant',
  },
  USER: {
    GET_BY_ID: '/api/User',
    GET_PROFILE: '/api/User',
  },
  MAP: {
    MARKERS: '/map/markers',
    ADD_MARKER: '/map/markers',
  },
} as const;
