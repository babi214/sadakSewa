const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getAllUsers, updateUser, toggleUserActive } = require("../controllers/userController");

router.get("/", protect, adminOnly, getAllUsers);
router.patch("/:id", protect, adminOnly, updateUser);
router.patch("/:id/toggle-active", protect, adminOnly, toggleUserActive);

module.exports = router;
