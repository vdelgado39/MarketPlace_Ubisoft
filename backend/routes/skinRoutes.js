// backend/routes/skinRoutes.js

import express from 'express'
import {
  getAllSkins,
  getSkinById,
  uploadSkin,
  buySkin,
  downloadSkin,
  getMySkins,
  updateSkin,
  deleteSkin
} from '../controllers/skinController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Rutas públicas (explorar skins)
router.get('/', getAllSkins)
router.get('/:id', getSkinById)

// Rutas de comentarios
router.get('/:id/comments', (req, res) => {
  res.status(200).json({ success: true, data: [] })
})
router.post('/:id/comments', protect, (req, res) => {
  res.status(501).json({ success: false, error: 'Comentarios no implementados aún' })
})

// Rutas protegidas (requieren autenticación)
router.post('/', protect, uploadSkin)
router.post('/:id/buy', protect, buySkin)
router.post('/:id/download', protect, downloadSkin)
router.get('/user/my-skins', protect, getMySkins)
router.put('/:id', protect, updateSkin)
router.delete('/:id', protect, deleteSkin)

export default router