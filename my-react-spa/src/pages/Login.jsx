import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Validar formulario
  const validateForm = () => {
    const newErrors = {}

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email o usuario es requerido'
    }

    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida'
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
      const result = await login(formData)

      if (result.success) {
        alert(`¡Bienvenido ${result.data.username}!`)
        navigate('/')
      } else {
        setErrors({ submit: result.error })
      }
    } catch (error) {
      setErrors({ submit: 'Error al iniciar sesión' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <h1>🎮 MarketPlace Ubisoft</h1>
            <h2>Iniciar Sesión</h2>
            <p>Accede a tu cuenta para gestionar tus skins</p>
          </div>

          {/* Formulario */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Email o Usuario */}
            <div className="form-group">
              <label htmlFor="identifier">Email o Usuario</label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                placeholder="Ingresa tu email o usuario"
                className={errors.identifier ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.identifier && (
                <span className="error-message">{errors.identifier}</span>
              )}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Ingresa tu contraseña"
                className={errors.password ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
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
              {isSubmitting ? '⏳ Iniciando sesión...' : '🚀 Iniciar Sesión'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>¿No tienes cuenta?</p>
            <Link to="/register" className="auth-link">
              Registrarse aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login