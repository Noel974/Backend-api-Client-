const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// ✅ Inscription client
exports.registerClient = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ message: "Tous les champs requis doivent être fournis." });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const client = await Client.create({
      uuid: uuidv4(),
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
    });

    res.status(201).json({
      message: "Inscription réussie !",
      client: {
        id: client._id,
        uuid: client.uuid,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email
      }
    });

  } catch (error) {
    console.error('🔥 Erreur dans registerClient :', error);
    res.status(500).json({ message: "Erreur lors de l'inscription.", error: error.message });
  }
};

// ✅ Connexion client
exports.loginClient = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const isMatch = await bcrypt.compare(motDePasse, client.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: client._id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Connexion réussie !",
      token,
      client: {
        id: client._id,
        uuid: client.uuid,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
      }
    });

  } catch (error) {
    console.error('🔥 Erreur dans loginClient :', error);
    res.status(500).json({ message: "Erreur lors de la connexion.", error: error.message });
  }
};

// ✅ Récupération profil client
exports.getClientProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id).select('-motDePasse');
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    res.status(200).json({ client });

  } catch (error) {
    console.error('🔥 Erreur dans getClientProfile :', error);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// ✅ Mise à jour du profil client
exports.updateClientProfile = async (req, res) => {
  try {
    const updates = req.body;
    const updateData = {};

    const allowedFields = ['nom', 'prenom', 'email', 'motDePasse', 'telephone', 'adresse'];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // Hash du mot de passe si fourni
    if (updateData.motDePasse) {
      updateData.motDePasse = await bcrypt.hash(updateData.motDePasse, 10);
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true, context: 'query' }
    ).select('-motDePasse');

    if (!updatedClient) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    res.status(200).json({
      message: "Profil mis à jour avec succès.",
      client: updatedClient
    });

  } catch (error) {
    console.error('🔥 Erreur dans updateClientProfile :', error);
    res.status(500).json({ message: "Erreur lors de la mise à jour.", error: error.message });
  }
};

// ✅ Suppression du compte client
exports.deleteClientAccount = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    await Client.findByIdAndDelete(req.user.id);

    res.status(200).json({ message: "Compte client et fichiers supprimés avec succès." });

  } catch (error) {
    console.error('🔥 Erreur deleteClientAccount :', error);
    res.status(500).json({ message: "Erreur lors de la suppression du compte.", error: error.message });
  }
};