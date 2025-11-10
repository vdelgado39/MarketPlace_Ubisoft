// Simulación de base de datos de usuarios en memoria
const mockUsuarios = []
let nextUserId = 1

// Usuario actual en sesión
let usuarioActual = null

// Función auxiliar para obtener usuario actualizado
const getUpdatedUser = (userId) => {
  return mockUsuarios.find(u => u.id === userId)
}

export const authService = {
  // ===== REGISTRAR NUEVO USUARIO =====
  register: async (userData) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Validar que el email no exista
      const emailExiste = mockUsuarios.find(u => u.email === userData.email)
      if (emailExiste) {
        return {
          success: false,
          error: 'El email ya está registrado'
        }
      }

      // Validar que el username no exista
      const usernameExiste = mockUsuarios.find(u => u.username === userData.username)
      if (usernameExiste) {
        return {
          success: false,
          error: 'El nombre de usuario ya está en uso'
        }
      }

      // Crear nuevo usuario
      const nuevoUsuario = {
        id: nextUserId++,
        username: userData.username,
        email: userData.email,
        password: userData.password, // En producción, esto debería estar hasheado
        nombre: userData.nombre || '',
        avatar: userData.avatar || '👤',
        fechaRegistro: new Date().toISOString(),
        skinsSubidas: [],
        skinsCompradas: [],
        skinsDescargadas: [],
        wallet: 100.00 // Saldo inicial
      }

      mockUsuarios.push(nuevoUsuario)

      return {
        success: true,
        data: { ...nuevoUsuario, password: undefined }, // No devolver password
        message: 'Usuario registrado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al registrar usuario'
      }
    }
  },

  // ===== INICIAR SESIÓN =====
  login: async (credentials) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Buscar usuario por email o username
      const usuario = mockUsuarios.find(
        u => (u.email === credentials.identifier || u.username === credentials.identifier) &&
             u.password === credentials.password
      )

      if (!usuario) {
        return {
          success: false,
          error: 'Credenciales inválidas'
        }
      }

      // Guardar usuario actual
      usuarioActual = usuario

      // Guardar en localStorage
      localStorage.setItem('auth_token', 'mock_token_' + usuario.id)
      localStorage.setItem('user_id', usuario.id)

      return {
        success: true,
        data: { ...usuario, password: undefined },
        token: 'mock_token_' + usuario.id,
        message: 'Inicio de sesión exitoso'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al iniciar sesión'
      }
    }
  },

  // ===== CERRAR SESIÓN =====
  logout: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      usuarioActual = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_id')

      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al cerrar sesión'
      }
    }
  },

  // ===== OBTENER USUARIO ACTUAL =====
  getCurrentUser: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const userId = localStorage.getItem('user_id')
      if (!userId) {
        return {
          success: false,
          error: 'No hay sesión activa',
          data: null
        }
      }

      const usuario = mockUsuarios.find(u => u.id === parseInt(userId))
      if (!usuario) {
        return {
          success: false,
          error: 'Usuario no encontrado',
          data: null
        }
      }

      usuarioActual = usuario

      return {
        success: true,
        data: { ...usuario, password: undefined }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener usuario',
        data: null
      }
    }
  },

  // ===== VERIFICAR SI ESTÁ AUTENTICADO =====
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token')
    return !!token
  },

  // ===== ACTUALIZAR PERFIL =====
  updateProfile: async (userId, profileData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const index = mockUsuarios.findIndex(u => u.id === userId)
      if (index === -1) {
        return {
          success: false,
          error: 'Usuario no encontrado'
        }
      }

      // Actualizar datos permitidos
      mockUsuarios[index] = {
        ...mockUsuarios[index],
        nombre: profileData.nombre || mockUsuarios[index].nombre,
        avatar: profileData.avatar || mockUsuarios[index].avatar
      }

      usuarioActual = mockUsuarios[index]

      return {
        success: true,
        data: { ...mockUsuarios[index], password: undefined },
        message: 'Perfil actualizado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar perfil'
      }
    }
  },

  // ===== AGREGAR SKIN SUBIDA =====
  addSkinSubida: (userId, skinId) => {
    const usuario = mockUsuarios.find(u => u.id === userId)
    if (usuario && !usuario.skinsSubidas.includes(skinId)) {
      usuario.skinsSubidas.push(skinId)
    }
  },

  // ===== REMOVER SKIN SUBIDA =====
  removeSkinSubida: (userId, skinId) => {
    const usuario = mockUsuarios.find(u => u.id === userId)
    if (usuario) {
      usuario.skinsSubidas = usuario.skinsSubidas.filter(id => id !== skinId)
    }
  },

  // ===== AGREGAR SKIN COMPRADA =====
  addSkinComprada: (userId, skinId) => {
    const usuario = mockUsuarios.find(u => u.id === userId)
    if (usuario && !usuario.skinsCompradas.includes(skinId)) {
      usuario.skinsCompradas.push(skinId)
    }
  },

  // ===== AGREGAR SKIN DESCARGADA =====
  addSkinDescargada: (userId, skinId) => {
    const usuario = mockUsuarios.find(u => u.id === userId)
    if (usuario && !usuario.skinsDescargadas.includes(skinId)) {
      usuario.skinsDescargadas.push(skinId)
    }
  },

  // ===== OBTENER ESTADÍSTICAS DEL USUARIO =====
  getUserStats: async (userId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const usuario = mockUsuarios.find(u => u.id === userId)
      if (!usuario) {
        return {
          success: false,
          error: 'Usuario no encontrado',
          data: null
        }
      }

      return {
        success: true,
        data: {
          skinsSubidas: usuario.skinsSubidas.length,
          skinsCompradas: usuario.skinsCompradas.length,
          skinsDescargadas: usuario.skinsDescargadas.length,
          wallet: usuario.wallet
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas',
        data: null
      }
    }
  }
}

export default authService