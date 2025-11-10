import { useState, useEffect } from 'react'
import './FormStyles.css'

function EditarSkinForm({ skin, onClose, onSubmit }) {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: '',
    archivo: null
  })
  
  const [previewImage, setPreviewImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Categorías disponibles
  const categorias = [
    { value: '', label: 'Selecciona una categoría' },
    { value: 'armas', label: '⚔️ Armas' },
    { value: 'personajes', label: '🧙‍♂️ Personajes' },
    { value: 'vehiculos', label: '🚗 Vehículos' },
    { value: 'accesorios', label: '👑 Accesorios' },
    { value: 'efectos', label: '✨ Efectos Especiales' },
    { value: 'otros', label: '📦 Otros' }
  ]

  // Cargar datos de la skin al montar el componente
  useEffect(() => {
    if (skin) {
      setFormData({
        nombre: skin.nombre || '',
        descripcion: skin.descripcion || '',
        precio: skin.precio || '',
        categoria: skin.categoria || '',
        archivo: null // No cargamos el archivo existente
      })

      // Mostrar imagen existente
      if (skin.archivo instanceof File) {
        setPreviewImage(URL.createObjectURL(skin.archivo))
      } else if (skin.imagen_url) {
        setPreviewImage(skin.imagen_url)
      }
    }
  }, [skin])

  // Manejar cambios en inputs de texto
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Manejar selección de archivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          archivo: 'Por favor selecciona una imagen válida'
        }))
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          archivo: 'La imagen debe ser menor a 5MB'
        }))
        return
      }

      setFormData(prev => ({
        ...prev,
        archivo: file
      }))

      // Crear preview de la nueva imagen
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target.result)
      }
      reader.readAsDataURL(file)

      // Limpiar error
      if (errors.archivo) {
        setErrors(prev => ({
          ...prev,
          archivo: ''
        }))
      }
    }
  }

  // Abrir selector de archivos
  const handleFileButtonClick = () => {
    document.getElementById('fileInputEdit').click()
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }

    if (!formData.precio) {
      newErrors.precio = 'El precio es requerido'
    } else if (isNaN(formData.precio) || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser un número válido mayor a 0'
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Llamar función de callback con los datos actualizados
      if (onSubmit) {
        await onSubmit(skin.id, formData)
      }
      
      // Cerrar formulario
      onClose()
      
    } catch (error) {
      console.error('Error al actualizar skin:', error)
      setErrors({ submit: 'Error al actualizar la skin. Inténtalo de nuevo.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar cancelación
  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <div className="header-content">
            <h2>✏️ Editar Skin</h2>
            {skin && (
              <div className="juego-seleccionado-header">
                <span className="juego-icon">{skin.juego?.imagen || '🎮'}</span>
                <span className="juego-nombre">{skin.juego?.nombre || 'Juego'}</span>
              </div>
            )}
          </div>
          <button className="close-button" onClick={onClose}>✖️</button>
        </div>

        <form className="skin-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Lado izquierdo - Campos del formulario */}
            <div className="form-fields">
              {/* Nombre */}
              <div className="field-group">
                <label htmlFor="nombre">Nombre de la Skin *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Dragon Slayer Elite"
                  className={errors.nombre ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.nombre && <span className="error-message">{errors.nombre}</span>}
              </div>

              {/* Descripción */}
              <div className="field-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe tu skin..."
                  rows={4}
                  className={errors.descripcion ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
              </div>

              {/* Archivo */}
              <div className="field-group">
                <label>Cambiar Imagen (opcional)</label>
                <div className="file-input-group">
                  <input
                    type="text"
                    value={formData.archivo ? formData.archivo.name : 'Sin cambios'}
                    placeholder="Mantener imagen actual"
                    readOnly
                    className="file-display"
                  />
                  <button
                    type="button"
                    className="file-button"
                    onClick={handleFileButtonClick}
                    disabled={isSubmitting}
                  >
                    📁
                  </button>
                  <input
                    type="file"
                    id="fileInputEdit"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.archivo && <span className="error-message">{errors.archivo}</span>}
              </div>

              {/* Precio */}
              <div className="field-group">
                <label htmlFor="precio">Precio (USD) *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={errors.precio ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.precio && <span className="error-message">{errors.precio}</span>}
              </div>

              {/* Categoría */}
              <div className="field-group">
                <label htmlFor="categoria">Categoría *</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className={`filter-select ${errors.categoria ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.categoria && <span className="error-message">{errors.categoria}</span>}
              </div>
            </div>

            {/* Lado derecho - Preview de la imagen */}
            <div className="image-preview-section">
              <div className="image-preview-container">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="preview-image"
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span className="placeholder-icon">🖼️</span>
                    <p>Vista previa de la imagen</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error de envío */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          {/* Indicador de carga */}
          {isSubmitting && (
            <div className="loading-indicator">
              <div className="loading-spinner">⏳</div>
              <p>Actualizando skin...</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Actualizando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarSkinForm