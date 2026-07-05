const stripe = require("../utils/config_stripe");
const User = require("../models/Users");

// 🚀 Créer compte Stripe Connect
exports.createStripeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable",
      });
    }

    if (user.role !== "formateur") {
      return res.status(403).json({
        success: false,
        message: "Seuls les formateurs peuvent créer un compte Stripe",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Votre compte doit être approuvé avant Stripe",
      });
    }

    // Si déjà créé
    if (user.stripeAccountId) {
      return res.status(200).json({
        success: true,
        message: "Compte Stripe déjà existant",
        stripeAccountId: user.stripeAccountId,
      });
    }

    // 🧾 Création du compte Stripe Connect
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    user.stripeAccountId = account.id;
    await user.save();

    // 🔗 Lien onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3100/stripe/refresh",
      return_url: "http://localhost:3100/stripe/success",
      type: "account_onboarding",
    });

    return res.status(200).json({
      success: true,
      url: accountLink.url,
    });

  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur Stripe",
    });
  }
};

exports.getStripeStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.stripeAccountId) {
      return res.status(404).json({
        success: false,
        message: "Compte Stripe introuvable",
      });
    }

    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    return res.status(200).json({
      success: true,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
    });

  } catch (error) {
    console.error("Stripe status error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du statut Stripe",
    });
  }
};
