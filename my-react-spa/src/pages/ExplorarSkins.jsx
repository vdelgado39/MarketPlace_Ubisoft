import { useState, useEffect } from 'react'
import { useSkins } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import SkinModal from '../components/common/SkinModal'
import './Pages.css'

function ExplorarSkins() {
  const { checkAuth, user } = useAuth() // Obtener usuario actual
  
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

  // Filtrar skins para excluir las del usuario actual
  const skinsDeOtrosUsuarios = skins.filter(skin => {
    // Obtener ID del usuario actual
    const userId = user?.id || localStorage.getItem('user_id')
    
    // Excluir si la skin pertenece al usuario actual
    if (userId && skin.creadorId) {
      return skin.creadorId !== parseInt(userId)
    }
    
    // Si no hay creadorId o no hay usuario, mostrar la skin
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

  // Lista de categorías disponibles
  const categorias = [
    { value: 'armas', label: '⚔️ Armas' },
    { value: 'personajes', label: '🧙‍♂️ Personajes' },
    { value: 'vehiculos', label: '🚗 Vehículos' },
    { value: 'accesorios', label: '👑 Accesorios' },
    { value: 'efectos', label: '✨ Efectos Especiales' },
    { value: 'otros', label: '📦 Otros' }
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
        const categoria = skin.categoria || 'otros'
        
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
    setSkinSeleccionada(skin)
    setModalAbierto(true)
  }

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false)
    setSkinSeleccionada(null)
  }

  // Simular compra de skin desde el modal
  const comprarSkin = async (skin) => {
    try {
      // Aquí iría la llamada a la API de compra
      alert(`🎉 ¡Has comprado "${skin.nombre}" por $${skin.precio}!`)
      cerrarModal()
    } catch (error) {
      alert('❌ Error al comprar la skin')
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
    return cat ? cat.label : '📦 Otros'
  }

  // Obtener skins agrupadas (usando las skins filtradas)
  const skinsAgrupadas = agruparSkins(skinsDeOtrosUsuarios)

  return (
    <div className="page">
      <div className="page-content">
        <h1>🔍 Explorar Skins</h1>
        <p>Descubre skins de otros creadores organizadas por juego y categoría.</p>
        
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
            <h3>🚫 No se encontraron skins de otros usuarios</h3>
            <p>Prueba cambiando los filtros o espera a que otros creadores suban sus skins.</p>
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
                        key={skin.id} 
                        className="skin-card-compact"
                        onClick={() => abrirModal(skin)}
                      >
                        <div className="skin-image-compact">
                          {skin.archivo ? (
                            <img 
                              src={skin.archivo instanceof File ? URL.createObjectURL(skin.archivo) : skin.imagen_url} 
                              alt={skin.nombre}
                              className="skin-thumbnail-compact"
                            />
                          ) : (
                            <span className="skin-placeholder-compact">🎭</span>
                          )}
                        </div>
                        
                        {/* Overlay con información */}
                        <div className="skin-overlay">
                          <div className="skin-info-compact">
                            <h4>{skin.nombre}</h4>
                            <p className="skin-price-compact">💰 ${skin.precio}</p>
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
          <p>🎯 {Object.keys(skinsAgrupadas).length > 0 ? 'Haz clic en cualquier skin para ver detalles completos' : 'Aquí aparecerán las skins de otros creadores'}</p>
        </div>

        {/* Modal de detalles de skin */}
        {modalAbierto && skinSeleccionada && (
          <SkinModal 
            skinId={skinSeleccionada.id}
            onClose={cerrarModal}
            onComprar={comprarSkin}
          />
        )}
      </div>
    </div>
  )
}

export default ExplorarSkins