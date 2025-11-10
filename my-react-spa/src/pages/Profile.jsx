import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const { user, logout, updateProfile, checkAuth } = useAuth()

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    avatar: '👤'
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [skinsSubidas, setSkinsSubidas] = useState([])
  const [skinsCompradas, setSkinsCompradas] = useState([])
  const [skinsDescargadas, setSkinsDescargadas] = useState([])
  const [loadingSkins, setLoadingSkins] = useState(false)

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      console.log('👤 Usuario en Profile:', user)
      console.log('📊 Skins del usuario:', {
        subidas: user.skinsSubidas,
        compradas: user.skinsCompradas,
        descargadas: user.skinsDescargadas
      })
      
      setFormData({
        nombre: user.nombre || '',
        avatar: user.avatar || '👤'
      })
      
      // Cargar las skins del usuario
      cargarSkinsDelUsuario()
    }
  }, [user])

  // Cargar skins del usuario
  const cargarSkinsDelUsuario = async () => {
    if (!user) return
    
    setLoadingSkins(true)
    
    try {
      const { default: skinService } = await import('../services/skinService')
      
      // Cargar todas las skins
      const allSkinsResult = await skinService.getAllSkins()
      
      if (allSkinsResult.success) {
        const allSkins = allSkinsResult.data
        
        // Filtrar skins subidas
        const subidas = allSkins.filter(skin => 
          user.skinsSubidas?.includes(skin.id)
        )
        setSkinsSubidas(subidas)
        
        // Filtrar skins compradas
        const compradas = allSkins.filter(skin => 
          user.skinsCompradas?.includes(skin.id)
        )
        setSkinsCompradas(compradas)
        
        // Filtrar skins descargadas
        const descargadas = allSkins.filter(skin => 
          user.skinsDescargadas?.includes(skin.id)
        )
        setSkinsDescargadas(descargadas)
      }
    } catch (error) {
      console.error('Error al cargar skins:', error)
    } finally {
      setLoadingSkins(false)
    }
  }

  // Lista de avatares
  const avatares = ['👤', '🧑', '👨', '👩', '🧔', '👨‍💼', '👩‍💼', '🧑‍🎨', '🧑‍💻', '🎮', '🥷', '⚔️', '🔫', '🏹', '🎯']

  // Manejar cambios
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Seleccionar avatar
  const handleAvatarSelect = (avatar) => {
    setFormData(prev => ({
      ...prev,
      avatar
    }))
  }

  // Guardar cambios
  const handleSave = async () => {
    setIsUpdating(true)
    
    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        alert('✅ Perfil actualizado exitosamente')
        setEditMode(false)
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error al actualizar perfil')
    } finally {
      setIsUpdating(false)
    }
  }

  // Cancelar edición
  const handleCancel = () => {
    setFormData({
      nombre: user.nombre || '',
      avatar: user.avatar || '👤'
    })
    setEditMode(false)
  }

  // Cerrar sesión
  const handleLogout = async () => {
    const confirmacion = window.confirm('¿Estás seguro de que quieres cerrar sesión?')
    if (!confirmacion) return

    const result = await logout()
    if (result.success) {
      navigate('/login')
    }
  }

  // Descargar skin
  const handleDescargarSkin = async (skinId, nombreSkin) => {
    try {
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.downloadSkin(skinId)
      
      if (result.success) {
        alert(`✅ "${nombreSkin}" descargada exitosamente`)
        
        // Recargar datos del usuario y skins
        await checkAuth()
        await cargarSkinsDelUsuario()
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert('❌ Error al descargar skin')
    }
  }

  // Ver detalles de skin (navegar a gestionar)
  const handleVerDetalles = (skinId) => {
    navigate('/gestionar-skins')
  }

  if (!user) {
    return (
      <div className="loading-section">
        <div className="loading-spinner">⏳</div>
        <p>Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header del perfil */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {editMode ? formData.avatar : user.avatar}
            </div>
            <div className="profile-info">
              <h1>{user.username}</h1>
              <p className="profile-email">{user.email}</p>
              <p className="profile-member-since">
                📅 Miembro desde {new Date(user.fechaRegistro).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="profile-actions">
            {!editMode ? (
              <>
                <button className="edit-profile-button" onClick={() => setEditMode(true)}>
                  ✏️ Editar Perfil
                </button>
                <button className="logout-button" onClick={handleLogout}>
                  🚪 Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <button 
                  className="save-profile-button" 
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? '⏳ Guardando...' : '💾 Guardar'}
                </button>
                <button 
                  className="cancel-profile-button" 
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  ❌ Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Edición de perfil */}
        {editMode && (
          <div className="profile-edit-section">
            <h2>✏️ Editar Información</h2>
            
            {/* Nombre */}
            <div className="profile-form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                disabled={isUpdating}
              />
            </div>

            {/* Selector de Avatar */}
            <div className="profile-form-group">
              <label>Selecciona tu Avatar</label>
              <div className="profile-avatar-selector">
                {avatares.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    className={`profile-avatar-option ${formData.avatar === avatar ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(avatar)}
                    disabled={isUpdating}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="profile-stats">
          <h2>📊 Estadísticas</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📤</div>
              <div className="stat-info">
                <h3>{user.skinsSubidas?.length || 0}</h3>
                <p>Skins Subidas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3>{user.skinsCompradas?.length || 0}</h3>
                <p>Skins Compradas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⬇️</div>
              <div className="stat-info">
                <h3>{user.skinsDescargadas?.length || 0}</h3>
                <p>Skins Descargadas</p>
              </div>
            </div>
            <div className="stat-card wallet-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>${user.wallet?.toFixed(2) || '0.00'}</h3>
                <p>Saldo en Wallet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skins Subidas */}
        <div className="profile-section">
          <h2>📤 Mis Skins Subidas ({skinsSubidas.length})</h2>
          {loadingSkins ? (
            <div className="loading-section">
              <p>Cargando skins...</p>
            </div>
          ) : skinsSubidas.length > 0 ? (
            <div className="profile-skins-list">
              {skinsSubidas.map((skin) => (
                <div key={skin.id} className="profile-skin-item">
                  <span className="skin-number">#{skin.id}</span>
                  <div className="skin-item-details">
                    <span className="skin-name-profile">{skin.nombre}</span>
                    <span className="skin-price-profile">💰 ${skin.precio}</span>
                  </div>
                  <button 
                    className="view-skin-button"
                    onClick={() => handleVerDetalles(skin.id)}
                  >
                    👁️ Ver
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No has subido ninguna skin aún</p>
              <button 
                className="empty-action-button"
                onClick={() => navigate('/gestionar-skins')}
              >
                ➕ Subir Primera Skin
              </button>
            </div>
          )}
        </div>

        {/* Skins Compradas */}
        <div className="profile-section">
          <h2>🛒 Mis Skins Compradas ({skinsCompradas.length})</h2>
          {loadingSkins ? (
            <div className="loading-section">
              <p>Cargando skins...</p>
            </div>
          ) : skinsCompradas.length > 0 ? (
            <div className="profile-skins-list">
              {skinsCompradas.map((skin) => (
                <div key={skin.id} className="profile-skin-item">
                  <span className="skin-number">#{skin.id}</span>
                  <div className="skin-item-details">
                    <span className="skin-name-profile">{skin.nombre}</span>
                    <span className="skin-price-profile">💰 ${skin.precio}</span>
                  </div>
                  {!user.skinsDescargadas?.includes(skin.id) ? (
                    <button 
                      className="download-skin-button"
                      onClick={() => handleDescargarSkin(skin.id, skin.nombre)}
                    >
                      ⬇️ Descargar
                    </button>
                  ) : (
                    <span className="skin-badge">✅ Descargada</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No has comprado ninguna skin aún</p>
              <button 
                className="empty-action-button"
                onClick={() => navigate('/explorar-skins')}
              >
                🔍 Explorar Marketplace
              </button>
            </div>
          )}
        </div>

        {/* Skins Descargadas */}
        <div className="profile-section">
          <h2>⬇️ Mis Skins Descargadas ({skinsDescargadas.length})</h2>
          {loadingSkins ? (
            <div className="loading-section">
              <p>Cargando skins...</p>
            </div>
          ) : skinsDescargadas.length > 0 ? (
            <div className="profile-skins-list">
              {skinsDescargadas.map((skin) => (
                <div key={skin.id} className="profile-skin-item">
                  <span className="skin-number">#{skin.id}</span>
                  <div className="skin-item-details">
                    <span className="skin-name-profile">{skin.nombre}</span>
                    <span className="skin-price-profile">💰 ${skin.precio}</span>
                  </div>
                  <span className="skin-badge">✅ Descargada</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No has descargado ninguna skin aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile