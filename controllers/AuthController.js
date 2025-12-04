const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Users"); // Ton modèle unique

// 🔑 Connexion universelle
exports.loginAll = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // 🔐 Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    // 🚫 Vérifie le status SEULEMENT pour les formateurs
    if (user.role === 'formateur' && user.status !== 'active') {
      return res.status(403).json({
        message: `Votre compte formateur est "${user.status}".`,
      });
    }

    // 🎟️ Création du token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    // ✅ Réponse finale
    res.status(200).json({
      message: "Connexion réussie ✅",
      token,
      user: {
        id: user._id,
        uuid: user.uuid,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
        ...(user.role === 'formateur' && { status: user.status }) // 👈 inclut status seulement si formateur
      }
    });

  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

