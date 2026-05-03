const express = require("express");
const router = express.Router();
const initiationController = require("../controllers/InitiationControllers");
const optionalToken = require("../middleware/Optimal");
const verifyToken = require("../middleware/Token");
const verifyRole = require("../middleware/Role");
const {upload} = require("../middleware/Multer_pdf");
const cloudinary = require("../utils/config_multer.js"); // 🔥 Import de Cloudinary pour l'upload des PDF

// Middleware combiné pour protéger les routes selon le rôle
const protect = (role) => [verifyToken, verifyRole(role)];

// ✅ Routes publiques
router.get("/cours",optionalToken, initiationController.getAllCours);
router.get("/cours/:id", optionalToken, initiationController.getCoursById);

// ✅ Routes protégées (formateur uniquement)
router.post(
  "/cours",
  protect("formateur"),
  upload.fields([
    { name: "pdfs", maxCount: 3 } // 🔥 seulement les fichiers ici
  ]),
  initiationController.createCours
);
router.get("/mescours", protect("formateur"), initiationController.getMyCours);
router.put(
  "/cours/:id",
  protect("formateur"),
  upload.fields([
    { name: "pdfs", maxCount: 3 } // si tu veux permettre update PDF
  ]),
  initiationController.updateCours
);
router.delete("/cours/:id", protect("formateur"), initiationController.deleteCours);

module.exports = router;
