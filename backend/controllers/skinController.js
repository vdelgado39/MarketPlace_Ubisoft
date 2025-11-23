// backend/controllers/skinController.js

import Skin from '../models/Skin.js'
import User from '../models/User.js'
import mongoose from 'mongoose'

// Obtener todas las skins (público - explorar)
export const getAllSkins = async (req, res) => {
  try {
    const { categoria, precioMin, precioMax, buscar, ordenar } = req.query

    // Construir filtros
    let filtros = { activo: true }

    if (categoria && categoria !== 'Todas') {
      filtros.categoria = categoria
    }

    if (precioMin || precioMax) {
      filtros.precio = {}
      if (precioMin) filtros.precio.$gte = Number(precioMin)
      if (precioMax) filtros.precio.$lte = Number(precioMax)
    }

    if (buscar) {
      filtros.$or = [
        { nombre: { $regex: buscar, $options: 'i' } },
        { descripcion: { $regex: buscar, $options: 'i' } },
        { tags: { $regex: buscar, $options: 'i' } }
      ]
    }

    // Ordenamiento
    let orden = {}
    switch (ordenar) {
      case 'precioAsc':
        orden = { precio: 1 }
        break
      case 'precioDesc':
        orden = { precio: -1 }
        break
      case 'masDescargadas':
        orden = { descargas: -1 }
        break
      case 'masCompradas':
        orden = { compras: -1 }
        break
      case 'recientes':
        orden = { fechaCreacion: -1 }
        break
      default:
        orden = { fechaCreacion: -1 }
    }

    const skins = await Skin.find(filtros)
      .populate('usuarioCreador', 'username nombre avatar')
      .sort(orden)

    return res.status(200).json({
      success: true,
      data: skins,
      total: skins.length
    })
  } catch (error) {
    console.error('Error al obtener skins:', error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Obtener una skin por ID (público)
export const getSkinById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'ID de skin inválido' })
    }

    const skin = await Skin.findById(id).populate('usuarioCreador', 'username nombre avatar')

    if (!skin) {
      return res.status(404).json({ success: false, error: 'Skin no encontrada' })
    }

    return res.status(200).json({
      success: true,
      data: skin
    })
  } catch (error) {
    console.error('Error al obtener skin:', error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Subir una nueva skin (protegido)
export const uploadSkin = async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, categoria, urlArchivo, tags } = req.body
    const usuarioCreador = req.user.userId

    console.log('Subiendo skin:', { nombre, usuarioCreador })

    // Validaciones
    if (!nombre || !precio || !urlArchivo) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nombre, precio y URL del archivo son obligatorios' 
      })
    }

    // Crear nueva skin
    const newSkin = new Skin({
      nombre,
      descripcion,
      precio,
      imagen,
      categoria,
      usuarioCreador,
      urlArchivo,
      tags: tags || []
    })

    await newSkin.save()

    // Agregar la skin al array de skinsSubidas del usuario
    await User.findByIdAndUpdate(
      usuarioCreador,
      { $push: { skinsSubidas: newSkin._id } }
    )

    const skinPopulated = await Skin.findById(newSkin._id).populate('usuarioCreador', 'username nombre avatar')

    console.log('Skin subida exitosamente:', newSkin._id)

    return res.status(201).json({
      success: true,
      data: skinPopulated,
      message: 'Skin subida exitosamente'
    })
  } catch (error) {
    console.error('Error al subir skin:', error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Comprar una skin (protegido)
export const buySkin = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    console.log('Comprando skin:', { skinId: id, userId })

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'ID de skin inválido' })
    }

    // Buscar skin
    const skin = await Skin.findById(id)
    if (!skin) {
      return res.status(404).json({ success: false, error: 'Skin no encontrada' })
    }

    // Buscar usuario
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }

    // Validar que el usuario no sea el creador
    if (skin.usuarioCreador.toString() === userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'No puedes comprar tu propia skin' 
      })
    }

    // Validar que el usuario no haya comprado ya esta skin
    if (user.skinsCompradas.includes(id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Ya has comprado esta skin' 
      })
    }

    // Validar que el usuario tenga suficiente dinero
    if (user.wallet < skin.precio) {
      return res.status(400).json({ 
        success: false, 
        error: 'Saldo insuficiente en tu wallet' 
      })
    }

    // Realizar la transacción
    user.wallet -= skin.precio
    user.skinsCompradas.push(id)
    await user.save()

    // Incrementar contador de compras de la skin
    skin.compras += 1
    await skin.save()

    // Agregar dinero al creador de la skin
    await User.findByIdAndUpdate(
      skin.usuarioCreador,
      { $inc: { wallet: skin.precio } }
    )

    console.log('Skin comprada exitosamente')

    return res.status(200).json({
      success: true,
      data: {
        skin,
        nuevoSaldo: user.wallet
      },
      message: 'Skin comprada exitosamente'
    })
  } catch (error) {
    console.error('Error al comprar skin:', error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Descargar una skin (protegido)
export const downloadSkin = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    console.log('Descargando skin:', { skinId: id, userId })

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'ID de skin inválido' })
    }

    // Buscar skin
    const skin = await Skin.findById(id)
    if (!skin) {
      return res.status(404).json({ success: false, error: 'Skin no encontrada' })
    }

    // Buscar usuario
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }

    // Validar que la skin sea gratis O que el usuario la haya comprado O que sea el creador
    const esGratis = skin.precio === 0
    const esCreador = skin.usuarioCreador.toString() === userId
    const laCompro = user.skinsCompradas.includes(id)

    if (!esGratis && !esCreador && !laCompro) {
      return res.status(403).json({ 
        success: false, 
        error: 'Debes comprar esta skin antes de descargarla' 
      })
    }

    // Agregar a skinsDescargadas si no está ya
    if (!user.skinsDescargadas.includes(id)) {
      user.skinsDescargadas.push(id)
      await user.save()

      // Incrementar contador de descargas de la skin
      skin.descargas += 1
      await skin.save()
    }

    console.log('Skin descargada exitosamente')

    return res.status(200).json({
      success: true,
      data: {
        urlArchivo: skin.urlArchivo,
        nombre: skin.nombre
      },
      message: 'Skin lista para descargar'
    })
  } catch (error) {
    console.error('Error al descargar skin:', error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Obtener skins del usuario autenticado (protegido)
export const getMySkins = async (req, res) => {
  try {
    const userId = req.user.userId
    const { tipo } = req.query // 'subidas', 'compradas', 'descargadas'

    console.log('Obteniendo skins del usuario:', { userId, tipo })

    const user = await User.findById(userId)
      .populate('skinsSubidas')
      .populate('skinsCompradas')
      .populate('skinsDescargadas')

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }

    let skins
    switch (tipo) {
      case 'subidas':
        skins = user.skinsSubidas
        break
      case 'compradas':
        skins = user.skinsCompradas
        break
      case 'descargadas':
        skins = user.skinsDescargadas
        break
      default:
        // Si no especifica tipo, devolver todas
        return res.status(200).json({
          success: true,
          data: {
            skinsSubidas: user.skinsSubidas,
            skinsCompradas: user.skinsCompradas,
            skinsDescargadas: user.skinsDescargadas
          }
        })
    }

    return res.status(200).json({
      success: true,
      data: skins
    })
  } catch (error) {
    console.error('Error al obtener skins del usuario:', error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Actualizar una skin (protegido - solo el creador)
export const updateSkin = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId
    const { nombre, descripcion, precio, imagen, categoria, tags, activo } = req.body

    console.log('Actualizando skin:', { skinId: id, userId })

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'ID de skin inválido' })
    }

    // Buscar skin
    const skin = await Skin.findById(id)
    if (!skin) {
      return res.status(404).json({ success: false, error: 'Skin no encontrada' })
    }

    // Validar que el usuario sea el creador
    if (skin.usuarioCreador.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permiso para actualizar esta skin' 
      })
    }

    // Actualizar campos
    const updates = {}
    if (nombre) updates.nombre = nombre
    if (descripcion !== undefined) updates.descripcion = descripcion
    if (precio !== undefined) updates.precio = precio
    if (imagen !== undefined) updates.imagen = imagen
    if (categoria) updates.categoria = categoria
    if (tags) updates.tags = tags
    if (activo !== undefined) updates.activo = activo

    const skinUpdated = await Skin.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('usuarioCreador', 'username nombre avatar')

    console.log('Skin actualizada exitosamente')

    return res.status(200).json({
      success: true,
      data: skinUpdated,
      message: 'Skin actualizada exitosamente'
    })
  } catch (error) {
    console.error('Error al actualizar skin:', error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}

// Eliminar una skin (protegido - solo el creador)
export const deleteSkin = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    console.log('Eliminando skin:', { skinId: id, userId })

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'ID de skin inválido' })
    }

    // Buscar skin
    const skin = await Skin.findById(id)
    if (!skin) {
      return res.status(404).json({ success: false, error: 'Skin no encontrada' })
    }

    // Validar que el usuario sea el creador
    if (skin.usuarioCreador.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permiso para eliminar esta skin' 
      })
    }

    // Eliminar la skin de todos los usuarios que la tienen
    await User.updateMany(
      {},
      {
        $pull: {
          skinsSubidas: id,
          skinsCompradas: id,
          skinsDescargadas: id
        }
      }
    )

    // Eliminar la skin
    await Skin.findByIdAndDelete(id)

    console.log('Skin eliminada exitosamente')

    return res.status(200).json({
      success: true,
      message: 'Skin eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar skin:', error)
    return res.status(500).json({ success: false, error: 'Error en el servidor' })
  }
}