const express = require("express");
const router = express.Router();
const multer = require("multer");

const { protect } = require("../middleware/authMiddleware");
const { analyzeImage, createAiReport } = require("../controllers/aiController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", protect, upload.single("image"), analyzeImage);
router.post("/report", protect, createAiReport);

module.exports = router;
