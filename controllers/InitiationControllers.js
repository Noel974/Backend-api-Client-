const crypto = require("crypto");
const Cours = require("../models/Initiation");
const User = require("../models/Users");
const { v4: uuidv4 } = require("uuid");

// 🟢 Créer un cours (formateur uniquement)
exports.createCours = async (req, res) => {
  try {
    const cours = await Cours.create({
      uuid: uuidv4(),
      ...req.body,
      formateur: req.user.id, // le formateur connecté
    });

    res.status(201).json({
      message: "Cours créé avec succès",
      cours,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🟠 Mettre à jour un cours (seulement par le formateur propriétaire)
exports.updateCours = async (req, res) => {
  try {
    const cours = await Cours.findOne({
      _id: req.params.id,
      formateur: req.user.id, // ne permet que la maj de ses propres cours
    });

    if (!cours) {
      return res.status(404).json({ message: "Cours introuvable ou non autorisé" });
    }

    Object.assign(cours, req.body);
    await cours.save();

    res.json({ message: "Cours mis à jour avec succès", cours });
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    res.status(400).json({ message: err.message });
  }
};

// 🟣 Voir les cours du formateur connecté
exports.getMyCours = async (req, res) => {
  try {
    const cours = await Cours.find({ formateur: req.user.id }).sort({ createdAt: -1 });
    res.json(cours);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🔵 Voir les cours publics pour les clients (avec filtre par type)
exports.getAllCours = async (req, res) => {
  try {
    const { type } = req.query; // /cours?type=informatique
    const filter = {};

    if (type) {
      filter.type = type; // filtrer par type si présent
    }

    const cours = await Cours.find(filter)
      .populate("formateur", "nom prenom email paypalLink") // affiche les infos formateur
      .sort({ createdAt: -1 });

    res.json(cours);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCoursById = async (req, res) => {
    console.log("Requête reçue pour ID:", req.params.id);

  try {
    const cours = await Cours.findById(req.params.id)
      .populate("formateur", "nom prenom email paypalLink",);

    if (!cours) {
      return res.status(404).json({ success: false, message: "Cours non trouvé" });
    }

    res.json({ success: true, cours });
  } catch (err) {
    console.error("Erreur getCoursById:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

