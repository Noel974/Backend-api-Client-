module.exports = function verifyRole(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, error: "Utilisateur non authentifié" });
    }

    if (!user.role) {
      return res.status(403).json({ success: false, error: "Rôle utilisateur non défini" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, error: "Accès refusé : rôle insuffisant" });
    }

    next();
  };
};
