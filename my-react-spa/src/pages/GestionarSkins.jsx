import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import ListboxJuegos from '../components/common/ListboxJuegos'
import AgregarSkinForm from '../components/forms/AgregarSkinForm'
import EditarSkinForm from '../components/forms/EditarSkinForm'
import EliminarSkinsModal from '../components/common/EliminarSkinsModal'
import './Pages.css'

function GestionarSkins() {
  const { checkAuth } = useAuth() // ← AGREGAR ESTO
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false)
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [skinAEditar, setSkinAEditar] = useState(null)
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null)
  const [skins, setSkins] = useState([])

  // Hook para cargar mis skins desde la API
  const { data: mySkins, loading, error, execute: cargarMisSkins } = useApi(
    async () => {
      const { default: skinService } = await import('../services/skinService')
      return await skinService.getMySkins()
    },
    [],
    { executeOnMount: true }
  )

  // Actualizar lista local cuando cambian los datos de la API
  useEffect(() => {
    if (mySkins) {
      setSkins(mySkins)
    }
  }, [mySkins])

  // Manejar selección de juego desde el listbox
  const manejarJuegoSeleccionado = (juego) => {
    setJuegoSeleccionado(juego)
  }

  // Abrir formulario (solo si hay juego seleccionado)
  const abrirFormulario = () => {
    if (!juegoSeleccionado) {
      alert('⚠️ Primero selecciona un juego de la lista')
      return
    }
    setMostrarFormulario(true)
  }

  // Cerrar formulario de agregar
  const cerrarFormulario = () => {
    setMostrarFormulario(false)
  }

  // Manejar nueva skin creada
  const manejarNuevaSkin = async (nuevaSkin) => {
    // Recargar desde la API
    await cargarMisSkins()
  }

  // Abrir formulario de editar
  const editarSkin = (skin) => {
    setSkinAEditar(skin)
    setMostrarFormularioEditar(true)
  }

  // Cerrar formulario de editar
  const cerrarFormularioEditar = () => {
    setMostrarFormularioEditar(false)
    setSkinAEditar(null)
  }

  // Manejar actualización de skin
  const manejarActualizacionSkin = async (skinId, skinData) => {
    try {
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.updateSkin(skinId, skinData)
      
      if (result.success) {
        // Actualizar en la lista local inmediatamente
        setSkins(prev => prev.map(skin => 
          skin.id === skinId ? { ...skin, ...skinData } : skin
        ))
        
        // Recargar desde la API
        await cargarMisSkins()
        
        alert(`✏️ Skin "${skinData.nombre}" actualizada exitosamente`)
      } else {
        alert(`❌ Error al actualizar: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error al actualizar skin')
      console.error(error)
    }
  }

  // Scroll a la sección de mis skins
  const scrollAMisSkins = () => {
    const seccionMisSkins = document.getElementById('mis-skins-section')
    if (seccionMisSkins) {
      seccionMisSkins.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // Abrir modal de eliminar
  const abrirModalEliminar = () => {
    setMostrarModalEliminar(true)
  }

  // Cerrar modal de eliminar
  const cerrarModalEliminar = () => {
    setMostrarModalEliminar(false)
  }

  // Eliminar múltiples skins
  const eliminarMultiplesSkins = async (skinsIds) => {
    try {
      const { default: skinService } = await import('../services/skinService')
      
      // Eliminar cada skin
      const promesas = skinsIds.map(skinId => skinService.deleteSkin(skinId))
      const resultados = await Promise.all(promesas)
      
      // Verificar si todas se eliminaron correctamente
      const todasEliminadas = resultados.every(r => r.success)
      
      if (todasEliminadas) {
        // Eliminar de la lista local
        setSkins(prev => prev.filter(skin => !skinsIds.includes(skin.id)))
        
        // Recargar desde la API
        await cargarMisSkins()
        
        alert(`🗑️ ${skinsIds.length} skin${skinsIds.length !== 1 ? 's' : ''} eliminada${skinsIds.length !== 1 ? 's' : ''} exitosamente`)
      } else {
        alert('❌ Algunas skins no pudieron ser eliminadas')
      }
    } catch (error) {
      alert('❌ Error al eliminar skins')
      console.error(error)
    }
  }

  // Eliminar skin individual (desde tarjeta)
  const eliminarSkin = async (skinId, nombreSkin) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${nombreSkin}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    try {
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.deleteSkin(skinId)
      
      if (result.success) {
        // Eliminar de la lista local inmediatamente
        setSkins(prev => prev.filter(skin => skin.id !== skinId))
        
        // Recargar desde la API
        await cargarMisSkins()
        
        alert(`🗑️ "${nombreSkin}" eliminada exitosamente`)
      } else {
        alert(`❌ Error al eliminar: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error al eliminar skin')
      console.error(error)
    }
  }

  return (
    <div className="page">
      <div className="page-content">
        <h1>🛠️ Gestionar Skins</h1>
        <p>Aquí podrás agregar, editar y eliminar tus skins.</p>
        
        {/* Listbox de juegos siempre visible */}
        <ListboxJuegos 
          onJuegoSeleccionado={manejarJuegoSeleccionado}
          juegoSeleccionado={juegoSeleccionado}
        />
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>➕ Agregar Nueva Skin</h3>
            <p>Sube una nueva skin a tu colección</p>
            {juegoSeleccionado ? (
              <div className="selected-game-preview">
                <span className="preview-icon">{juegoSeleccionado.imagen}</span>
                <span className="preview-name">{juegoSeleccionado.nombre}</span>
              </div>
            ) : (
              <p className="no-game-selected">Selecciona un juego primero</p>
            )}
            <button 
              className={`feature-button ${!juegoSeleccionado ? 'disabled' : ''}`}
              onClick={abrirFormulario}
              disabled={!juegoSeleccionado}
            >
              {juegoSeleccionado ? 'Agregar Skin' : 'Selecciona un juego'}
            </button>
          </div>
          
          <div className="feature-card">
            <h3>✏️ Editar Skins</h3>
            <p>Modifica las skins existentes</p>
            <div className="stats-info">
              <p>{skins.length} skin{skins.length !== 1 ? 's' : ''} creada{skins.length !== 1 ? 's' : ''}</p>
            </div>
            <button 
              className="feature-button"
              disabled={skins.length === 0}
              onClick={scrollAMisSkins}
            >
              {skins.length > 0 ? 'Ver Mis Skins' : 'Sin skins creadas'}
            </button>
          </div>
          
          <div className="feature-card">
            <h3>🗑️ Eliminar Skins</h3>
            <p>Elimina skins de tu colección</p>
            <div className="stats-info">
              <p>Gestión completa</p>
            </div>
            <button 
              className="feature-button"
              disabled={skins.length === 0}
              onClick={abrirModalEliminar}
            >
              {skins.length > 0 ? 'Gestionar' : 'Sin skins para gestionar'}
            </button>
          </div>
        </div>

        {/* Mostrar skins creadas */}
        {loading ? (
          <div className="loading-section">
            <div className="loading-spinner">⏳</div>
            <p>Cargando tus skins desde la API...</p>
          </div>
        ) : error ? (
          <div className="error-section">
            <p>❌ Error al cargar tus skins: {error}</p>
            <button 
              className="retry-button"
              onClick={cargarMisSkins}
            >
              🔄 Reintentar
            </button>
          </div>
        ) : skins.length > 0 ? (
          <div className="mis-skins-section" id="mis-skins-section">
            <h2>📦 Mis Skins Creadas ({skins.length})</h2>
            <div className="api-status">
              <p>✅ Conectado a la API - Datos en tiempo real</p>
            </div>
            <div className="skins-grid">
              {skins.map(skin => (
                <div key={skin.id} className="skin-card">
                  <div className="skin-image">
                    {skin.archivo ? (
                      <img 
                        src={skin.archivo instanceof File ? URL.createObjectURL(skin.archivo) : skin.imagen_url} 
                        alt={skin.nombre}
                        className="skin-thumbnail"
                      />
                    ) : (
                      <span className="skin-placeholder">🎭</span>
                    )}
                  </div>
                  <div className="skin-info">
                    <h3>{skin.nombre}</h3>
                    <div className="skin-game-info">
                      <span className="game-icon">{skin.juego?.imagen || '🎮'}</span>
                      <span className="game-name">{skin.juego?.nombre || 'Juego'}</span>
                    </div>
                    <p className="skin-description">{skin.descripcion}</p>
                    <p className="skin-category">📂 {skin.categoria}</p>
                    <p className="skin-price">💰 ${skin.precio}</p>
                    <p className="skin-date">📅 {skin.fechaCreacion ? new Date(skin.fechaCreacion).toLocaleDateString() : 'Hoy'}</p>
                    <div className="skin-actions">
                      <button 
                        className="edit-skin-button"
                        onClick={() => editarSkin(skin)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="delete-skin-button"
                        onClick={() => eliminarSkin(skin.id, skin.nombre)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-skins-section">
            <h3>📦 No tienes skins creadas</h3>
            <p>¡Crea tu primera skin seleccionando un juego y haciendo clic en "Agregar Skin"!</p>
          </div>
        )}
        
        <div className="placeholder-section">
          <p>📝 {skins.length === 0 ? 'API configurada - Lista para crear skins' : 'API funcionando correctamente'}</p>
          <div className="api-info">
            <small>🔗 Usando servicio de API simulado para desarrollo</small>
          </div>
        </div>

        {/* Formulario modal de agregar */}
        {mostrarFormulario && juegoSeleccionado && (
          <AgregarSkinForm 
            juegoSeleccionado={juegoSeleccionado}
            onClose={cerrarFormulario}
            onSubmit={manejarNuevaSkin}
          />
        )}

        {/* Formulario modal de editar */}
        {mostrarFormularioEditar && skinAEditar && (
          <EditarSkinForm 
            skin={skinAEditar}
            onClose={cerrarFormularioEditar}
            onSubmit={manejarActualizacionSkin}
          />
        )}

        {/* Modal de eliminar skins */}
        {mostrarModalEliminar && (
          <EliminarSkinsModal 
            skins={skins}
            onClose={cerrarModalEliminar}
            onEliminar={eliminarMultiplesSkins}
          />
        )}
      </div>
    </div>
  )
}

export default GestionarSkins