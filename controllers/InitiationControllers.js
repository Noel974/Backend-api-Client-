const Cours = require("../models/Initiation");
const User = require("../models/Users");
const { v4: uuidv4 } = require("uuid");

// 🟢 Créer un cours (formateur uniquement)
exports.createCours = async (req, res) => {
  try {
    const cours = await Cours.create({
      uuid: uuidv4(),
      ...req.body,
      formateur: req.user.id,
    });

    res.status(201).json({
      message: "Cours créé avec succès",
      cours,
    });
  } catch (err) {
    console.error("Erreur createCours :", err);
    res.status(500).json({ message: "Erreur lors de la création du cours", error: err.message });
  }
};

// 🟠 Mettre à jour un cours (formateur propriétaire uniquement)
exports.updateCours = async (req, res) => {
  try {
    const cours = await Cours.findOne({
      _id: req.params.id,
      formateur: req.user.id,
    });

    if (!cours) {
      return res.status(404).json({ message: "Cours introuvable ou non autorisé" });
    }

    Object.assign(cours, req.body);
    await cours.save();

    res.json({ message: "Cours mis à jour avec succès", cours });
  } catch (err) {
    console.error("Erreur updateCours :", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
  }
};

// 🔴 Supprimer un cours (formateur propriétaire uniquement)
exports.deleteCours = async (req, res) => {
  try {
    const cours = await Cours.findOneAndDelete({
      _id: req.params.id,
      formateur: req.user.id,
    });

    if (!cours) {
      return res.status(404).json({ message: "Cours introuvable ou non autorisé" });
    }

    res.json({ message: "Cours supprimé avec succès" });
  } catch (err) {
    console.error("Erreur deleteCours :", err);
    res.status(500).json({ message: "Erreur lors de la suppression", error: err.message });
  }
};

// 🟣 Voir les cours du formateur connecté
exports.getMyCours = async (req, res) => {
  try {
    const cours = await Cours.find({ formateur: req.user.id })
      .sort({ createdAt: -1 });

    res.json(cours);
  } catch (err) {
    console.error("Erreur getMyCours :", err);
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// 🔵 Voir les cours publics pour les clients (avec filtre par type)
exports.getAllCours = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};

    if (type && typeof type === "string" && type.trim() !== "") {
      filter.type = type.trim();
    }

    const cours = await Cours.find(filter)
      .populate("formateur", "nom prenom email paypalLink status")
      .sort({ createdAt: -1 });

    res.json(cours);
  } catch (err) {
    console.error("Erreur getAllCours :", err);
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// 🔍 Voir un cours par ID
exports.getCoursById = async (req, res) => {
  console.log("Requête reçue pour ID:", req.params.id);

  try {
    const cours = await Cours.findById(req.params.id)
      .populate("formateur", "nom prenom email paypalLink status");

    if (!cours) {
      return res.status(404).json({ success: false, message: "Cours non trouvé" });
    }

    res.json({ success: true, cours });
  } catch (err) {
    console.error("Erreur getCoursById :", err);
    res.status(500).json({ success: false, message: "Erreur serveur", error: err.message });
  }
};
