const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// 🔐 Register
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse } = req.body;

    // Vérifier si email déjà existant
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    // Hash mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Nouveau client
    const newClient = new Client({
      uuid: uuidv4(),
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
    });

    await newClient.save();

    // Supprimer motDePasse avant d’envoyer la réponse
    const { motDePasse: _, ...clientSansMdp } = newClient.toObject();

    console.log("🧪 Nouveau client enregistré :", clientSansMdp);

    res.status(201).json({ message: 'Client enregistré avec succès.', client: clientSansMdp });
  } catch (error) {
    console.error("❌ Erreur dans register :", error.message);
    res.status(500).json({
      message: "Erreur serveur.",
      error: error.message || "Erreur inconnue"
    });
  }
};

// 🔓 Login
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const client = await Client.findOne({ email });

    if (!client) return res.status(404).json({ message: 'Client non trouvé.' });

    const isValid = await bcrypt.compare(motDePasse, client.motDePasse);
    if (!isValid) return res.status(401).json({ message: 'Mot de passe incorrect.' });

    // Générer le token
    const token = jwt.sign(
      { uuid: client.uuid, email: client.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Supprimer motDePasse avant envoi
    const { motDePasse: _, ...clientSansMdp } = client.toObject();

    res.status(200).json({ message: 'Connexion réussie.', token, client: clientSansMdp });
  } catch (error) {
    console.error("❌ Erreur dans login :", error.message);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};

// 📥 Get client by UUID
exports.getClient = async (req, res) => {
  try {
    const { uuid } = req.params;
    const client = await Client.findOne({ uuid });

    if (!client) return res.status(404).json({ message: 'Client non trouvé.' });

    const { motDePasse: _, ...clientSansMdp } = client.toObject();

    res.status(200).json(clientSansMdp);
  } catch (error) {
    console.error("❌ Erreur dans getClient :", error.message);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};

// ✏️ Update client
exports.updateClient = async (req, res) => {
  try {
    const { uuid } = req.params;
    const updates = { ...req.body };

    if (updates.motDePasse) {
      updates.motDePasse = await bcrypt.hash(updates.motDePasse, 10);
    }

    const updatedClient = await Client.findOneAndUpdate({ uuid }, updates, { new: true });

    if (!updatedClient) return res.status(404).json({ message: 'Client non trouvé.' });

    const { motDePasse: _, ...clientSansMdp } = updatedClient.toObject();

    res.status(200).json({ message: 'Client mis à jour.', client: clientSansMdp });
  } catch (error) {
    console.error("❌ Erreur dans updateClient :", error.message);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};

// ❌ Delete client
exports.deleteClient = async (req, res) => {
  try {
    const { uuid } = req.params;
    const deleted = await Client.findOneAndDelete({ uuid });

    if (!deleted) return res.status(404).json({ message: 'Client non trouvé.' });

    res.status(200).json({ message: 'Client supprimé.' });
  } catch (error) {
    console.error("❌ Erreur dans deleteClient :", error.message);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};
