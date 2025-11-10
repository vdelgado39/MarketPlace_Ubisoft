import api from './api'
import authService from './authService'

export const skinService = {
  // ===== CREAR NUEVA SKIN =====
  createSkin: async (skinData) => {
    try {
      const formData = new FormData()
      
      // Agregar todos los campos de texto
      formData.append('nombre', skinData.nombre)
      formData.append('descripcion', skinData.descripcion)
      formData.append('precio', skinData.precio)
      formData.append('categoria', skinData.categoria)
      formData.append('juegoId', skinData.juego.id)
      
      // Agregar archivo de imagen
      if (skinData.archivo) {
        formData.append('imagen', skinData.archivo)
      }

      const response = await api.post('/skins', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return {
        success: true,
        data: response.data,
        message: 'Skin creada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear skin',
        details: error.response?.data
      }
    }
  },

  // ===== OBTENER TODAS LAS SKINS (MARKETPLACE) =====
  getAllSkins: async (filtros = {}) => {
    try {
      const params = new URLSearchParams()
      
      // Agregar filtros si existen
      if (filtros.juego && filtros.juego !== '') {
        params.append('juego', filtros.juego)
      }
      if (filtros.categoria && filtros.categoria !== '') {
        params.append('categoria', filtros.categoria)
      }
      if (filtros.busqueda && filtros.busqueda !== '') {
        params.append('busqueda', filtros.busqueda)
      }
      if (filtros.precioMin) {
        params.append('precioMin', filtros.precioMin)
      }
      if (filtros.precioMax) {
        params.append('precioMax', filtros.precioMax)
      }

      const url = params.toString() ? `/skins?${params}` : '/skins'
      const response = await api.get(url)

      return {
        success: true,
        data: response.data,
        message: 'Skins cargadas exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar skins',
        data: []
      }
    }
  },

  // ===== OBTENER MIS SKINS =====
  getMySkins: async () => {
    try {
      const response = await api.get('/skins/my-skins')
      
      return {
        success: true,
        data: response.data,
        message: 'Tus skins cargadas exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar tus skins',
        data: []
      }
    }
  },

  // ===== OBTENER SKIN POR ID =====
  getSkinById: async (skinId) => {
    try {
      const response = await api.get(`/skins/${skinId}`)
      
      return {
        success: true,
        data: response.data,
        message: 'Skin cargada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar skin',
        data: null
      }
    }
  },

  // ===== ACTUALIZAR SKIN =====
  updateSkin: async (skinId, skinData) => {
    try {
      const formData = new FormData()
      
      // Agregar campos actualizados
      if (skinData.nombre) formData.append('nombre', skinData.nombre)
      if (skinData.descripcion) formData.append('descripcion', skinData.descripcion)
      if (skinData.precio) formData.append('precio', skinData.precio)
      if (skinData.categoria) formData.append('categoria', skinData.categoria)
      
      // Agregar nueva imagen si existe
      if (skinData.archivo) {
        formData.append('imagen', skinData.archivo)
      }

      const response = await api.put(`/skins/${skinId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return {
        success: true,
        data: response.data,
        message: 'Skin actualizada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar skin'
      }
    }
  },

  // ===== ELIMINAR SKIN =====
  deleteSkin: async (skinId) => {
    try {
      await api.delete(`/skins/${skinId}`)
      
      return {
        success: true,
        message: 'Skin eliminada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar skin'
      }
    }
  },

  // ===== COMPRAR SKIN =====
  purchaseSkin: async (skinId) => {
    try {
      const response = await api.post(`/marketplace/purchase/${skinId}`)
      
      return {
        success: true,
        data: response.data,
        message: 'Skin comprada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al comprar skin'
      }
    }
  },

  // ===== OBTENER SKINS DESTACADAS =====
  getFeaturedSkins: async () => {
    try {
      const response = await api.get('/marketplace/featured')
      
      return {
        success: true,
        data: response.data,
        message: 'Skins destacadas cargadas'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar skins destacadas',
        data: []
      }
    }
  },

  // ===== OBTENER COMENTARIOS DE UNA SKIN =====
  getComments: async (skinId) => {
    try {
      const response = await api.get(`/skins/${skinId}/comments`)
      
      return {
        success: true,
        data: response.data,
        message: 'Comentarios cargados exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al cargar comentarios',
        data: []
      }
    }
  },

  // ===== AGREGAR COMENTARIO A UNA SKIN =====
  addComment: async (skinId, commentText) => {
    try {
      const response = await api.post(`/skins/${skinId}/comments`, {
        text: commentText
      })
      
      return {
        success: true,
        data: response.data,
        message: 'Comentario agregado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al agregar comentario'
      }
    }
  },

  // ===== ELIMINAR COMENTARIO =====
  deleteComment: async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`)
      
      return {
        success: true,
        message: 'Comentario eliminado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar comentario'
      }
    }
  }
}

// ===== SIMULACIÓN DE API (PARA DESARROLLO) =====
// Esta función simula respuestas de la API cuando no tienes backend
export const mockSkinService = {
  // Datos de ejemplo en memoria
  skinsData: [],
  nextId: 1,

  createSkin: async (skinData) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newSkin = {
      id: mockSkinService.nextId++,
      ...skinData,
      fechaCreacion: new Date().toISOString(),
      compras: 0,
      rating: 0,
      status: 'approved',
      creadorId: null // Se asignará si hay usuario autenticado
    }
    
    // Obtener usuario actual y agregar ID del creador
    const userId = localStorage.getItem('user_id')
    console.log('🔍 Usuario ID del localStorage:', userId)
    
    if (userId) {
      newSkin.creadorId = parseInt(userId)
      
      // Agregar skin a la lista de skins subidas del usuario
      console.log('📤 Agregando skin al usuario...', parseInt(userId), newSkin.id)
      authService.addSkinSubida(parseInt(userId), newSkin.id)
    } else {
      console.log('⚠️ No hay usuario autenticado')
    }
    
    mockSkinService.skinsData.push(newSkin)
    console.log('✅ Skin creada:', newSkin.id, 'Total skins:', mockSkinService.skinsData.length)
    
    return {
      success: true,
      data: newSkin,
      message: 'Skin creada exitosamente (simulado)'
    }
  },

  getAllSkins: async (filtros = {}) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let filteredSkins = [...mockSkinService.skinsData]
    
    // Aplicar filtros
    if (filtros.juego && filtros.juego !== '') {
      filteredSkins = filteredSkins.filter(skin => 
        skin.juego.id === filtros.juego
      )
    }
    
    if (filtros.categoria && filtros.categoria !== '') {
      filteredSkins = filteredSkins.filter(skin => 
        skin.categoria === filtros.categoria
      )
    }
    
    if (filtros.busqueda && filtros.busqueda !== '') {
      filteredSkins = filteredSkins.filter(skin => 
        skin.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        skin.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())
      )
    }
    
    return {
      success: true,
      data: filteredSkins,
      message: `${filteredSkins.length} skins encontradas (simulado)`
    }
  },

  getMySkins: async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Obtener usuario actual
    const userId = localStorage.getItem('user_id')
    
    if (!userId) {
      return {
        success: false,
        error: 'Debes iniciar sesión',
        data: []
      }
    }
    
    // Filtrar solo las skins del usuario actual
    const misSkinsReales = mockSkinService.skinsData.filter(skin => 
      skin.creadorId === parseInt(userId)
    )
    
    console.log('🔑 getMySkins - Usuario:', userId, 'Skins encontradas:', misSkinsReales.length)
    
    return {
      success: true,
      data: misSkinsReales,
      message: 'Tus skins cargadas (simulado)'
    }
  },

  // ===== NUEVA FUNCIÓN: OBTENER SKIN POR ID =====
  getSkinById: async (skinId) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Buscar la skin por ID
    const skin = mockSkinService.skinsData.find(s => s.id === parseInt(skinId))
    
    if (skin) {
      return {
        success: true,
        data: skin,
        message: 'Skin encontrada (simulado)'
      }
    } else {
      return {
        success: false,
        error: 'Skin no encontrada',
        data: null
      }
    }
  },

  // ===== ACTUALIZAR SKIN =====
  updateSkin: async (skinId, skinData) => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const index = mockSkinService.skinsData.findIndex(s => s.id === parseInt(skinId))
    
    if (index !== -1) {
      // Actualizar la skin manteniendo datos que no se modificaron
      mockSkinService.skinsData[index] = {
        ...mockSkinService.skinsData[index],
        nombre: skinData.nombre,
        descripcion: skinData.descripcion,
        precio: skinData.precio,
        categoria: skinData.categoria,
        ...(skinData.archivo && { archivo: skinData.archivo })
      }
      
      return {
        success: true,
        data: mockSkinService.skinsData[index],
        message: 'Skin actualizada exitosamente (simulado)'
      }
    } else {
      return {
        success: false,
        error: 'Skin no encontrada'
      }
    }
  },

  // ===== ELIMINAR SKIN =====
  deleteSkin: async (skinId) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const index = mockSkinService.skinsData.findIndex(s => s.id === parseInt(skinId))
    
    if (index !== -1) {
      const skin = mockSkinService.skinsData[index]
      
      // Remover de la lista de skins subidas del usuario
      const userId = localStorage.getItem('user_id')
      if (userId && skin.creadorId === parseInt(userId)) {
        authService.removeSkinSubida(parseInt(userId), parseInt(skinId))
      }
      
      mockSkinService.skinsData.splice(index, 1)
      
      return {
        success: true,
        message: 'Skin eliminada exitosamente (simulado)'
      }
    } else {
      return {
        success: false,
        error: 'Skin no encontrada'
      }
    }
  },

  // ===== COMPRAR SKIN =====
  purchaseSkin: async (skinId) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const skin = mockSkinService.skinsData.find(s => s.id === parseInt(skinId))
    
    if (!skin) {
      return {
        success: false,
        error: 'Skin no encontrada'
      }
    }
    
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      return {
        success: false,
        error: 'Debes iniciar sesión para comprar'
      }
    }
    
    // Agregar skin a la lista de compradas del usuario
    authService.addSkinComprada(parseInt(userId), parseInt(skinId))
    
    // Incrementar contador de compras de la skin
    skin.compras = (skin.compras || 0) + 1
    
    return {
      success: true,
      data: skin,
      message: 'Skin comprada exitosamente (simulado)'
    }
  },

  // ===== DESCARGAR SKIN =====
  downloadSkin: async (skinId) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const skin = mockSkinService.skinsData.find(s => s.id === parseInt(skinId))
    
    if (!skin) {
      return {
        success: false,
        error: 'Skin no encontrada'
      }
    }
    
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      return {
        success: false,
        error: 'Debes iniciar sesión para descargar'
      }
    }
    
    // Agregar skin a la lista de descargadas del usuario
    authService.addSkinDescargada(parseInt(userId), parseInt(skinId))
    
    return {
      success: true,
      data: skin,
      message: 'Skin descargada exitosamente (simulado)'
    }
  },

  // ===== OBTENER COMENTARIOS DE UNA SKIN =====
  getComments: async (skinId) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Obtener comentarios del localStorage
    const allComments = JSON.parse(localStorage.getItem('skin_comments') || '[]')
    const skinComments = allComments.filter(c => c.skinId === parseInt(skinId))
    
    // Ordenar por fecha (más recientes primero)
    skinComments.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    
    return {
      success: true,
      data: skinComments,
      message: 'Comentarios cargados exitosamente'
    }
  },

  // ===== AGREGAR COMENTARIO A UNA SKIN =====
  addComment: async (skinId, commentText) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      return {
        success: false,
        error: 'Debes iniciar sesión para comentar'
      }
    }

    // Obtener datos del usuario del localStorage
    const allUsers = JSON.parse(localStorage.getItem('mock_users') || '[]')
    const currentUser = allUsers.find(u => u.id === parseInt(userId))
    
    // Crear nuevo comentario
    const newComment = {
      id: Date.now(), // ID único basado en timestamp
      skinId: parseInt(skinId),
      userId: parseInt(userId),
      username: currentUser?.username || 'Usuario',
      avatar: currentUser?.avatar || '👤',
      text: commentText,
      fecha: new Date().toISOString(),
      likes: 0
    }
    
    // Obtener comentarios existentes
    const allComments = JSON.parse(localStorage.getItem('skin_comments') || '[]')
    allComments.push(newComment)
    
    // Guardar en localStorage
    localStorage.setItem('skin_comments', JSON.stringify(allComments))
    
    return {
      success: true,
      data: newComment,
      message: 'Comentario agregado exitosamente'
    }
  },

  // ===== ELIMINAR COMENTARIO =====
  deleteComment: async (commentId) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      return {
        success: false,
        error: 'Debes iniciar sesión'
      }
    }
    
    // Obtener comentarios
    const allComments = JSON.parse(localStorage.getItem('skin_comments') || '[]')
    const comment = allComments.find(c => c.id === commentId)
    
    if (!comment) {
      return {
        success: false,
        error: 'Comentario no encontrado'
      }
    }
    
    // Verificar que el usuario sea el dueño del comentario
    if (comment.userId !== parseInt(userId)) {
      return {
        success: false,
        error: 'No tienes permiso para eliminar este comentario'
      }
    }
    
    // Filtrar comentario eliminado
    const updatedComments = allComments.filter(c => c.id !== commentId)
    localStorage.setItem('skin_comments', JSON.stringify(updatedComments))
    
    return {
      success: true,
      message: 'Comentario eliminado exitosamente'
    }
  }
}

// Exportar servicio mock por defecto para desarrollo
export default process.env.NODE_ENV === 'development' ? mockSkinService : skinService