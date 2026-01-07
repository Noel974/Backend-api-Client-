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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
