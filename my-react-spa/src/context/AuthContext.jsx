// context/AuthContext.jsx

import { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services/authService'

// Crear el contexto
export const AuthContext = createContext()

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Provider del contexto
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar si hay sesión al cargar la app
  useEffect(() => {
    checkAuth()
  }, [])

  // Verificar autenticación con backend
  const checkAuth = async () => {
    setLoading(true)
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('No token')

      // Llamar al endpoint protegido para validar token y obtener usuario
      const data = await authService.getUserProfile()

      // Si todo OK, seteamos usuario y autenticación
      setUser(data)
      setIsAuthenticated(true)

      // Guardar usuario simple para otras partes
      localStorage.setItem('current_user', JSON.stringify({
        id: data.id,
        username: data.username,
        avatar: data.avatar
      }))
    } catch (error) {
      // Si falla (token inválido o expirado), limpiamos todo
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('current_user')
    } finally {
      setLoading(false)
    }
  }

  // Registrar usuario
  const register = async (userData) => {
    try {
      const result = await authService.register(userData)
      if (result.success) {
        // Login automático luego de registrar
        const loginResult = await authService.login({
          identifier: userData.email,
          password: userData.password
        })
        if (loginResult.success) {
          setUser(loginResult.data)
          setIsAuthenticated(true)
          localStorage.setItem('current_user', JSON.stringify({
            id: loginResult.data.id,
            username: loginResult.data.username,
            avatar: loginResult.data.avatar
          }))
        }
      }
      return result
    } catch {
      return { success: false, error: 'Error al registrar usuario' }
    }
  }

  // Login usuario
  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials)
      if (result.success) {
        setUser(result.data)
        setIsAuthenticated(true)
        localStorage.setItem('current_user', JSON.stringify({
          id: result.data.id,
          username: result.data.username,
          avatar: result.data.avatar
        }))
      }
      return result
    } catch {
      return { success: false, error: 'Error al iniciar sesión' }
    }
  }

  // Logout usuario
  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('current_user')
  }

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      if (!user) return { success: false, error: 'No hay usuario autenticado' }
      const result = await authService.updateUserProfile(profileData)
      if (result.success) {
        setUser(result.data)
        localStorage.setItem('current_user', JSON.stringify({
          id: result.data.id,
          username: result.data.username,
          avatar: result.data.avatar
        }))
      }
      return result
    } catch {
      return { success: false, error: 'Error al actualizar perfil' }
    }
  }

  const deleteProfile = async (password) => {
    try {
      const result = await authService.deleteUserProfile(password)
      
      if (result.success) {
        // Limpiar estado y storage
        setUser(null)
        authService.logout()
        
        return { success: true }
      }
      
      return { success: false, error: result.error }
    } catch (error) {
      console.error('Error al eliminar perfil:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    checkAuth,
    deleteProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
