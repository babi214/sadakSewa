const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const {
  registerLimiter,
  otpEmailLimiter,
  otpVerifyLimiter,
} = require("../middleware/rateLimitMiddleware");

const {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  updateProfilePicture,
} = require("../controllers/authController");

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginUser);
router.patch("/verify-email", otpVerifyLimiter, verifyEmail);
router.post("/forgot-password", otpEmailLimiter, forgotPassword);
router.patch("/reset-password", otpVerifyLimiter, resetPassword);
router.patch("/change-password", protect, changePassword);
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.patch(
  "/profile/picture",
  protect,
  upload.single("profilePicture"),
  updateProfilePicture
);

module.exports = router;
