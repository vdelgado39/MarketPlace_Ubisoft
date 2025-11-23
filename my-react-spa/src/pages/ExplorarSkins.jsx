// explorarSkins.jsx

import { useState, useEffect } from 'react'
import { useSkins } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import SkinModal from '../components/common/SkinModal'
import './Pages.css'

function ExplorarSkins() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    juego: '',
    categoria: '',
    busqueda: ''
  })

  // Estado para el modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [skinSeleccionada, setSkinSeleccionada] = useState(null)

  // Hook personalizado para cargar skins con filtros
  const { skins, loading, error, cargarSkins } = useSkins(filtros, true)

  // ✅ CORREGIDO: Filtrar skins para excluir las del usuario actual
  const skinsDeOtrosUsuarios = skins.filter(skin => {
    // Si no está autenticado, mostrar todas las skins
    if (!isAuthenticated) {
      return true
    }
    
    // Si está autenticado, excluir sus propias skins
    const userId = user?.id || user?._id || localStorage.getItem('user_id')
    
    console.log('🔍 Verificando skin:', skin.nombre)
    console.log('👤 Usuario actual ID:', userId)
    console.log('👤 Creador de la skin:', skin.usuarioCreador)
    
    // ✅ Comparar con usuarioCreador._id del backend
    if (userId && skin.usuarioCreador) {
      // El backend puede retornar usuarioCreador como objeto o como string
      const creadorId = typeof skin.usuarioCreador === 'object' 
        ? skin.usuarioCreador._id 
        : skin.usuarioCreador
      
      console.log('🆔 Comparando:', userId, '!==', creadorId, '→', creadorId !== userId)
      
      // Excluir si es el mismo usuario (retornar false = no mostrar)
      return creadorId !== userId
    }
    
    // Si no hay usuarioCreador, mostrar la skin
    return true
  })

  // Lista de juegos disponibles
  const juegos = [
    { id: 'assassins-creed', nombre: "Assassin's Creed", imagen: '🥷' },
    { id: 'for-honor', nombre: 'For Honor', imagen: '⚔️' },
    { id: 'rainbow-six', nombre: 'Rainbow Six Siege', imagen: '🔫' },
    { id: 'far-cry', nombre: 'Far Cry', imagen: '🏔️' },
    { id: 'watch-dogs', nombre: 'Watch Dogs', imagen: '💻' },
    { id: 'the-division', nombre: 'The Division', imagen: '🌆' }
  ]

  // ✅ Lista de categorías actualizadas para coincidir con el backend
  const categorias = [
    { value: 'Arma', label: '⚔️ Arma' },
    { value: 'Personaje', label: '🧙‍♂️ Personaje' },
    { value: 'Vehiculo', label: '🚗 Vehículo' },
    { value: 'Objeto', label: '👑 Objeto' },
    { value: 'Otro', label: '📦 Otro' }
  ]

  // Función para agrupar skins por juego y categoría
  const agruparSkins = (skins) => {
    const grupos = {}
    
    // Si NO hay filtro de categoría específica, agrupar solo por juego
    if (!filtros.categoria) {
      skins.forEach(skin => {
        const juegoId = skin.juego?.id || skin.juegoId || 'unknown'
        
        if (!grupos[juegoId]) {
          grupos[juegoId] = {
            juego: getNombreJuego(juegoId),
            juegoEmoji: getEmojiJuego(juegoId),
            categoria: 'Todas las categorías',
            skins: []
          }
        }
        
        grupos[juegoId].skins.push(skin)
      })
    } else {
      // Si HAY filtro de categoría, agrupar por juego Y categoría
      skins.forEach(skin => {
        const juegoId = skin.juego?.id || skin.juegoId || 'unknown'
        const categoria = skin.categoria || 'Otro'
        
        const key = `${juegoId}-${categoria}`
        
        if (!grupos[key]) {
          grupos[key] = {
            juego: getNombreJuego(juegoId),
            juegoEmoji: getEmojiJuego(juegoId),
            categoria: getCategoriaLabel(categoria),
            skins: []
          }
        }
        
        grupos[key].skins.push(skin)
      })
    }
    
    return grupos
  }

  // Manejar cambios en filtros
  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [tipo]: valor
    }))
  }

  // Manejar búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarSkins(filtros)
    }, 500)

    return () => clearTimeout(timer)
  }, [filtros.busqueda])

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      juego: '',
      categoria: '',
      busqueda: ''
    })
  }

  // Abrir modal con detalles de skin
  const abrirModal = (skin) => {
    console.log('🎯 Abriendo modal para skin:', skin.nombre)
    setSkinSeleccionada(skin)
    setModalAbierto(true)
  }

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false)
    setSkinSeleccionada(null)
  }

  // ✅ Manejar intento de compra con integración al backend
  const comprarSkin = async (skin) => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      alert('🔒 Debes iniciar sesión para comprar skins')
      cerrarModal()
      navigate('/login')
      return
    }

    try {
      const { default: skinService } = await import('../services/skinService')
      const skinId = skin._id || skin.id
      const result = await skinService.purchaseSkin(skinId)
      
      if (result.success) {
        alert(`🎉 ¡Has comprado "${skin.nombre}" por $${skin.precio}!`)
        cerrarModal()
        // Recargar skins para actualizar la lista
        cargarSkins(filtros)
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error al comprar la skin')
      console.error(error)
    }
  }

  // Obtener nombre del juego por ID
  const getNombreJuego = (juegoId) => {
    const juego = juegos.find(j => j.id === juegoId)
    return juego ? juego.nombre : 'Juego desconocido'
  }

  // Obtener emoji del juego por ID
  const getEmojiJuego = (juegoId) => {
    const juego = juegos.find(j => j.id === juegoId)
    return juego ? juego.imagen : '🎮'
  }

  // Obtener label de categoría
  const getCategoriaLabel = (categoria) => {
    const cat = categorias.find(c => c.value === categoria)
    return cat ? cat.label : '📦 Otro'
  }

  // Obtener skins agrupadas (usando las skins filtradas)
  const skinsAgrupadas = agruparSkins(skinsDeOtrosUsuarios)

  return (
    <div className="page">
      <div className="page-content">
        <h1>🔍 Explorar Skins</h1>
        <p>
          {isAuthenticated 
            ? 'Descubre skins de otros creadores organizadas por juego y categoría.'
            : '¡Bienvenido! Explora las skins disponibles. Inicia sesión para comprarlas.'
          }
        </p>
        
        {/* Banner informativo para usuarios no autenticados */}
        {!isAuthenticated && (
          <div className="info-banner">
            <p>
              ℹ️ Estás navegando como invitado. 
              <button 
                className="inline-link-button"
                onClick={() => navigate('/login')}
              >
                Inicia sesión
              </button>
              {' '}o{' '}
              <button 
                className="inline-link-button"
                onClick={() => navigate('/register')}
              >
                regístrate
              </button>
              {' '}para comprar skins.
            </p>
          </div>
        )}
        
        {/* Filtros */}
        <div className="filters-section">
          <div className="filters">
            {/* Filtro por juego */}
            <select 
              className="filter-select"
              value={filtros.juego}
              onChange={(e) => handleFiltroChange('juego', e.target.value)}
            >
              <option value="">Todos los juegos</option>
              {juegos.map(juego => (
                <option key={juego.id} value={juego.id}>
                  {juego.imagen} {juego.nombre}
                </option>
              ))}
            </select>
            
            {/* Filtro por categoría */}
            <select 
              className="filter-select"
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange('categoria', e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </option>
              ))}
            </select>
            
            {/* Búsqueda */}
            <input 
              type="text" 
              placeholder="Buscar skins..." 
              className="search-input"
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
            />
            
            {/* Botón limpiar filtros */}
            <button 
              className="clear-filters-button"
              onClick={limpiarFiltros}
              title="Limpiar filtros"
            >
              🔄 Limpiar
            </button>
          </div>

          {/* Información de filtros activos */}
          <div className="filters-info">
            <p>
              {loading ? (
                "🔄 Cargando skins..."
              ) : error ? (
                `❌ Error: ${error}`
              ) : (
                `📊 ${skinsDeOtrosUsuarios.length} skin${skinsDeOtrosUsuarios.length !== 1 ? 's' : ''} encontrada${skinsDeOtrosUsuarios.length !== 1 ? 's' : ''} - ${Object.keys(skinsAgrupadas).length} grupo${Object.keys(skinsAgrupadas).length !== 1 ? 's' : ''}`
              )}
            </p>
            
            {/* Mostrar filtros activos */}
            {(filtros.juego || filtros.categoria || filtros.busqueda) && (
              <div className="active-filters">
                <span>Filtros activos:</span>
                {filtros.juego && (
                  <span className="active-filter">
                    🎮 {getNombreJuego(filtros.juego)}
                  </span>
                )}
                {filtros.categoria && (
                  <span className="active-filter">
                    📂 {categorias.find(c => c.value === filtros.categoria)?.label}
                  </span>
                )}
                {filtros.busqueda && (
                  <span className="active-filter">
                    🔍 "{filtros.busqueda}"
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Contenido agrupado */}
        {loading ? (
          <div className="loading-section">
            <div className="loading-spinner">⏳</div>
            <p>Cargando skins...</p>
          </div>
        ) : error ? (
          <div className="error-section">
            <p>❌ {error}</p>
            <button 
              className="retry-button"
              onClick={() => cargarSkins(filtros)}
            >
              🔄 Reintentar
            </button>
          </div>
        ) : Object.keys(skinsAgrupadas).length === 0 ? (
          <div className="no-results-section">
            <h3>🚫 No se encontraron skins {isAuthenticated ? 'de otros usuarios' : 'disponibles'}</h3>
            <p>
              {isAuthenticated 
                ? 'Prueba cambiando los filtros o espera a que otros creadores suban sus skins.'
                : 'Prueba cambiando los filtros o regresa más tarde.'
              }
            </p>
            <button 
              className="clear-filters-button"
              onClick={limpiarFiltros}
            >
              🔄 Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grupos-container">
            {Object.entries(skinsAgrupadas).map(([key, grupo]) => (
              <div key={key} className="grupo-skins">
                {/* Header del grupo */}
                <div className="grupo-header">
                  <h3>
                    <span className="grupo-juego-emoji">{grupo.juegoEmoji}</span>
                    <span className="grupo-juego-nombre">{grupo.juego}</span>
                    {grupo.categoria !== 'Todas las categorías' && (
                      <>
                        <span className="grupo-separador">•</span>
                        <span className="grupo-categoria">{grupo.categoria}</span>
                      </>
                    )}
                    {grupo.categoria === 'Todas las categorías' && (
                      <>
                        <span className="grupo-separador">•</span>
                        <span className="grupo-todas-categorias">{grupo.categoria}</span>
                      </>
                    )}
                  </h3>
                  <span className="grupo-count">({grupo.skins.length} skin{grupo.skins.length !== 1 ? 's' : ''})</span>
                </div>
                
                {/* Grid de skins con scroll horizontal */}
                <div className="skins-scroll-container">
                  <div className="skins-horizontal-grid">
                    {grupo.skins.map(skin => (
                      <div 
                        key={skin._id || skin.id} 
                        className="skin-card-compact"
                        onClick={() => abrirModal(skin)}
                      >
                        <div className="skin-image-compact">
                          {skin.imagen || skin.urlArchivo ? (
                            <img 
                              src={skin.imagen || skin.urlArchivo || 'https://via.placeholder.com/150?text=Sin+Imagen'} 
                              alt={skin.nombre}
                              className="skin-thumbnail-compact"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150?text=Imagen+No+Disponible'
                              }}
                            />
                          ) : (
                            <span className="skin-placeholder-compact">🎭</span>
                          )}
                        </div>
                        
                        {/* Overlay con información */}
                        <div className="skin-overlay">
                          <div className="skin-info-compact">
                            <h4>{skin.nombre}</h4>
                            <p className="skin-price-compact">
                              {skin.precio === 0 ? '🆓 GRATIS' : `💰 $${skin.precio}`}
                            </p>
                            <p className="click-hint">👆 Click para ver detalles</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="placeholder-section">
          <p>🎯 {Object.keys(skinsAgrupadas).length > 0 ? 'Haz clic en cualquier skin para ver detalles completos' : 'Aquí aparecerán las skins disponibles'}</p>
        </div>

        {/* Modal de detalles de skin */}
        {modalAbierto && skinSeleccionada && (
          <SkinModal 
            skinId={skinSeleccionada._id || skinSeleccionada.id}
            onClose={cerrarModal}
            onComprar={comprarSkin}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </div>
  )
}

export default ExplorarSkins