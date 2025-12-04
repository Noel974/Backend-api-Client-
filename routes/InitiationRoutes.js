const express = require("express");
const router = express.Router();
const initiationController = require("../controllers/InitiationControllers");
const verifyToken = require("../middleware/Token");
const verifyRole = require("../middleware/Role");

// Middleware combiné pour protéger les routes selon le rôle
const protect = (role) => [verifyToken, verifyRole(role)];

// ✅ Routes publiques
router.get("/cours",verifyToken, initiationController.getAllCours);
router.get("/cours/:id", verifyToken, initiationController.getCoursById);

// ✅ Routes protégées (formateur uniquement)
router.post("/cours", protect("formateur"), initiationController.createCours);
router.get("/mescours", protect("formateur"), initiationController.getMyCours);
router.put("/cours/:id", protect("formateur"), initiationController.updateCours);
router.delete("/cours/:id", protect("formateur"), initiationController.deleteCours);

module.exports = router;
