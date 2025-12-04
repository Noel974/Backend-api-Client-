const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// 📊 Récupérer les statistiques pour le dashboard admin
exports.getDashboardStats = async (req, res) => {
  try {
    const clientCount = await User.countDocuments({ role: 'client' });
    const formateurCount = await User.countDocuments({ role: 'formateur' });
    const pendingFormateurCount = await User.countDocuments({ role: 'formateur', status: 'pending' });
    const activeFormateurCount = await User.countDocuments({ role: 'formateur', status: 'active' });

    res.json({
      clientCount,
      formateurCount,
      pendingFormateurCount,
      activeFormateurCount
    });
  } catch (error) {
    console.error("Erreur dans getDashboardStats:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 📋 Liste des formateurs en attente d'approbation
exports.getPendingFormateurs = async (req, res) => {
  try {
    const formateurs = await User.find({ role: 'formateur', status: 'pending' })
      .select('uuid nom prenom email createdAt');

    res.json({ formateurs });
  } catch (error) {
    console.error("Erreur dans getPendingFormateurs:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Approuver un formateur
exports.approveFormateur = async (req, res) => {
  try {
    const { uuid } = req.params;

    const formateur = await User.findOneAndUpdate(
      { uuid, role: 'formateur', status: 'pending' },
      { status: 'active' },
      { new: true }
    ).select('uuid nom prenom email status');

    if (!formateur) {
      return res.status(404).json({ message: "Formateur introuvable ou déjà approuvé." });
    }

    res.json({ message: "Formateur approuvé avec succès ✅", formateur });
  } catch (error) {
    console.error("Erreur dans approveFormateur:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🚫 Bloquer un formateur
exports.blockFormateur = async (req, res) => {
  try {
    const { uuid } = req.params;

    const formateur = await User.findOneAndUpdate(
      { uuid, role: 'formateur' },
      { status: 'blocked' },
      { new: true }
    ).select('uuid nom prenom email status');

    if (!formateur) {
      return res.status(404).json({ message: "Formateur introuvable." });
    }

    res.json({ message: "Formateur bloqué avec succès 🚫", formateur });
  } catch (error) {
    console.error("Erreur dans blockFormateur:", error.message);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
