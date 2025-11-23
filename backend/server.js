//server.js

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import skinRoutes from './routes/skinRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Conectar a la base de datos
connectDB()

// Middlewares
app.use(morgan('dev'))      // <-- Logger para ver solicitudes HTTP en consola
app.use(cors())
app.use(express.json({ limit: '10mb' })) 
app.use(express.urlencoded({ limit: '10mb', extended: true })) 

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/skins', skinRoutes)

app.get('/', (req, res) => {
  res.send('API Ubisoft Marketplace Backend funcionando ✅')
})

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' })
})

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
