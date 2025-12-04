const mongoose = require("mongoose");

const coursSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },

  formateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    trim: true,
    maxlength: 20,
    enum: ["informatique", "langues", "developpement", "autre"], // 🔒 valeurs limitées
    required: true,
  },

  titre: { type: String, trim: true, maxlength: 50, required: true },
  introduction: { type: String, trim: true, maxlength: 2500 },
  objectif: { type: String, trim: true, maxlength: 2500 },

  pedagogique: { type: String, trim: true, maxlength: 2500 },
  methode: { type: String, trim: true, maxlength: 2500 },
  avantage: { type: String, trim: true, maxlength: 2500 },
  conclusion: { type: String, trim: true, maxlength: 2500 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🕒 Mise à jour auto de la date sur save
coursSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// 🕒 Mise à jour auto de la date sur update
coursSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// ⚡ Index pour optimiser les recherches par type
coursSchema.index({ type: 1 });

const Cours = mongoose.model("Cours", coursSchema);
module.exports = Cours;
