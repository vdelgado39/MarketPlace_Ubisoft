// src/services/httpService.js
import { API_BASE_URL } from './endpoints'

export const httpClient = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    let errorMessage = 'Error en la petición'
    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // Fallback por si no viene JSON
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
