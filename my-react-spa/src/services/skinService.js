// src/services/skinService.js

import { API_BASE_URL } from './endpoints'
import { httpClient } from './httpService'

const handleResponse = async (response) => {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición')
  }
  return data
}

export const skinService = {
  // ============================================
  // RUTAS PÚBLICAS (No requieren autenticación)
  // ============================================

  // Obtener todas las skins (explorar/marketplace)
  getAllSkins: async (filtros = {}) => {
    try {
      const params = new URLSearchParams()
      
      if (filtros.categoria && filtros.categoria !== '') {
        params.append('categoria', filtros.categoria)
      }
      if (filtros.precioMin) {
        params.append('precioMin', filtros.precioMin)
      }
      if (filtros.precioMax) {
        params.append('precioMax', filtros.precioMax)
      }
      if (filtros.busqueda || filtros.buscar) {
        params.append('buscar', filtros.busqueda || filtros.buscar)
      }
      if (filtros.ordenar) {
        params.append('ordenar', filtros.ordenar)
      }

      const queryString = params.toString()
      const url = queryString 
        ? `${API_BASE_URL}/skins?${queryString}` 
        : `${API_BASE_URL}/skins`

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await handleResponse(response)
      
      return {
        success: true,
        data: result.data,
        total: result.total,
        message: 'Skins cargadas exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al cargar skins',
        data: []
      }
    }
  },

  // Obtener una skin por ID
  getSkinById: async (skinId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/skins/${skinId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await handleResponse(response)
      
      return {
        success: true,
        data: result.data,
        message: 'Skin cargada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al cargar skin',
        data: null
      }
    }
  },

  // ================================================
  // RUTAS PROTEGIDAS (Requieren autenticación)
  // ================================================

  // Crear/Subir una nueva skin (usa httpClient para incluir token automáticamente)
  createSkin: async (skinData) => {
    try {
      // Preparar datos para enviar
      const dataToSend = {
        nombre: skinData.nombre,
        descripcion: skinData.descripcion,
        precio: parseFloat(skinData.precio),
        imagen: skinData.imagen || '',
        categoria: skinData.categoria,
        urlArchivo: skinData.urlArchivo || skinData.archivo || '',
        tags: skinData.tags || []
      }

      const result = await httpClient('/skins', { 
        method: 'POST', 
        body: JSON.stringify(dataToSend) 
      })

      return {
        success: true,
        data: result.data,
        message: 'Skin creada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al crear skin',
        details: error
      }
    }
  },

  // Alias para mantener compatibilidad
  uploadSkin: async (skinData) => {
    return skinService.createSkin(skinData)
  },

  // Comprar una skin
  purchaseSkin: async (skinId) => {
    try {
      const result = await httpClient(`/skins/${skinId}/buy`, { 
        method: 'POST' 
      })

      return {
        success: true,
        data: result.data,
        message: 'Skin comprada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al comprar skin'
      }
    }
  },

  // Alias para mantener compatibilidad
  buySkin: async (skinId) => {
    return skinService.purchaseSkin(skinId)
  },

  // Descargar una skin
  downloadSkin: async (skinId) => {
    try {
      const result = await httpClient(`/skins/${skinId}/download`, { 
        method: 'POST' 
      })

      return {
        success: true,
        data: result.data,
        message: 'Skin lista para descargar'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al descargar skin'
      }
    }
  },

  // Obtener mis skins (subidas, compradas, descargadas)
  getMySkins: async (tipo = null) => {
    try {
      const url = tipo 
        ? `/skins/user/my-skins?tipo=${tipo}` 
        : '/skins/user/my-skins'
      
      const result = await httpClient(url)

      return {
        success: true,
        data: result.data,
        message: 'Tus skins cargadas exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al cargar tus skins',
        data: tipo ? [] : { skinsSubidas: [], skinsCompradas: [], skinsDescargadas: [] }
      }
    }
  },

  // Actualizar una skin (solo el creador)
  updateSkin: async (skinId, skinData) => {
    try {
      const updates = {}
      
      if (skinData.nombre) updates.nombre = skinData.nombre
      if (skinData.descripcion !== undefined) updates.descripcion = skinData.descripcion
      if (skinData.precio) updates.precio = parseFloat(skinData.precio)
      if (skinData.imagen !== undefined) updates.imagen = skinData.imagen
      if (skinData.categoria) updates.categoria = skinData.categoria
      if (skinData.tags) updates.tags = skinData.tags
      if (skinData.activo !== undefined) updates.activo = skinData.activo

      const result = await httpClient(`/skins/${skinId}`, { 
        method: 'PUT', 
        body: JSON.stringify(updates) 
      })

      return {
        success: true,
        data: result.data,
        message: 'Skin actualizada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al actualizar skin'
      }
    }
  },

  // Eliminar una skin (solo el creador)
  deleteSkin: async (skinId) => {
    try {
      const result = await httpClient(`/skins/${skinId}`, { 
        method: 'DELETE' 
      })

      return {
        success: true,
        message: 'Skin eliminada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al eliminar skin'
      }
    }
  },

  // ================================================
  // FUNCIONES AUXILIARES
  // ================================================

  // Verificar si el usuario puede descargar una skin
  canDownloadSkin: (skin, currentUser) => {
    if (!currentUser) return false
    
    const esGratis = skin.precio === 0
    const esCreador = skin.usuarioCreador?._id === currentUser.id || 
                      skin.usuarioCreador === currentUser.id
    const laCompro = currentUser.skinsCompradas?.includes(skin._id)
    
    return esGratis || esCreador || laCompro
  },

  // Verificar si el usuario es el creador de la skin
  isOwner: (skin, currentUser) => {
    if (!currentUser) return false
    return skin.usuarioCreador?._id === currentUser.id || 
           skin.usuarioCreador === currentUser.id
  },

  // Verificar si el usuario ya compró la skin
  alreadyBought: (skin, currentUser) => {
    if (!currentUser) return false
    return currentUser.skinsCompradas?.includes(skin._id)
  },

  // Verificar si el usuario tiene saldo suficiente
  hasEnoughBalance: (skin, currentUser) => {
    if (!currentUser) return false
    return currentUser.wallet >= skin.precio
  },

  // Obtener skins destacadas (usando filtro de más compradas)
  getFeaturedSkins: async () => {
    return skinService.getAllSkins({ ordenar: 'masCompradas' })
  },

  // ================================================
  // COMENTARIOS (Opcional - si quieres implementarlos después)
  // ================================================

  getComments: async (skinId) => {
    try {
      const result = await httpClient(`/skins/${skinId}/comments`)
      
      return {
        success: true,
        data: result.data || [],
        message: 'Comentarios cargados exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al cargar comentarios',
        data: []
      }
    }
  },

  addComment: async (skinId, commentText) => {
    try {
      const result = await httpClient(`/skins/${skinId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText })
      })
      
      return {
        success: true,
        data: result.data,
        message: 'Comentario agregado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al agregar comentario'
      }
    }
  },

  deleteComment: async (commentId) => {
    try {
      const result = await httpClient(`/comments/${commentId}`, {
        method: 'DELETE'
      })
      
      return {
        success: true,
        message: 'Comentario eliminado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al eliminar comentario'
      }
    }
  }
}

export default skinService