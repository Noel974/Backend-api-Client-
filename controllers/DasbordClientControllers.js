const User = require('../models/Users'); // ton modèle User

// 📌 Voir le profil client
exports.getClient = async (req, res) => {
  try {
    const { id } = req.user; // récupéré depuis le token
    const client = await User.findById(id);

    if (!client || client.role !== "client") {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    // Grâce au toJSON du modèle, le mot de passe est déjà retiré
    res.status(200).json({ client });
  } catch (error) {
    console.error("❌ Erreur dans getClient :", error.message);
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// 📌 Modifier le profil client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.user; // depuis le token
    const updates = req.body;

    const client = await User.findOneAndUpdate(
      { _id: id, role: "client" },
      updates,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    res.status(200).json({ message: "Profil mis à jour avec succès.", client });
  } catch (error) {
    console.error("❌ Erreur dans updateClient :", error.message);
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};

// 📌 Supprimer le compte client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.user; // depuis le token

    const client = await User.findOneAndDelete({ _id: id, role: "client" });

    if (!client) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    res.status(200).json({ message: "Compte supprimé avec succès." });
  } catch (error) {
    console.error("❌ Erreur dans deleteClient :", error.message);
    res.status(500).json({ message: "Erreur serveur.", error });
  }
};
