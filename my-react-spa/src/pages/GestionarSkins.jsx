// GestionarSkins.jsx

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import ListboxJuegos from '../components/common/ListboxJuegos'
import AgregarSkinForm from '../components/forms/AgregarSkinForm'
import EditarSkinForm from '../components/forms/EditarSkinForm'
import EliminarSkinsModal from '../components/common/EliminarSkinsModal'
import './Pages.css'

function GestionarSkins() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { checkAuth } = useAuth()
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarFormularioEditar, setMostrarFormularioEditar] = useState(false)
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
  const [skinAEditar, setSkinAEditar] = useState(null)
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null)
  const [skins, setSkins] = useState([])

  // Hook para cargar Mis skins subidas desde MongoDB
  const { data: apiResponse, loading, error, execute: cargarMisSkins } = useApi(
    async () => {
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.getMySkins()
      
      console.log('📥 Respuesta completa de getMySkins:', result)
      
      // El backend retorna {skinsSubidas, skinsCompradas, skinsDescargadas}
      // Solo necesitamos las subidas
      return result
    },
    [],
    { executeOnMount: true }
  )

  // Actualizar lista local cuando cambian los datos de la API
  useEffect(() => {
    console.log('🔄 apiResponse cambió:', apiResponse)
    
    if (apiResponse && apiResponse.skinsSubidas) {
      console.log('✅ Actualizando skins con:', apiResponse.skinsSubidas)
      setSkins(apiResponse.skinsSubidas)
    } else if (apiResponse && Array.isArray(apiResponse)) {
      // Por si acaso retorna un array directamente
      console.log('✅ Actualizando skins con array:', apiResponse)
      setSkins(apiResponse)
    }
  }, [apiResponse])

  // Detectar si viene parámetro edit en la URL (desde Profile)
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && skins.length > 0) {
      const skinParaEditar = skins.find(s => (s._id || s.id) === editId)
      if (skinParaEditar) {
        console.log('✏️ Abriendo editor para skin:', skinParaEditar)
        editarSkin(skinParaEditar)
        // Limpiar el parámetro de la URL
        navigate('/gestionar-skins', { replace: true })
      }
    }
  }, [searchParams, skins, navigate])

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
    console.log('✅ Nueva skin creada:', nuevaSkin)
    
    // Recargar desde la API
    await cargarMisSkins()
    
    // Recargar auth para actualizar wallet y contadores
    await checkAuth()
    
    alert(`🎉 Skin "${nuevaSkin.nombre}" creada exitosamente`)
  }

  // Abrir formulario de editar
  const editarSkin = (skin) => {
    console.log('✏️ Editando skin:', skin)
    setSkinAEditar(skin)
    setMostrarFormularioEditar(true)
  }

  // Cerrar formulario de editar
  const cerrarFormularioEditar = () => {
    setMostrarFormularioEditar(false)
    setSkinAEditar(null)
  }

  // Manejar actualización de skin en MongoDB
  const manejarActualizacionSkin = async (skinId, skinData) => {
    try {
      console.log('🔄 Actualizando skin en MongoDB:', skinId, skinData)
      
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.updateSkin(skinId, skinData)
      
      console.log('📥 Resultado de updateSkin:', result)
      
      if (result.success) {
        // Actualizar en la lista local inmediatamente (usando _id de MongoDB)
        setSkins(prev => prev.map(skin => 
          (skin._id || skin.id) === skinId ? { ...skin, ...skinData, _id: skinId } : skin
        ))
        
        // Recargar desde la API para asegurar datos actualizados
        await cargarMisSkins()
        
        alert(`✅ Skin "${skinData.nombre}" actualizada exitosamente`)
        
        // Cerrar el formulario de edición
        cerrarFormularioEditar()
      } else {
        alert(`❌ Error al actualizar: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Error al actualizar skin:', error)
      alert('❌ Error al actualizar skin')
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

  // ✅ Eliminar múltiples skins de MongoDB
  const eliminarMultiplesSkins = async (skinsIds) => {
    try {
      console.log('🗑️ Eliminando múltiples skins:', skinsIds)
      
      const { default: skinService } = await import('../services/skinService')
      
      // Eliminar cada skin
      const promesas = skinsIds.map(skinId => skinService.deleteSkin(skinId))
      const resultados = await Promise.all(promesas)
      
      console.log('📥 Resultados de eliminación:', resultados)
      
      // Verificar si todas se eliminaron correctamente
      const todasEliminadas = resultados.every(r => r.success)
      
      if (todasEliminadas) {
        // Eliminar de la lista local (usando _id de MongoDB)
        setSkins(prev => prev.filter(skin => !skinsIds.includes(skin._id || skin.id)))
        
        // Recargar desde la API
        await cargarMisSkins()
        
        // Recargar auth para actualizar contadores
        await checkAuth()
        
        alert(`🗑️ ${skinsIds.length} skin${skinsIds.length !== 1 ? 's' : ''} eliminada${skinsIds.length !== 1 ? 's' : ''} exitosamente`)
      } else {
        alert('❌ Algunas skins no pudieron ser eliminadas')
      }
    } catch (error) {
      console.error('❌ Error al eliminar skins:', error)
      alert('❌ Error al eliminar skins')
    }
  }

  // Eliminar skin individual de MongoDB
  const eliminarSkin = async (skin) => {
    const skinId = skin._id || skin.id
    const nombreSkin = skin.nombre
    
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${nombreSkin}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    try {
      console.log('🗑️ Eliminando skin:', skinId)
      
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.deleteSkin(skinId)
      
      console.log('📥 Resultado de deleteSkin:', result)
      
      if (result.success) {
        // Eliminar de la lista local inmediatamente
        setSkins(prev => prev.filter(s => (s._id || s.id) !== skinId))
        
        // Recargar desde la API
        await cargarMisSkins()
        
        // Recargar auth para actualizar contadores
        await checkAuth()
        
        alert(`🗑️ "${nombreSkin}" eliminada exitosamente`)
      } else {
        alert(`❌ Error al eliminar: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Error al eliminar skin:', error)
      alert('❌ Error al eliminar skin')
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

        {/* Mostrar skins creadas desde MongoDB */}
        {loading ? (
          <div className="loading-section">
            <div className="loading-spinner">⏳</div>
            <p>Cargando tus skins desde MongoDB...</p>
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
              <p>✅ Conectado a MongoDB - Datos en tiempo real</p>
            </div>
            <div className="skins-grid">
              {skins.map(skin => (
                <div key={skin._id || skin.id} className="skin-card">
                  <div className="skin-image">
                    {/* Usar imagen o urlArchivo de MongoDB */}
                    {skin.imagen || skin.urlArchivo ? (
                      <img 
                        src={skin.imagen || skin.urlArchivo || 'https://via.placeholder.com/200?text=Sin+Imagen'} 
                        alt={skin.nombre}
                        className="skin-thumbnail"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200?text=Imagen+No+Disponible'
                        }}
                      />
                    ) : (
                      <span className="skin-placeholder">🎭</span>
                    )}
                  </div>
                  <div className="skin-info">
                    <h3>{skin.nombre}</h3>
                    <div className="skin-game-info">
                      <span className="game-icon">
                        {skin.juego?.imagen || skin.juegoId === 'assassins-creed' ? '🥷' : 
                         skin.juegoId === 'for-honor' ? '⚔️' : 
                         skin.juegoId === 'rainbow-six' ? '🔫' : 
                         skin.juegoId === 'far-cry' ? '🏔️' : 
                         skin.juegoId === 'watch-dogs' ? '💻' : 
                         skin.juegoId === 'the-division' ? '🌆' : '🎮'}
                      </span>
                      <span className="game-name">
                        {skin.juego?.nombre || 
                         skin.juegoId === 'assassins-creed' ? "Assassin's Creed" : 
                         skin.juegoId === 'for-honor' ? 'For Honor' : 
                         skin.juegoId === 'rainbow-six' ? 'Rainbow Six Siege' : 
                         skin.juegoId === 'far-cry' ? 'Far Cry' : 
                         skin.juegoId === 'watch-dogs' ? 'Watch Dogs' : 
                         skin.juegoId === 'the-division' ? 'The Division' : 'Juego'}
                      </span>
                    </div>
                    <p className="skin-description">{skin.descripcion}</p>
                    <p className="skin-category">📂 {skin.categoria}</p>
                    <p className="skin-price">
                      {skin.precio === 0 ? '🆓 GRATIS' : `💰 $${skin.precio}`}
                    </p>
                    <p className="skin-stats">
                      📥 {skin.descargas || 0} descargas | 🛒 {skin.compras || 0} compras
                    </p>
                    <p className="skin-date">
                      📅 {skin.fechaCreacion ? new Date(skin.fechaCreacion).toLocaleDateString() : 'Hoy'}
                    </p>
                    <div className="skin-actions">
                      <button 
                        className="edit-skin-button"
                        onClick={() => editarSkin(skin)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="delete-skin-button"
                        onClick={() => eliminarSkin(skin)}
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
          <p>📝 {skins.length === 0 ? 'MongoDB configurado - Listo para crear skins' : 'MongoDB funcionando correctamente'}</p>
          <div className="api-info">
            <small>🔗 Conectado al backend MongoDB</small>
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