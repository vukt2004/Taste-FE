export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://tastemapbe.onrender.com';

export const API_ENDPOINTS = {
  AUTH: {
    INIT_SESSION: '/api/Auth/init-session',
    GOOGLE_LOGIN: '/api/Auth/google',
    GOOGLE_CALLBACK: '/api/Auth/google-callback',
    GOOGLE_WITH_ROLE: '/api/Auth/google-with-role',
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
  DISH_TYPES: {
    LIST: '/api/dishtype',
  },
  RESTAURANTS: {
    CREATE: '/api/restaurant',
    UPDATE: (id: string) => `/api/restaurant/${id}`,
    CLAIM: (id: string) => `/api/restaurant/${id}/claim`,
    TOGGLE_EDIT: '/api/restaurant/toggle-edit',
    SEARCH_BY_DISH_IN_BOUNDS: (dishId: string, n: number, s: number, e: number, w: number) =>
      `/api/restaurant/search-by-dish?dishId=${dishId}&north=${n}&south=${s}&east=${e}&west=${w}`,
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
