const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true
  },
  nom: { type: String, trim: true },
  prenom: { type: String, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['client', 'admin', 'formateur'],
    required: true,
  },
status: {
  type: String,
  enum: ['pending', 'active', 'blocked'],
  default: function () {
    if (this.role === 'formateur') return 'pending';
    if (this.role === 'client') return 'active';
    return undefined;
  },
},
  paypalLink: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
