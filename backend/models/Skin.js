// backend/models/Skin.js

import mongoose from 'mongoose'

const skinSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
  },
  descripcion: { 
    type: String, 
    default: '' 
  },
  precio: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  imagen: { 
    type: String, 
    default: '' 
  },
  categoria: { 
    type: String, 
    enum: ['Personaje', 'Arma', 'Vehiculo', 'Objeto', 'Otro'], 
    default: 'Otro' 
  },
  usuarioCreador: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  descargas: { 
    type: Number, 
    default: 0 
  },
  compras: { 
    type: Number, 
    default: 0 
  },
  urlArchivo: { 
    type: String, 
    required: true 
  },
  tags: [{ 
    type: String 
  }],
  activo: { 
    type: Boolean, 
    default: true 
  }
})

// El tercer parámetro especifica explícitamente la colección 'skin'
const Skin = mongoose.model('Skin', skinSchema, 'skin')
console.log('Modelo Skin apunta a la colección:', Skin.collection.name)

export default Skin