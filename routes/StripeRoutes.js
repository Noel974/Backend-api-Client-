const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/Token");
const verifyRole = require("../middleware/Role");

const stripeController = require("../controllers/StripeController");

// 🔐 Accès formateur uniquement
router.post(
  "/connect",
  verifyToken,
  verifyRole("formateur"),
  stripeController.createStripeAccount
);

router.get(
  "/status",
  verifyToken,
  verifyRole("formateur"),
  stripeController.getStripeStatus
);

module.exports = router;