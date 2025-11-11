import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'
import { authService } from '../services/authService'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nombre: '',
    password: '',
    confirmPassword: '',
    avatar: '👤'
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Lista de avatares disponibles
  const avatares = ['👤', '🧑', '👨', '👩', '🧔', '👨‍💼', '👩‍💼', '🧑‍🎨', '🧑‍💻', '🎮', '🥷', '⚔️', '🔫', '🏹', '🎯']

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Seleccionar avatar
  const handleAvatarSelect = (avatar) => {
    setFormData(prev => ({
      ...prev,
      avatar
    }))
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'Usuario es requerido'
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres'
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre es requerido'
    }

    // Password
    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const result = await authService.register(formData)

      if (result.success) {
        alert(`¡Bienvenido ${formData.username}! Tu cuenta ha sido creada exitosamente.`)
        navigate('/login') // o '/' si quieres que se loguee directamente
      } else {
        setErrors({ submit: result.error })
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Error al registrar usuario' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card register-card">
          {/* Header */}
          <div className="auth-header">
            <h1>🎮 MarketPlace Ubisoft</h1>
            <h2>Crear Cuenta</h2>
            <p>Únete a la comunidad de skins</p>
          </div>

          {/* Formulario */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Usuario */}
            <div className="form-group">
              <label htmlFor="username">Usuario *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Ej: gamer123"
                className={errors.username ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                className={errors.email ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Nombre completo */}
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Juan Pérez"
                className={errors.nombre ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.nombre && (
                <span className="error-message">{errors.nombre}</span>
              )}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                className={errors.password ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repite tu contraseña"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Seleccionar Avatar */}
            <div className="form-group">
              <label>Selecciona tu Avatar</label>
              <div className="avatar-selector">
                {avatares.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    className={`avatar-option ${formData.avatar === avatar ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(avatar)}
                    disabled={isSubmitting}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
              <div className="avatar-preview">
                <span className="avatar-large">{formData.avatar}</span>
                <p>Avatar seleccionado</p>
              </div>
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="submit-error">
                {errors.submit}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Creando cuenta...' : '🚀 Crear Cuenta'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>¿Ya tienes cuenta?</p>
            <Link to="/login" className="auth-link">
              Iniciar sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register