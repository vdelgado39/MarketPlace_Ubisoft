import mongoose from 'mongoose'
import User from '../models/User.js' 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log(`MongoDB conectado a base: ${conn.connection.name}`)
    console.log('Nombre de la colección:', User.collection.name)
    console.log(`MongoDB conectado: ${conn.connection.host}`)
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error)
    process.exit(1)
  }
}

async function imprimirUsuarios() {
  try {
    const usuarios = await User.find()  // trae todos los documentos de usuarios
    console.log('Usuarios en la colección:', usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
  }
}

imprimirUsuarios()

export default connectDB
