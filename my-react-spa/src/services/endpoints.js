// Configuración de endpoints de la API

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },

  // Gestión de skins
  SKINS: {
    BASE: '/skins',
    MY_SKINS: '/skins/my-skins',
    CREATE: '/skins',
    UPDATE: (id) => `/skins/${id}`,
    DELETE: (id) => `/skins/${id}`,
    GET_BY_ID: (id) => `/skins/${id}`,
    UPLOAD_IMAGE: (id) => `/skins/${id}/upload-image`,
    BY_GAME: (gameId) => `/skins/game/${gameId}`,
    BY_CATEGORY: (categoryId) => `/skins/category/${categoryId}`
  },

  // Marketplace
  MARKETPLACE: {
    FEATURED: '/marketplace/featured',
    SEARCH: '/marketplace/search',
    PURCHASE: (skinId) => `/marketplace/purchase/${skinId}`,
    TOP_RATED: '/marketplace/top-rated',
    RECENT: '/marketplace/recent'
  },

  // Juegos
  GAMES: {
    BASE: '/games',
    GET_BY_ID: (id) => `/games/${id}`,
    WITH_SKINS: '/games/with-skins'
  },

  // Categorías
  CATEGORIES: {
    BASE: '/categories',
    GET_BY_ID: (id) => `/categories/${id}`,
    WITH_SKINS: '/categories/with-skins'
  },

  // Usuario
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    PURCHASED_SKINS: '/user/purchased-skins',
    WALLET: '/user/wallet',
    TRANSACTIONS: '/user/transactions'
  },

  // Archivos
  FILES: {
    UPLOAD: '/files/upload',
    DELETE: (fileId) => `/files/${fileId}`
  }
}

// Headers comunes para las peticiones
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// Headers para upload de archivos
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data'
}

// Configuración de timeout
export const API_TIMEOUT = 30000 // 30 segundos

// Códigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
}

// Mensajes de error predeterminados
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'No tienes autorización para realizar esta acción.',
  FORBIDDEN: 'No tienes permisos para acceder a este recurso.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
  SERVER_ERROR: 'Error interno del servidor. Inténtalo de nuevo más tarde.',
  TIMEOUT: 'La solicitud tardó demasiado tiempo. Inténtalo de nuevo.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.'
}