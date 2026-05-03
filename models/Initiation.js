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

  // 🔹 PDF
  pdfs: {
    type: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        name: { type: String, default: "" } // 🔥 renommé propre
      }
    ],
    validate: {
      validator: (val) => val.length <= 3,
      message: "Maximum 3 PDF autorisés"
    },
    default: []
  },

  // 🔹 Vidéo YouTube
  videoYoutube: {
    url: { type: String, default: "" },
    videoId: { type: String, default: "" }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


// =========================
// 🔥 PRE SAVE FIX
// =========================
coursSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  if (this.videoYoutube?.url) {
    const url = this.videoYoutube.url.trim();

    // 🔥 Extraction ID plus robuste
    const match =
      url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) ||
      url.match(/[?&]v=([a-zA-Z0-9_-]+)/) ||
      url.match(/embed\/([a-zA-Z0-9_-]+)/);

    if (!match) {
      return next(new Error("URL YouTube invalide"));
    }

    const videoId = match[1];

    // 🔥 Stockage propre
    this.videoYoutube.videoId = videoId;

    // 🔥 Format parfait pour iframe
    this.videoYoutube.url = `https://www.youtube.com/embed/${videoId}`;
  }

  next();
});

module.exports = mongoose.model("Initiation", coursSchema);