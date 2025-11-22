// backend/models/User.js

import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  nombre: { type: String, default: '' },
  avatar: { type: String, default: '👤' },
  fechaRegistro: { type: Date, default: Date.now },
  skinsSubidas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skin' }],
  skinsCompradas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skin' }],
  skinsDescargadas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skin' }],
  wallet: { type: Number, default: 100.0 }
})

// Aquí defines el modelo y Mongoose asocia el nombre del modelo a la colección.
// El tercer parámetro es opcional y especifica la colección explícitamente.
const User = mongoose.model('User', userSchema, 'usuarios')
console.log('Modelo User apunta a la colección:', User.collection.name)

export default User
