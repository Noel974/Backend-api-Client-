import Cours from "../models/Initiation.js";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../utils/config_multer.js";

// Champs autorisés pour update
const allowedFields = [
  "type",
  "titre",
  "introduction",
  "objectif",
  "outils",
  "pedagogique",
  "methode",
  "avantage",
  "conclusion",
];

// 🔧 Fonction utilitaire : upload PDF Cloudinary
const uploadPdf = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "pdfs",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          public_id: result.public_id,
          name: file.originalname || "document.pdf",
        });
      }
    );

    stream.end(file.buffer);
  });
};

// 🔧 Fonction utilitaire : suppression PDF Cloudinary
const deletePdf = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id, {
      resource_type: "raw",
    });
  } catch (err) {
    console.warn("Erreur suppression PDF Cloudinary:", err.message);
  }
};

// 🟢 CREATE COURS
export const createCours = async (req, res) => {
  try {
    const body = req.body;

    // Validation minimale
    if (!body.titre || !body.introduction) {
      return res.status(400).json({
        success: false,
        message: "Champs obligatoires manquants",
      });
    }

    // Parse vidéo YouTube
    let videoYoutube = {};
    if (body.videoYoutube) {
      try {
        videoYoutube =
          typeof body.videoYoutube === "string"
            ? JSON.parse(body.videoYoutube)
            : body.videoYoutube;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Format videoYoutube invalide",
        });
      }
    }

    // Upload PDF
    const pdfFiles = req.files?.pdfs || [];
    const uploadedPdfs = await Promise.all(pdfFiles.map(uploadPdf));

    // Création du cours
    const cours = await Cours.create({
      uuid: uuidv4(),
      titre: body.titre,
      type: body.type,
      introduction: body.introduction,
      objectif: body.objectif,
      outils: body.outils,
      pedagogique: body.pedagogique,
      methode: body.methode,
      avantage: body.avantage,
      conclusion: body.conclusion,
      formateur: req.user.id,
      pdfs: uploadedPdfs,
      videoYoutube,
    });

    res.status(201).json({
      success: true,
      message: "Cours créé avec succès",
      data: cours,
    });
  } catch (err) {
    console.error("🔥 CREATE COURS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du cours",
      error: err.message,
    });
  }
};

// 🟠 UPDATE COURS
export const updateCours = async (req, res) => {
  try {
    const cours = await Cours.findOne({
      _id: req.params.id,
      formateur: req.user.id,
    });

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours introuvable ou non autorisé",
      });
    }

    const body = req.body;

    // Update champs texte
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        cours[field] = body[field];
      }
    });

    // Update vidéo YouTube
    if (body.videoYoutube) {
      try {
        cours.videoYoutube =
          typeof body.videoYoutube === "string"
            ? JSON.parse(body.videoYoutube)
            : body.videoYoutube;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Format videoYoutube invalide",
        });
      }
    }

    // Update PDF
    const pdfFiles = req.files?.pdfs || [];
    if (pdfFiles.length > 0) {
      // Supprimer anciens PDF
      if (cours.pdfs?.length > 0) {
        await Promise.all(
          cours.pdfs.map((pdf) => pdf.public_id && deletePdf(pdf.public_id))
        );
      }

      // Upload nouveaux PDF
      cours.pdfs = await Promise.all(pdfFiles.map(uploadPdf));
    }

    await cours.save();

    res.json({
      success: true,
      message: "Cours mis à jour avec succès",
      data: cours,
    });
  } catch (err) {
    console.error("Erreur updateCours :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour",
      error: err.message,
    });
  }
};

// 🔴 DELETE COURS
export const deleteCours = async (req, res) => {
  try {
    const cours = await Cours.findOne({
      _id: req.params.id,
      formateur: req.user.id,
    });

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours introuvable ou non autorisé",
      });
    }

    // Supprimer PDF Cloudinary
    if (cours.pdfs?.length > 0) {
      await Promise.all(
        cours.pdfs.map((pdf) => pdf.public_id && deletePdf(pdf.public_id))
      );
    }

    await Cours.deleteOne({ _id: cours._id });

    res.json({
      success: true,
      message: "Cours et fichiers supprimés avec succès",
    });
  } catch (err) {
    console.error("Erreur deleteCours :", err);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: err.message,
    });
  }
};

// 🟣 GET MY COURS
export const getMyCours = async (req, res) => {
  try {
    const cours = await Cours.find({ formateur: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: cours });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération",
      error: err.message,
    });
  }
};

// 🔵 GET ALL COURS
export const getAllCours = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type?.trim()) {
      filter.type = req.query.type.trim();
    }

    const cours = await Cours.find(filter)
      .populate("formateur", "nom prenom email paypalLink")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: cours });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération",
      error: err.message,
    });
  }
};

// 🔍 GET COURS BY ID
export const getCoursById = async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id).populate(
      "formateur",
      "nom prenom email paypalLink"
    );

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé",
      });
    }

    res.json({ success: true, data: cours });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: err.message,
    });
  }
};