require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');

const clientRoutes = require('./routes/ClientRoutes');

const app = express();

// Sécurité HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Parsing des requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
const allowedOrigins = ["http://127.0.0.1:8080"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.get("/", (req, res) => {
  res.send("✅ API Location fonctionne !");
});
app.use('/api/clients', clientRoutes);

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("❌ Erreur non gérée :", err.stack);
  res.status(500).json({ message: "Erreur serveur interne." });
});

// Connexion MongoDB
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
