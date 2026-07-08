const Report = require("../models/reportModel");
const cloudinary = require("../config/cloudinary");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append("file", blob, req.file.originalname);

    const aiResponse = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      return res.status(502).json({
        success: false,
        message: `AI service error: ${errorText}`,
      });
    }

    const aiResult = await aiResponse.json();

    res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Failed to analyze image",
    });
  }
};

const createAiReport = async (req, res) => {
  try {
    const {
      image,
      annotatedImage,
      damageType,
      confidence,
      longitude,
      latitude,
      locationName,
    } = req.body;

    if (!image || !annotatedImage || !damageType || confidence === undefined || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    let annotatedUrl = annotatedImage;
    if (annotatedImage.startsWith("data:")) {
      const uploadResult = await cloudinary.uploader.upload(annotatedImage, {
        folder: "reports/annotated",
      });
      annotatedUrl = uploadResult.secure_url;
    }

    const report = await Report.create({
      title: `AI Detected: ${damageType}`,
      description: `Automatically detected ${damageType}.`,
      category: damageType === "pothole" ? "pothole" : damageType === "landslide" ? "landslide" : damageType === "garbage" ? "garbage" : damageType === "fire_smoke" ? "fire_smoke" : "road_damage",
      severity: confidence > 0.7 ? "high" : confidence > 0.4 ? "medium" : "low",
      images: [image],
      annotatedImage: annotatedUrl,
      reportedBy: req.user._id,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
      locationName: locationName || "",
      aiAnalysis: {
        detectedIssue: damageType,
        confidence: Number(confidence),
      },
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Failed to create report",
    });
  }
};

module.exports = { analyzeImage, createAiReport };
