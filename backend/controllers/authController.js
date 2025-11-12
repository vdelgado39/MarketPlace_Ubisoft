// authController.js

import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Registro de usuario
export const register = async (req, res) => {
  const { username, email, password, nombre, avatar } = req.body
  console.log('Registro: datos recibidos:', req.body)
  try {
    // Validar que email y username no existan
    const userExist = await User.findOne({ $or: [{ email }, { username }] })
    if (userExist) {
      return res.status(409).json({ success: false, error: 'Email o usuario ya registrado' })
    }

    // Hashear password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Crear usuario
    const user = new User({
      username,
      email,
      password: hashedPassword,
      nombre,
      avatar
    })

    await user.save()
    console.log('Usuario guardado con ID:', user._id)
    
    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        avatar: user.avatar,
        fechaRegistro: user.fechaRegistro,
        wallet: user.wallet
      },
      message: 'Usuario registrado exitosamente'
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Login de usuario
export const login = async (req, res) => {
  const { identifier, password } = req.body // identifier puede ser email o username

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    })

    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' })
    }

    // Validar password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' })
    }

    // Crear token JWT
    const payload = {
      userId: user._id,
      username: user.username
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

    return res.status(200).json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        avatar: user.avatar,
        fechaRegistro: user.fechaRegistro,
        wallet: user.wallet
      },
      message: 'Inicio de sesión exitoso'
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Obtener perfil actual (ruta protegida)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }
    return res.status(200).json({ success: true, data: user })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Actualizar perfil (ruta protegida)
export const updateProfile = async (req, res) => {
  try {
    const { nombre, avatar, username, email, passwordActual, nuevoPassword } = req.body

    const updates = {}
    if (nombre) updates.nombre = nombre
    if (avatar) updates.avatar = avatar
    if (username) updates.username = username
    if (email) updates.email = email

    console.log("Actualizando perfil del usuario:", req.user.userId)
    console.log("Datos recibidos:", updates)

    // Si el usuario quiere cambiar la contraseña
    if (passwordActual && nuevoPassword) {
      const user = await User.findById(req.user.userId)
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
      }

      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(passwordActual, user.password)
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'La contraseña actual es incorrecta' })
      }

      // Hashear nueva contraseña
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(nuevoPassword, salt)
      updates.password = hashedPassword
    }

    // Actualizar usuario
    const userUpdated = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true
    }).select('-password')

    if (!userUpdated) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }

    return res.status(200).json({
      success: true,
      data: userUpdated,
      message: 'Perfil actualizado exitosamente'
    })
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return res.status(500).json({
      success: false,
      error: 'Error en el servidor al actualizar perfil'
    })
  }
}

// Eliminar perfil (ruta protegida)
export const deleteProfile = async (req, res) => {
  try {
    const { password } = req.body

    console.log("Eliminando perfil del usuario:", req.user.userId)

    // Buscar usuario
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }

    // Verificar contraseña para confirmar eliminación
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Contraseña incorrecta' })
    }

    // Eliminar usuario
    await User.findByIdAndDelete(req.user.userId)

    console.log("Usuario eliminado exitosamente:", req.user.userId)

    return res.status(200).json({
      success: true,
      message: 'Perfil eliminado exitosamente'
    })
  } catch (error) {
    console.error("Error al eliminar perfil:", error)
    return res.status(500).json({
      success: false,
      error: 'Error en el servidor al eliminar perfil'
    })
  }
}