const jwt = require("jsonwebtoken");

module.exports = function optionalToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // 👉 Pas de token = mode invité
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // utilisateur connecté
  } catch (error) {
    console.warn("Token invalide → mode invité");
    req.user = null; // 🔥 important : ne bloque pas
  }

  next();
};