const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const { v4: uuidv4 } = require('uuid');

// 🔐 Génération du token JWT
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, role } = req.body;

    // ✅ Validation des champs requis
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Les champs email, password et role sont obligatoires.' });
    }

    // ✅ Validation du rôle
    const validRoles = ['client', 'admin', 'formateur'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide. Utilisez client, admin ou formateur.' });
    }

    // ✅ Vérification de l’unicité de l’email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    // ✅ Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Création de l’utilisateur
    const newUser = await User.create({
      uuid: uuidv4(),
      nom,
      prenom,
      email,
      password: hashedPassword,
      role
      // Le champ status est géré automatiquement par le modèle
    });

    // ✅ Message selon le rôle
    const message =
      role === 'formateur'
        ? "Formateur enregistré. En attente d'approbation par l'admin."
        : 'Client enregistré avec succès.';

    // ✅ Génération du token uniquement pour les clients/admins
    const token = role !== 'formateur' ? signToken(newUser) : null;

    // ✅ Réponse
    res.status(201).json({
      message,
      ...(token && { token }),
      user: {
        id: newUser._id,
        uuid: newUser.uuid,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      }
    });
  } catch (err) {
    console.error('❌ Erreur lors de l’inscription :', err.message);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};
