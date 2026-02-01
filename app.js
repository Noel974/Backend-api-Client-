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
  "http://127.0.0.1:8080",
  "http://localhost:5173", // dev
  "https://formation-box.online",
  "https://intercom-formateur.fun",
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
const authRoutes = require('./routes/AuthRoutes');
const registerRoutes = require('./routes/RegisterRoutes');
const dashboardAdminRoutes =require('./routes/AdminRoutes');
const dashboardFormateurRoutes = require('./routes/FormateurRoutes');
const initiationRoutes = require('./routes/InitiationRoutes');
const clientRoutes = require('./routes/ClientRoutes');

// 🛣️ Montage des routes
app.get("/", (req, res) => {
  res.send("✅ API Location fonctionne !");
});

app.use('/api/auth', authRoutes);
app.use('/api/regist', registerRoutes);
app.use('/api/dashboardadmin',dashboardAdminRoutes);
app.use('/api/dashboardformateur',dashboardFormateurRoutes);
app.use('/api/initiation',initiationRoutes);
app.use('/api/client',clientRoutes);

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