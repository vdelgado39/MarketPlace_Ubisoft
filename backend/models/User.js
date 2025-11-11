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

const User = mongoose.model('User', userSchema)
export default User
