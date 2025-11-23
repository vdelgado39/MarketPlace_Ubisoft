// EliminarSkinsModal.jsx

import { useState } from 'react'
import './EliminarSkinsModal.css'

function EliminarSkinsModal({ skins, onClose, onEliminar }) {
  const [skinsSeleccionadas, setSkinsSeleccionadas] = useState([])
  const [eliminando, setEliminando] = useState(false)

  // ✅ Manejar selección individual usando _id de MongoDB
  const handleCheckboxChange = (skinId) => {
    setSkinsSeleccionadas(prev => {
      if (prev.includes(skinId)) {
        // Si ya está seleccionada, la removemos
        return prev.filter(id => id !== skinId)
      } else {
        // Si no está seleccionada, la agregamos
        return [...prev, skinId]
      }
    })
  }

  // ✅ Seleccionar todas usando _id de MongoDB
  const seleccionarTodas = () => {
    if (skinsSeleccionadas.length === skins.length) {
      // Si todas están seleccionadas, deseleccionar todas
      setSkinsSeleccionadas([])
    } else {
      // Seleccionar todas usando _id de MongoDB
      setSkinsSeleccionadas(skins.map(skin => skin._id || skin.id))
    }
  }

  // Manejar eliminación
  const handleEliminar = async () => {
    if (skinsSeleccionadas.length === 0) {
      alert('⚠️ Selecciona al menos una skin para eliminar')
      return
    }

    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres eliminar ${skinsSeleccionadas.length} skin${skinsSeleccionadas.length !== 1 ? 's' : ''}?\n\nEsta acción no se puede deshacer.`
    )

    if (!confirmacion) return

    setEliminando(true)

    try {
      console.log('🗑️ Eliminando skins:', skinsSeleccionadas)
      
      // Llamar función de eliminación pasada por props
      await onEliminar(skinsSeleccionadas)
      
      // Cerrar modal
      onClose()
    } catch (error) {
      alert('❌ Error al eliminar skins')
      console.error(error)
    } finally {
      setEliminando(false)
    }
  }

  // Cerrar modal con click en overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !eliminando) {
      onClose()
    }
  }

  return (
    <div className="eliminar-modal-overlay" onClick={handleOverlayClick}>
      <div className="eliminar-modal-container">
        {/* Header */}
        <div className="eliminar-modal-header">
          <h2>🗑️ Eliminar Skins</h2>
          <button 
            className="eliminar-close-button" 
            onClick={onClose}
            disabled={eliminando}
          >
            ✖️
          </button>
        </div>

        {/* Contenido */}
        <div className="eliminar-modal-content">
          {/* Información */}
          <div className="eliminar-info">
            <p>Selecciona las skins que deseas eliminar de tu colección:</p>
            <div className="eliminar-stats">
              <span className="stat-item">
                📦 Total: <strong>{skins.length}</strong>
              </span>
              <span className="stat-item">
                ✅ Seleccionadas: <strong>{skinsSeleccionadas.length}</strong>
              </span>
            </div>
          </div>

          {/* Botón seleccionar todas */}
          <div className="select-all-section">
            <label className="checkbox-label select-all-label">
              <input
                type="checkbox"
                checked={skinsSeleccionadas.length === skins.length && skins.length > 0}
                onChange={seleccionarTodas}
                className="checkbox-input"
                disabled={eliminando}
              />
              <span className="checkbox-text">
                {skinsSeleccionadas.length === skins.length && skins.length > 0
                  ? 'Deseleccionar todas'
                  : 'Seleccionar todas'}
              </span>
            </label>
          </div>

          {/* ✅ Lista de skins usando _id de MongoDB */}
          <div className="skins-list">
            {skins.length === 0 ? (
              <div className="no-skins-message">
                <p>No hay skins para eliminar</p>
              </div>
            ) : (
              skins.map(skin => {
                const skinId = skin._id || skin.id
                return (
                  <div 
                    key={skinId} 
                    className={`skin-item ${skinsSeleccionadas.includes(skinId) ? 'selected' : ''}`}
                  >
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={skinsSeleccionadas.includes(skinId)}
                        onChange={() => handleCheckboxChange(skinId)}
                        className="checkbox-input"
                        disabled={eliminando}
                      />
                      <div className="skin-item-info">
                        <div className="skin-item-header">
                          <span className="skin-item-icon">
                            {skin.juego?.imagen || 
                             skin.juegoId === 'assassins-creed' ? '🥷' : 
                             skin.juegoId === 'for-honor' ? '⚔️' : 
                             skin.juegoId === 'rainbow-six' ? '🔫' : 
                             skin.juegoId === 'far-cry' ? '🏔️' : 
                             skin.juegoId === 'watch-dogs' ? '💻' : 
                             skin.juegoId === 'the-division' ? '🌆' : '🎮'}
                          </span>
                          <span className="skin-item-name">{skin.nombre}</span>
                        </div>
                        <div className="skin-item-details">
                          <span className="skin-item-price">
                            {skin.precio === 0 ? '🆓 GRATIS' : `💰 $${skin.precio}`}
                          </span>
                          <span className="skin-item-category">📂 {skin.categoria}</span>
                        </div>
                      </div>
                    </label>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="eliminar-modal-footer">
          <button 
            className="eliminar-cancel-button"
            onClick={onClose}
            disabled={eliminando}
          >
            ❌ Cancelar
          </button>
          <button 
            className="eliminar-confirm-button"
            onClick={handleEliminar}
            disabled={skinsSeleccionadas.length === 0 || eliminando}
          >
            {eliminando 
              ? '⏳ Eliminando...' 
              : `🗑️ Eliminar ${skinsSeleccionadas.length > 0 ? `(${skinsSeleccionadas.length})` : ''}`
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default EliminarSkinsModal