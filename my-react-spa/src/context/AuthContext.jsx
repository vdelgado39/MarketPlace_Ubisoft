import { createContext, useState, useEffect, useContext } from 'react'
import authService from '../services/authService'

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

  // Verificar autenticación
  const checkAuth = async () => {
    try {
      setLoading(true)
      const result = await authService.getCurrentUser()
      
      if (result.success && result.data) {
        setUser(result.data)
        setIsAuthenticated(true)
        // Guardar datos del usuario actual en localStorage para comentarios
        localStorage.setItem('current_user', JSON.stringify({
          id: result.data.id,
          username: result.data.username,
          avatar: result.data.avatar
        }))
      } else {
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('current_user')
      }
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
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
        // Después de registrar, hacer login automáticamente
        const loginResult = await authService.login({
          identifier: userData.email,
          password: userData.password
        })
        
        if (loginResult.success) {
          setUser(loginResult.data)
          setIsAuthenticated(true)
          // Guardar datos del usuario
          localStorage.setItem('current_user', JSON.stringify({
            id: loginResult.data.id,
            username: loginResult.data.username,
            avatar: loginResult.data.avatar
          }))
        }
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: 'Error al registrar usuario'
      }
    }
  }

  // Iniciar sesión
  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials)
      
      if (result.success) {
        setUser(result.data)
        setIsAuthenticated(true)
        // Guardar datos del usuario
        localStorage.setItem('current_user', JSON.stringify({
          id: result.data.id,
          username: result.data.username,
          avatar: result.data.avatar
        }))
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: 'Error al iniciar sesión'
      }
    }
  }

  // Cerrar sesión
  const logout = async () => {
    try {
      const result = await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('current_user')
      return result
    } catch (error) {
      return {
        success: false,
        error: 'Error al cerrar sesión'
      }
    }
  }

  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      if (!user) {
        return {
          success: false,
          error: 'No hay usuario autenticado'
        }
      }

      const result = await authService.updateProfile(user.id, profileData)
      
      if (result.success) {
        setUser(result.data)
        // Actualizar datos del usuario en localStorage
        localStorage.setItem('current_user', JSON.stringify({
          id: result.data.id,
          username: result.data.username,
          avatar: result.data.avatar
        }))
      }
      
      return result
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar perfil'
      }
    }
  }

  // Valor del contexto
  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateProfile,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}