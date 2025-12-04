const jwt = require("jsonwebtoken");

module.exports = function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Token manquant ou format incorrect" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // doit contenir id/uuid + role
    next();
  } catch (error) {
    console.error("Erreur verifyToken:", error.message);
    return res.status(403).json({ success: false, error: "Token invalide ou expiré" });
  }
};
