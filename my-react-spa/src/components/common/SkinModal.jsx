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

  // ✅ VALIDAR skinId al inicio
  useEffect(() => {
    console.log('🔍 SkinModal recibió skinId:', skinId)
    console.log('🔍 Tipo de skinId:', typeof skinId)
    console.log('🔍 ¿Es válido?:', Boolean(skinId))
  }, [skinId])

  // ✅ CORREGIDO: Hook para cargar detalles de la skin desde la API
  const { data: skinData, loading, error, execute: cargarSkinDetalle } = useApi(
    async (id) => {
      console.log('🚀 useApi ejecutando getSkinById con ID:', id)
      const { default: skinService } = await import('../../services/skinService')
      const result = await skinService.getSkinById(id)
      console.log('📥 Respuesta de getSkinById:', result)
      
      // ✅ IMPORTANTE: Retornar el objeto completo {success, data}
      // El hook useApi espera este formato para extraer result.data
      return result
    },
    [skinId]
  )

  // Cargar detalles y comentarios al montar el componente
  useEffect(() => {
    if (skinId) {
      console.log('🔍 Cargando skin con ID:', skinId)
      cargarSkinDetalle(skinId)
      cargarComentarios()
    }
  }, [skinId])

  // Actualizar estado local cuando llegan los datos
  useEffect(() => {
    console.log('🔄 useEffect disparado. skinData:', skinData)
    console.log('🔄 Tipo de skinData:', typeof skinData)
    console.log('🔄 ¿skinData existe?:', !!skinData)
    
    if (skinData) {
      console.log('✅ Actualizando skinDetalle con:', skinData)
      setSkinDetalle(skinData)
    } else {
      console.log('⚠️ skinData es null/undefined')
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
        // ✅ USAR EL ID CORRECTO (_id en lugar de id)
        const skinIdToUse = skinDetalle._id || skinDetalle.id
        const result = await skinService.purchaseSkin(skinIdToUse)
        
        if (result.success) {
          alert(`🎉 ¡Has comprado "${skinDetalle.nombre}" por $${skinDetalle.precio}!`)
          onComprar(skinDetalle)
        } else {
          alert(`❌ Error al comprar: ${result.error}`)
        }
      } catch (error) {
        alert('❌ Error al procesar la compra')
        console.error(error)
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

  // ✅ ACTUALIZADO: Obtener label de categoría con las nuevas categorías
  const getCategoriaLabel = (categoria) => {
    const categorias = [
      { value: 'Arma', label: '⚔️ Arma' },
      { value: 'Personaje', label: '🧙‍♂️ Personaje' },
      { value: 'Vehiculo', label: '🚗 Vehículo' },
      { value: 'Objeto', label: '👑 Objeto' },
      { value: 'Otro', label: '📦 Otro' }
    ]

    const cat = categorias.find(c => c.value === categoria)
    return cat ? cat.label : '📦 Otro'
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
                    {/* ✅ ACTUALIZADO: Manejo de imagen mejorado */}
                    {skinDetalle.imagen || skinDetalle.urlArchivo ? (
                      <img 
                        src={skinDetalle.imagen || skinDetalle.urlArchivo || 'https://via.placeholder.com/400x300?text=Sin+Imagen'} 
                        alt={skinDetalle.nombre}
                        className="skin-image-large"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+No+Disponible'
                        }}
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

                  {/* Información del juego (si existe) */}
                  {skinDetalle.juego && (
                    <div className="skin-game-info-modal">
                      <span className="game-icon-modal">{getJuegoInfo(skinDetalle).imagen}</span>
                      <span className="game-name-modal">{getJuegoInfo(skinDetalle).nombre}</span>
                    </div>
                  )}

                  {/* Categoría */}
                  <div className="skin-category-info">
                    <span className="category-label">Categoría:</span>
                    <span className="category-value">{getCategoriaLabel(skinDetalle.categoria)}</span>
                  </div>

                  {/* Descripción */}
                  <div className="skin-description-section">
                    <h4>📝 Descripción</h4>
                    <p className="skin-description-text">
                      {skinDetalle.descripcion || 'Sin descripción disponible'}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="skin-price-section">
                    <div className="price-container">
                      <span className="price-label">Precio:</span>
                      <span className="price-value">
                        {skinDetalle.precio === 0 ? '🆓 GRATIS' : `💰 $${skinDetalle.precio}`}
                      </span>
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

                    {skinDetalle.descargas !== undefined && (
                      <div className="metadata-item">
                        <span className="metadata-label">📥 Descargas:</span>
                        <span className="metadata-value">{skinDetalle.descargas || 0}</span>
                      </div>
                    )}

                    {/* ✅ NUEVO: Mostrar creador */}
                    {skinDetalle.usuarioCreador && (
                      <div className="metadata-item">
                        <span className="metadata-label">👤 Creador:</span>
                        <span className="metadata-value">
                          {skinDetalle.usuarioCreador.username || skinDetalle.usuarioCreador.nombre || 'Anónimo'}
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
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                ID buscado: {skinId || '(vacío)'}
              </p>
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                Tipo: {typeof skinId}
              </p>
              {!skinId && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
                  <p style={{ color: '#856404', margin: 0 }}>
                    ⚠️ <strong>Error:</strong> No se proporcionó un ID de skin válido.
                    <br />
                    Verifica que estás pasando correctamente el ID al abrir el modal.
                  </p>
                </div>
              )}
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
              className={`buy-button-modal ${!isAuthenticated || skinDetalle.precio === 0 ? 'disabled' : ''}`}
              onClick={handleComprar}
              disabled={!isAuthenticated}
              title={!isAuthenticated ? 'Inicia sesión para comprar' : `Comprar por $${skinDetalle.precio}`}
            >
              {!isAuthenticated 
                ? '🔒 Requiere Iniciar Sesión'
                : skinDetalle.precio === 0
                  ? '🆓 GRATIS - Descargar'
                  : `💳 Comprar por $${skinDetalle.precio}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SkinModal