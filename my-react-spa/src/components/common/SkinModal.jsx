import { useState, useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import './SkinModal.css'

function SkinModal({ skinId, onClose, onComprar }) {
  const [skinDetalle, setSkinDetalle] = useState(null)

  // Hook para cargar detalles de la skin desde la API
  const { data: skinData, loading, error, execute: cargarSkinDetalle } = useApi(
    async (id) => {
      const { default: skinService } = await import('../../services/skinService')
      return await skinService.getSkinById(id)
    },
    [skinId]
  )

  // Cargar detalles al montar el componente
  useEffect(() => {
    if (skinId) {
      cargarSkinDetalle(skinId)
    }
  }, [skinId, cargarSkinDetalle])

  // Actualizar estado local cuando llegan los datos
  useEffect(() => {
    if (skinData) {
      setSkinDetalle(skinData)
    }
  }, [skinData])

  // Cerrar modal
  const handleClose = () => {
    onClose()
  }

  // Manejar compra
  const handleComprar = async () => {
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

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
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
              className="buy-button-modal"
              onClick={handleComprar}
            >
              💳 Comprar por ${skinDetalle.precio}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SkinModal