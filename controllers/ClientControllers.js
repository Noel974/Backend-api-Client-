const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// 🔐 Register
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse } = req.body;

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const newClient = new Client({
      uuid: uuidv4(),
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
    });

    await newClient.save();

    const { motDePasse: _, ...clientSansMdp } = newClient.toObject();
    res.status(201).json({ message: 'Client enregistré avec succès.', client: clientSansMdp });
  } catch (error) {
    console.error("❌ Erreur dans register :", error.message);
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
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

    const token = jwt.sign(
      { uuid: client.uuid, email: client.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    const { motDePasse: _, ...clientSansMdp } = client.toObject();
    res.status(200).json({ message: 'Connexion réussie.', token, client: clientSansMdp });
  } catch (error) {
    console.error("❌ Erreur dans login :", error.message);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};

// 📥 Get client (via token)
exports.getClient = async (req, res) => {
  try {
    const { uuid } = req.client;
    const client = await Client.findOne({ uuid });

    if (!client) return res.status(404).json({ message: 'Client non trouvé.' });

    const { motDePasse: _, ...clientSansMdp } = client.toObject();
    res.status(200).json(clientSansMdp);
  } catch (error) {
    console.error("❌ Erreur dans getClient :", error.message);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};

// ✏️ Update client (via token)
exports.updateClient = async (req, res) => {
  try {
    const uuid = req.client.uuid;
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

// ❌ Delete client (via token)
exports.deleteClient = async (req, res) => {
  try {
    const uuid = req.client.uuid;
    const deleted = await Client.findOneAndDelete({ uuid });

    if (!deleted) return res.status(404).json({ message: 'Client non trouvé.' });

    res.status(200).json({ message: 'Client supprimé.' });
  } catch (error) {
    console.error("❌ Erreur dans deleteClient :", error.message);
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};
