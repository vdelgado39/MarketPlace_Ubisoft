import { useState } from 'react'
import { useCreateSkin } from '../../hooks/useApi'
import './FormStyles.css'

function AgregarSkinForm({ juegoSeleccionado, onClose, onSubmit }) {
  // Hook personalizado para crear skins
  const { crearSkin, loading: isSubmitting, error: submitError, success, clearError } = useCreateSkin()

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

      // Crear preview de la imagen
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
    document.getElementById('fileInput').click()
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

    if (!formData.archivo) {
      newErrors.archivo = 'Selecciona una imagen para la skin'
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

    // Limpiar errores previos
    clearError()

    // Preparar datos para enviar a la API
    const skinDataParaAPI = {
      ...formData,
      juego: juegoSeleccionado
    }

    // Llamar a la API
    const result = await crearSkin(skinDataParaAPI)
    
    if (result.success) {
      // Notificar al componente padre
      if (onSubmit) {
        onSubmit(result.data)
      }
      
      // Cerrar formulario
      onClose()
      
      // Mostrar mensaje de éxito
      alert(`🎉 ¡Skin "${formData.nombre}" creada exitosamente para ${juegoSeleccionado.nombre}!`)
    }
    // El error se maneja automáticamente por el hook
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
            <h2>📝 Agregar Nueva Skin</h2>
            {juegoSeleccionado && (
              <div className="juego-seleccionado-header">
                <span className="juego-icon">{juegoSeleccionado.imagen}</span>
                <span className="juego-nombre">{juegoSeleccionado.nombre}</span>
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
                <label>Seleccionar Archivo *</label>
                <div className="file-input-group">
                  <input
                    type="text"
                    value={formData.archivo ? formData.archivo.name : ''}
                    placeholder="No se ha seleccionado ningún archivo"
                    readOnly
                    className={`file-display ${errors.archivo ? 'error' : ''}`}
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
                    id="fileInput"
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
          {(submitError || errors.submit) && (
            <div className="submit-error">
              {submitError || errors.submit}
            </div>
          )}

          {/* Indicador de carga */}
          {isSubmitting && (
            <div className="loading-indicator">
              <div className="loading-spinner">⏳</div>
              <p>Subiendo skin a la API...</p>
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
              {isSubmitting ? '⏳ Publicando...' : '🚀 Publicar Skin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AgregarSkinForm