import { useState, useEffect, useCallback } from 'react'

// Hook para manejar llamadas a la API con estados de loading, error y data
export function useApi(apiFunction, dependencies = [], options = {}) {
  const [data, setData] = useState(options.initialData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await apiFunction(...args)
      
      if (result.success) {
        setData(result.data)
        return result
      } else {
        setError(result.error)
        return result
      }
    } catch (err) {
      const errorMessage = err.message || 'Error inesperado'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, dependencies)

  // Auto-ejecutar si se especifica
  useEffect(() => {
    if (options.executeOnMount) {
      execute()
    }
  }, [execute, options.executeOnMount])

  return {
    data,
    loading,
    error,
    execute,
    setData,
    clearError: () => setError(null)
  }
}

// Hook específico para cargar skins con filtros
export function useSkins(filtros = {}, autoLoad = true) {
  const [skins, setSkins] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const cargarSkins = useCallback(async (nuevosFiltros = filtros) => {
    try {
      setLoading(true)
      setError(null)
      
      // Importar dinámicamente el servicio
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.getAllSkins(nuevosFiltros)
      
      if (result.success) {
        setSkins(result.data)
      } else {
        setError(result.error)
        setSkins([])
      }
      
      return result
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar skins'
      setError(errorMessage)
      setSkins([])
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar automáticamente cuando cambian los filtros
  useEffect(() => {
    if (autoLoad) {
      cargarSkins(filtros)
    }
  }, [JSON.stringify(filtros), autoLoad, cargarSkins])

  return {
    skins,
    loading,
    error,
    cargarSkins,
    setSkins,
    clearError: () => setError(null)
  }
}

// Hook para crear skins
export function useCreateSkin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const crearSkin = useCallback(async (skinData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.createSkin(skinData)
      
      if (result.success) {
        setSuccess(true)
        return result
      } else {
        setError(result.error)
        return result
      }
    } catch (err) {
      const errorMessage = err.message || 'Error al crear skin'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    crearSkin,
    loading,
    error,
    success,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  }
}
