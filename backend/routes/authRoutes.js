// backend/routes/authRoutes.js

import express from 'express'
import { register, login, getProfile, updateProfile } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Rutas públicas
router.post('/register', register)
router.post('/login', login)

// Rutas protegidas
router.get('/me', protect, getProfile)
router.put('/profile', protect, updateProfile)

export default router
