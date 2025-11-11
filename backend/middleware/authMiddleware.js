// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'No autorizado, token faltante' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { userId, username }
    next()
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token no válido' })
  }
}
