const mongoose = require('mongoose');

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
    enum: ["informatique", "langues", "developpement", "autre"],
    required: true,
  },

  titre: { type: String, trim: true, maxlength: 500, required: true },
  introduction: { type: String, trim: true, maxlength: 2500, default: "" },
  objectif: { type: String, trim: true, maxlength: 2500, default: "" },
  outils: { type: String, trim: true, maxlength: 2500, default: "" },
  pedagogique: { type: String, trim: true, maxlength: 2500, default: "" },
  methode: { type: String, trim: true, maxlength: 2500, default: "" },
  avantage: { type: String, trim: true, maxlength: 2500, default: "" },
  conclusion: { type: String, trim: true, maxlength: 2500, default: "" },

  // 🔹 PDF (1 à 3 max)
  pdfs: {
    type: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        originalName: { type: String, default: "" }
      }
    ],
    validate: {
      validator: function (val) {
        return val.length <= 3;
      },
      message: "Maximum 3 PDF autorisés"
    },
    default: []
  },

  // 🔹 Vidéo YouTube
  videoYoutube: {
    url: {
      type: String,
      default: "",
      match: /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/
    },
    videoId: { type: String, default: "" }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔄 Mise à jour automatique
coursSchema.pre("save", function (next) {
  // mise à jour date
  this.updatedAt = Date.now();

  if (this.videoYoutube && this.videoYoutube.url) {
    const url = this.videoYoutube.url.trim();

    // Regex pour extraire le vrai ID YouTube (11 caractères)
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    if (!match) {
      return next(new Error("URL YouTube invalide"));
    }

    // 🔹 On extrait et stocke l'ID propre
    this.videoYoutube.videoId = match[1];

    // 🔹 Optionnel : normaliser l'URL (propre)
    this.videoYoutube.url = `https://www.youtube.com/watch?v=${match[1]}`;
  }

  next();
});

module.exports = mongoose.model("Initiation", coursSchema);