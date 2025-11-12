// src/services/authService.js
import { API_BASE_URL } from './endpoints'
import { httpClient } from './httpService'

const handleResponse = async (response) => {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición')
  }
  return data
}

export const authService = {
  // Registrar nuevo usuario
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return handleResponse(response)
  },

  // Login usuario
  login: async ({ identifier, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    })

    const data = await handleResponse(response)

    if (data.token) {
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user_data', JSON.stringify(data.data))
    }

    return data
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },

  // Obtener usuario actual del localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user_data')
    return user ? JSON.parse(user) : null
  },

  // Verificar si está autenticado (token existe)
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token')
  },

  // Ejemplo: obtener perfil de usuario (petición protegida)
  getUserProfile: () => httpClient('/auth/me'),

  // Actualizar perfil usuario (petición protegida)
  updateUserProfile: (data) =>
    httpClient('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Eliminar perfil usuario (petición protegida)
  deleteUserProfile: (password) =>
    httpClient('/auth/profile', { 
      method: 'DELETE', 
      body: JSON.stringify({ password }) 
    }),
}