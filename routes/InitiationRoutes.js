const express = require("express");
const router = express.Router();
const initiationController = require("../controllers/InitiationControllers");
const optionalToken = require("../middleware/Token");
const verifyToken = require("../middleware/Optimal");
const verifyRole = require("../middleware/Role");

// Middleware combiné pour protéger les routes selon le rôle
const protect = (role) => [verifyToken, verifyRole(role)];

// ✅ Routes publiques
router.get("/cours",optionalToken, initiationController.getAllCours);
router.get("/cours/:id", optionalToken, initiationController.getCoursById);

// ✅ Routes protégées (formateur uniquement)
router.post("/cours", protect("formateur"), initiationController.createCours);
router.get("/mescours", protect("formateur"), initiationController.getMyCours);
router.put("/cours/:id", protect("formateur"), initiationController.updateCours);
router.delete("/cours/:id", protect("formateur"), initiationController.deleteCours);

module.exports = router;
