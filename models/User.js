const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  age: { type: Number, required: true },
  username: { type: String, required: true, unique: true },
  profileImage: { type: Buffer, required: true }, 
  contentType: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
