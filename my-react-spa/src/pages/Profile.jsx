import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const { user, logout, updateProfile, deleteProfile, checkAuth } = useAuth()

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

  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      console.log('👤 Usuario en Profile:', user)
      
      setFormData({
        nombre: user.nombre || '',
        avatar: user.avatar || '👤',
        username: user.username || '',
        email: user.email || ''
      })
      
      // Cargar las skins del usuario desde el backend
      cargarSkinsDelUsuario()
    }
  }, [user])

  // Cargar skins del usuario desde el backend
  const cargarSkinsDelUsuario = async () => {
    if (!user) return
    
    setLoadingSkins(true)
    
    try {
      const { default: skinService } = await import('../services/skinService')
      
      // Usar el endpoint getMySkins que retorna las skins del usuario
      const result = await skinService.getMySkins()
      
      console.log('📥 Resultado de getMySkins:', result)
      
      if (result.success) {
        // El backend retorna {skinsSubidas, skinsCompradas, skinsDescargadas}
        const { skinsSubidas, skinsCompradas, skinsDescargadas } = result.data
        
        console.log('✅ Skins cargadas:', {
          subidas: skinsSubidas?.length || 0,
          compradas: skinsCompradas?.length || 0,
          descargadas: skinsDescargadas?.length || 0
        })
        
        setSkinsSubidas(skinsSubidas || [])
        setSkinsCompradas(skinsCompradas || [])
        setSkinsDescargadas(skinsDescargadas || [])
      }
    } catch (error) {
      console.error('❌ Error al cargar skins:', error)
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
        await checkAuth()
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
      avatar: user.avatar || '👤',
      username: user.username || '',
      email: user.email || ''
    })
    setEditMode(false)
  }

  // Abrir modal de eliminación
  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true)
    setDeletePassword('')
  }

  // Cerrar modal de eliminación
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletePassword('')
  }

  // Eliminar perfil
  const handleDeleteProfile = async () => {
    if (!deletePassword) {
      alert('⚠️ Por favor ingresa tu contraseña para confirmar')
      return
    }

    const confirmacion = window.confirm(
      '⚠️ ADVERTENCIA: Esta acción es irreversible.\n\n' +
      '¿Estás completamente seguro de que quieres eliminar tu cuenta?\n\n' +
      'Se perderán:\n' +
      '- Tu perfil y estadísticas\n' +
      '- Todas tus skins subidas\n' +
      '- Tus skins compradas\n' +
      '- Tu saldo en la wallet\n\n' +
      '¿Continuar con la eliminación?'
    )

    if (!confirmacion) return

    setIsDeleting(true)

    try {
      const result = await deleteProfile(deletePassword)

      if (result.success) {
        alert('✅ Cuenta eliminada exitosamente. Serás redirigido al inicio.')
        handleCloseDeleteModal()
        
        await logout()
        navigate('/login')
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Error al eliminar cuenta: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
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

  // Editar skin (navegar a gestionar skins con el ID)
  const handleEditarSkin = (skinId) => {
    navigate(`/gestionar-skins?edit=${skinId}`)
  }

  // Descargar skin
  const handleDescargarSkin = async (skin) => {
    try {
      const skinId = skin._id || skin.id
      const { default: skinService } = await import('../services/skinService')
      const result = await skinService.downloadSkin(skinId)
      
      if (result.success) {
        alert(`✅ "${skin.nombre}" lista para descargar`)
        
        if (result.data.urlArchivo) {
          window.open(result.data.urlArchivo, '_blank')
        }
        
        await checkAuth()
        await cargarSkinsDelUsuario()
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Error al descargar skin:', error)
      alert('❌ Error al descargar skin')
    }
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
                <button className="delete-profile-button" onClick={handleOpenDeleteModal}>
                  🗑️ Eliminar Perfil
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

            <div className="profile-form-group">
              <label>Contraseña Actual (opcional)</label>
              <input
                type="password"
                name="passwordActual"
                value={formData.passwordActual || ''}
                onChange={handleInputChange}
                placeholder="Solo si quieres cambiar contraseña"
                disabled={isUpdating}
              />
            </div>

            <div className="profile-form-group">
              <label>Nueva Contraseña (opcional)</label>
              <input
                type="password"
                name="nuevoPassword"
                value={formData.nuevoPassword || ''}
                onChange={handleInputChange}
                placeholder="Nueva contraseña"
                disabled={isUpdating}
              />
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
                <h3>{skinsSubidas.length}</h3>
                <p>Skins Subidas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3>{skinsCompradas.length}</h3>
                <p>Skins Compradas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⬇️</div>
              <div className="stat-info">
                <h3>{skinsDescargadas.length}</h3>
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
          <div className="section-header-profile">
            <h2>📤 Mis Skins Subidas</h2>
            <span className="section-count">({skinsSubidas.length} skin{skinsSubidas.length !== 1 ? 's' : ''})</span>
          </div>
          
          {loadingSkins ? (
            <div className="loading-section">
              <div className="loading-spinner">⏳</div>
              <p>Cargando skins...</p>
            </div>
          ) : skinsSubidas.length > 0 ? (
            <div className="skins-scroll-container">
              <div className="skins-horizontal-grid">
                {skinsSubidas.map(skin => (
                  <div 
                    key={skin._id || skin.id} 
                    className="skin-card-compact"
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
                    
                    <div className="skin-overlay">
                      <div className="skin-info-compact">
                        <h4>{skin.nombre}</h4>
                        <p className="skin-price-compact">
                          {skin.precio === 0 ? '🆓 GRATIS' : `💰 $${skin.precio}`}
                        </p>
                        <p className="skin-stats-compact">
                          📥 {skin.descargas || 0} | 🛒 {skin.compras || 0}
                        </p>
                        <button 
                          className="edit-skin-button-compact"
                          onClick={() => handleEditarSkin(skin._id || skin.id)}
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          <div className="section-header-profile">
            <h2>🛒 Mis Skins Compradas</h2>
            <span className="section-count">({skinsCompradas.length} skin{skinsCompradas.length !== 1 ? 's' : ''})</span>
          </div>
          
          {loadingSkins ? (
            <div className="loading-section">
              <div className="loading-spinner">⏳</div>
              <p>Cargando skins...</p>
            </div>
          ) : skinsCompradas.length > 0 ? (
            <div className="skins-scroll-container">
              <div className="skins-horizontal-grid">
                {skinsCompradas.map(skin => (
                  <div 
                    key={skin._id || skin.id} 
                    className="skin-card-compact"
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
                    
                    <div className="skin-overlay">
                      <div className="skin-info-compact">
                        <h4>{skin.nombre}</h4>
                        <p className="skin-price-compact">💰 ${skin.precio}</p>
                        <button 
                          className="download-skin-button-compact"
                          onClick={() => handleDescargarSkin(skin)}
                        >
                          📥 Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No has comprado ninguna skin aún</p>
              <button 
                className="empty-action-button"
                onClick={() => navigate('/explorar')}
              >
                🔍 Explorar Marketplace
              </button>
            </div>
          )}
        </div>

        {/* Skins Descargadas */}
        <div className="profile-section">
          <div className="section-header-profile">
            <h2>⬇️ Mis Skins Descargadas</h2>
            <span className="section-count">({skinsDescargadas.length} skin{skinsDescargadas.length !== 1 ? 's' : ''})</span>
          </div>
          
          {loadingSkins ? (
            <div className="loading-section">
              <div className="loading-spinner">⏳</div>
              <p>Cargando skins...</p>
            </div>
          ) : skinsDescargadas.length > 0 ? (
            <div className="skins-scroll-container">
              <div className="skins-horizontal-grid">
                {skinsDescargadas.map(skin => (
                  <div 
                    key={skin._id || skin.id} 
                    className="skin-card-compact"
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
                    
                    <div className="skin-overlay">
                      <div className="skin-info-compact">
                        <h4>{skin.nombre}</h4>
                        <p className="skin-price-compact">
                          {skin.precio === 0 ? '🆓 GRATIS' : `💰 $${skin.precio}`}
                        </p>
                        <div className="skin-badge-compact">✅ Descargada</div>
                        <button 
                          className="download-skin-button-compact"
                          onClick={() => handleDescargarSkin(skin)}
                        >
                          📥 Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No has descargado ninguna skin aún</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Eliminar Cuenta</h2>
              <button className="modal-close" onClick={handleCloseDeleteModal}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="warning-box">
                <p><strong>⚠️ ADVERTENCIA: Esta acción es irreversible</strong></p>
                <p>Si eliminas tu cuenta, perderás permanentemente:</p>
                <ul>
                  <li>🗂️ Tu perfil y estadísticas</li>
                  <li>📤 Todas tus skins subidas ({skinsSubidas.length})</li>
                  <li>🛒 Tus skins compradas ({skinsCompradas.length})</li>
                  <li>💰 Tu saldo actual: ${user.wallet?.toFixed(2) || '0.00'}</li>
                </ul>
              </div>

              <div className="profile-form-group">
                <label>Confirma tu contraseña para continuar:</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  disabled={isDeleting}
                  className="delete-password-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-button cancel-button" 
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="modal-button delete-button" 
                onClick={handleDeleteProfile}
                disabled={isDeleting || !deletePassword}
              >
                {isDeleting ? '⏳ Eliminando...' : '🗑️ Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile