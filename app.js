require('dotenv').config(); // Chargement des variables d'environnement

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Sécurité HTTP
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🔐 Configuration CORS
const allowedOrigins = [
  "http://127.0.0.1:8080", // dev
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
 
// 📦 Importation des routes

const clientRoutes = require('./routes/ClientRoutes');


// 🛣️ Montage des routes
app.get("/", (req, res) => {
  res.send("✅ API Location fonctionne !");
});

app.use('/api/clients', clientRoutes);


// 🧠 Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  const PORT = process.env.PORT || 3100;
  app.listen(PORT, () => console.log(`✅ API démarrée sur http://localhost:${PORT}`));
})
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB :', err);
});

module.exports = app;