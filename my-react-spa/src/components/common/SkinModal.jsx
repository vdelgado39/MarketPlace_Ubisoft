import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import './SkinModal.css'

function SkinModal({ skinId, onClose, onComprar }) {
  const { user, isAuthenticated } = useAuth() // Obtener usuario actual
  const navigate = useNavigate()
  const [skinDetalle, setSkinDetalle] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [cargandoComentarios, setCargandoComentarios] = useState(false)
  const [enviandoComentario, setEnviandoComentario] = useState(false)

  // Hook para cargar detalles de la skin desde la API
  const { data: skinData, loading, error, execute: cargarSkinDetalle } = useApi(
    async (id) => {
      const { default: skinService } = await import('../../services/skinService')
      return await skinService.getSkinById(id)
    },
    [skinId]
  )

  // Cargar detalles y comentarios al montar el componente
  useEffect(() => {
    if (skinId) {
      cargarSkinDetalle(skinId)
      cargarComentarios()
    }
  }, [skinId])

  // Actualizar estado local cuando llegan los datos
  useEffect(() => {
    if (skinData) {
      setSkinDetalle(skinData)
    }
  }, [skinData])

  // Cargar comentarios de la skin
  const cargarComentarios = async () => {
    setCargandoComentarios(true)
    try {
      const { default: skinService } = await import('../../services/skinService')
      const result = await skinService.getComments(skinId)
      
      if (result.success) {
        setComentarios(result.data)
      }
    } catch (error) {
      console.error('Error al cargar comentarios:', error)
    } finally {
      setCargandoComentarios(false)
    }
  }

  // Enviar nuevo comentario
  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) {
      alert('⚠️ El comentario no puede estar vacío')
      return
    }

    if (!isAuthenticated) {
      alert('⚠️ Debes iniciar sesión para comentar')
      return
    }

    setEnviandoComentario(true)
    try {
      const { default: skinService } = await import('../../services/skinService')
      const result = await skinService.addComment(skinId, nuevoComentario)
      
      if (result.success) {
        // Agregar el nuevo comentario a la lista
        setComentarios([result.data, ...comentarios])
        setNuevoComentario('') // Limpiar el campo
      } else {
        alert(`⚠️ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error al enviar comentario')
      console.error(error)
    } finally {
      setEnviandoComentario(false)
    }
  }

  // Eliminar comentario
  const handleEliminarComentario = async (commentId) => {
    if (!window.confirm('¿Estás seguro de eliminar este comentario?')) {
      return
    }

    try {
      const { default: skinService } = await import('../../services/skinService')
      const result = await skinService.deleteComment(commentId)
      
      if (result.success) {
        // Remover comentario de la lista
        setComentarios(comentarios.filter(c => c.id !== commentId))
      } else {
        alert(`⚠️ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error al eliminar comentario')
      console.error(error)
    }
  }

  // Cerrar modal
  const handleClose = () => {
    onClose()
  }

  // Manejar compra
  const handleComprar = async () => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      if (window.confirm('🔒 Debes iniciar sesión para comprar esta skin. ¿Deseas ir al login?')) {
        handleClose()
        navigate('/login')
      }
      return
    }

    if (skinDetalle && onComprar) {
      try {
        const { default: skinService } = await import('../../services/skinService')
        const result = await skinService.purchaseSkin(skinDetalle.id)
        
        if (result.success) {
          alert(`🎉 ¡Has comprado "${skinDetalle.nombre}" por ${skinDetalle.precio}!`)
          onComprar(skinDetalle)
        } else {
          alert(`❌ Error al comprar: ${result.error}`)
        }
      } catch (error) {
        alert('❌ Error al procesar la compra')
      }
    }
  }

  // Manejar redirección a login
  const handleIrALogin = () => {
    handleClose()
    navigate('/login')
  }

  // Manejar redirección a registro
  const handleIrARegistro = () => {
    handleClose()
    navigate('/register')
  }

  // Cerrar modal al hacer clic en el overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Obtener información del juego
  const getJuegoInfo = (skin) => {
    const juegos = [
      { id: 'assassins-creed', nombre: "Assassin's Creed", imagen: '🥷' },
      { id: 'for-honor', nombre: 'For Honor', imagen: '⚔️' },
      { id: 'rainbow-six', nombre: 'Rainbow Six Siege', imagen: '🔫' },
      { id: 'far-cry', nombre: 'Far Cry', imagen: '🏔️' },
      { id: 'watch-dogs', nombre: 'Watch Dogs', imagen: '💻' },
      { id: 'the-division', nombre: 'The Division', imagen: '🌆' }
    ]

    const juegoId = skin.juego?.id || skin.juegoId
    const juego = juegos.find(j => j.id === juegoId)
    return juego || { nombre: 'Juego desconocido', imagen: '🎮' }
  }

  // Obtener label de categoría
  const getCategoriaLabel = (categoria) => {
    const categorias = [
      { value: 'armas', label: '⚔️ Armas' },
      { value: 'personajes', label: '🧙‍♂️ Personajes' },
      { value: 'vehiculos', label: '🚗 Vehículos' },
      { value: 'accesorios', label: '👑 Accesorios' },
      { value: 'efectos', label: '✨ Efectos Especiales' },
      { value: 'otros', label: '📦 Otros' }
    ]

    const cat = categorias.find(c => c.value === categoria)
    return cat ? cat.label : '📦 Otros'
  }

  // Formatear fecha
  const formatearFecha = (fecha) => {
    const date = new Date(fecha)
    const ahora = new Date()
    const diferencia = ahora - date
    const minutos = Math.floor(diferencia / 60000)
    const horas = Math.floor(diferencia / 3600000)
    const dias = Math.floor(diferencia / 86400000)

    if (minutos < 1) return 'Hace un momento'
    if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`
    if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`
    if (dias < 30) return `Hace ${dias} día${dias !== 1 ? 's' : ''}`
    
    return date.toLocaleDateString()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container modal-container-large">
        {/* Header del modal */}
        <div className="modal-header">
          <h2>📋 Detalles de la Skin</h2>
          <button className="modal-close-button" onClick={handleClose}>
            ✖️
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-content">
          {loading ? (
            <div className="modal-loading">
              <div className="loading-spinner">⏳</div>
              <p>Cargando detalles de la skin...</p>
            </div>
          ) : error ? (
            <div className="modal-error">
              <p>❌ Error al cargar la skin: {error}</p>
              <button 
                className="retry-button-modal"
                onClick={() => cargarSkinDetalle(skinId)}
              >
                🔄 Reintentar
              </button>
            </div>
          ) : skinDetalle ? (
            <div className="modal-layout">
              {/* Columna izquierda: Información de la skin */}
              <div className="skin-detail-content">
                {/* Imagen principal */}
                <div className="skin-image-section">
                  <div className="skin-image-container">
                    {skinDetalle.archivo ? (
                      <img 
                        src={skinDetalle.archivo instanceof File ? 
                             URL.createObjectURL(skinDetalle.archivo) : 
                             skinDetalle.imagen_url} 
                        alt={skinDetalle.nombre}
                        className="skin-image-large"
                      />
                    ) : (
                      <div className="skin-placeholder-large">
                        <span>🎭</span>
                        <p>Sin imagen</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de la skin */}
                <div className="skin-info-section">
                  {/* Nombre principal */}
                  <h3 className="skin-name">{skinDetalle.nombre}</h3>

                  {/* Información del juego */}
                  <div className="skin-game-info-modal">
                    <span className="game-icon-modal">{getJuegoInfo(skinDetalle).imagen}</span>
                    <span className="game-name-modal">{getJuegoInfo(skinDetalle).nombre}</span>
                  </div>

                  {/* Categoría */}
                  <div className="skin-category-info">
                    <span className="category-label">Categoría:</span>
                    <span className="category-value">{getCategoriaLabel(skinDetalle.categoria)}</span>
                  </div>

                  {/* Descripción */}
                  <div className="skin-description-section">
                    <h4>📝 Descripción</h4>
                    <p className="skin-description-text">{skinDetalle.descripcion}</p>
                  </div>

                  {/* Precio */}
                  <div className="skin-price-section">
                    <div className="price-container">
                      <span className="price-label">Precio:</span>
                      <span className="price-value">💰 ${skinDetalle.precio}</span>
                    </div>
                  </div>

                  {/* Banner para usuarios no autenticados */}
                  {!isAuthenticated && (
                    <div className="modal-auth-banner">
                      <p>🔒 <strong>Inicia sesión para comprar esta skin</strong></p>
                      <div className="modal-auth-buttons">
                        <button 
                          className="modal-auth-button login"
                          onClick={handleIrALogin}
                        >
                          🔑 Iniciar Sesión
                        </button>
                        <button 
                          className="modal-auth-button register"
                          onClick={handleIrARegistro}
                        >
                          📝 Registrarse
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="skin-metadata">
                    {skinDetalle.fechaCreacion && (
                      <div className="metadata-item">
                        <span className="metadata-label">📅 Fecha de creación:</span>
                        <span className="metadata-value">
                          {new Date(skinDetalle.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {skinDetalle.compras !== undefined && (
                      <div className="metadata-item">
                        <span className="metadata-label">🛒 Compras:</span>
                        <span className="metadata-value">{skinDetalle.compras || 0}</span>
                      </div>
                    )}

                    {skinDetalle.rating !== undefined && (
                      <div className="metadata-item">
                        <span className="metadata-label">⭐ Rating:</span>
                        <span className="metadata-value">
                          {skinDetalle.rating ? `${skinDetalle.rating}/5` : 'Sin calificar'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna derecha: Sección de comentarios */}
              <div className="comments-section">
                <div className="comments-header">
                  <h4>💬 Comentarios ({comentarios.length})</h4>
                </div>

                {/* Campo para nuevo comentario (solo si está autenticado) */}
                {isAuthenticated ? (
                  <div className="new-comment-section">
                    <div className="comment-user-info">
                      <span className="user-avatar">{user?.avatar || '👤'}</span>
                      <span className="user-name">{user?.username || 'Usuario'}</span>
                    </div>
                    <textarea
                      className="comment-input"
                      placeholder="Escribe tu comentario aquí..."
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      disabled={enviandoComentario}
                      rows={3}
                    />
                    <button 
                      className="send-comment-button"
                      onClick={handleEnviarComentario}
                      disabled={enviandoComentario || !nuevoComentario.trim()}
                    >
                      {enviandoComentario ? '⏳ Enviando...' : '📤 Enviar Comentario'}
                    </button>
                  </div>
                ) : (
                  <div className="login-prompt">
                    <p>
                      🔒 
                      <button 
                        onClick={handleIrALogin}
                        className="inline-auth-link"
                      >
                        Inicia sesión
                      </button>
                      {' '}o{' '}
                      <button 
                        onClick={handleIrARegistro}
                        className="inline-auth-link"
                      >
                        regístrate
                      </button>
                      {' '}para dejar un comentario
                    </p>
                  </div>
                )}

                {/* Lista de comentarios */}
                <div className="comments-list">
                  {cargandoComentarios ? (
                    <div className="loading-comments">
                      <span>⏳</span>
                      <p>Cargando comentarios...</p>
                    </div>
                  ) : comentarios.length === 0 ? (
                    <div className="no-comments">
                      <span>💭</span>
                      <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                    </div>
                  ) : (
                    comentarios.map(comentario => (
                      <div key={comentario.id} className="comment-item">
                        <div className="comment-header">
                          <div className="comment-author">
                            <span className="comment-avatar">{comentario.avatar}</span>
                            <span className="comment-username">{comentario.username}</span>
                            <span className="comment-date">{formatearFecha(comentario.fecha)}</span>
                          </div>
                          {/* Botón eliminar (solo para el dueño del comentario) */}
                          {isAuthenticated && user?.id === comentario.userId && (
                            <button 
                              className="delete-comment-button"
                              onClick={() => handleEliminarComentario(comentario.id)}
                              title="Eliminar comentario"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        <div className="comment-content">
                          <p>{comentario.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="modal-no-data">
              <p>❓ No se encontraron detalles para esta skin</p>
            </div>
          )}
        </div>

        {/* Footer con botones de acción */}
        {skinDetalle && !loading && !error && (
          <div className="modal-footer">
            <button 
              className="cancel-button-modal"
              onClick={handleClose}
            >
              ❌ Cerrar
            </button>
            <button 
              className={`buy-button-modal ${!isAuthenticated ? 'disabled' : ''}`}
              onClick={handleComprar}
              disabled={!isAuthenticated}
              title={!isAuthenticated ? 'Inicia sesión para comprar' : `Comprar por $${skinDetalle.precio}`}
            >
              {isAuthenticated 
                ? `💳 Comprar por $${skinDetalle.precio}` 
                : '🔒 Requiere Iniciar Sesión'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SkinModal