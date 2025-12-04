const bcrypt = require("bcryptjs");
const User = require("../models/Users");

// 📥 Get formateur (via token)
exports.getFormateur = async (req, res) => {
  try {
    const { id } = req.user; // depuis le token
    const formateur = await User.findById(id);

    if (!formateur || formateur.role !== "formateur") {
      return res.status(404).json({ message: "Formateur non trouvé." });
    }

    // Grâce au toJSON du modèle, le mot de passe est déjà retiré
    res.status(200).json({ formateur });
  } catch (error) {
    console.error("❌ Erreur dans getFormateur :", error.message);
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ✏️ Update formateur (infos + lien PayPal)
exports.updateFormateur = async (req, res) => {
  try {
    const { id } = req.user;

    // 🔒 Sécurité : limiter les champs modifiables
    const allowedUpdates = ["nom", "prenom", "email", "password", "paypalLink"];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Si le formateur veut changer son mot de passe
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const formateur = await User.findById(id);
    if (!formateur || formateur.role !== "formateur") {
      return res.status(404).json({ message: "Formateur non trouvé." });
    }

    // ⚠️ Vérification du statut avant d’autoriser le lien PayPal
    if (updates.paypalLink && formateur.status !== "active") {
      return res.status(403).json({ message: "Votre compte n'est pas approuvé." });
    }

    // Mise à jour des champs autorisés
    Object.assign(formateur, updates);

    await formateur.save();

    res.status(200).json({ message: "Formateur mis à jour.", formateur });
  } catch (error) {
    console.error("❌ Erreur dans updateFormateur :", error.message);
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// ❌ Delete formateur (via token)
exports.deleteFormateur = async (req, res) => {
  try {
    const { id } = req.user;
    const deleted = await User.findOneAndDelete({ _id: id, role: "formateur" });

    if (!deleted) {
      return res.status(404).json({ message: "Formateur non trouvé." });
    }

    res.status(200).json({ message: "Formateur supprimé." });
  } catch (error) {
    console.error("❌ Erreur dans deleteFormateur :", error.message);
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};
