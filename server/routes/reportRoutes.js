const express = require("express");
const router = express.Router();
const {
  createReport,
  getAllReports,
  getSingleReport,
  deleteReport,
  updateReportStatus,
  getNearbyReports,
  updateReport,
  getMyReports,
  toggleUpvote,
  assignWorker,
  getAssignedReports,
  getMyDashboard,
  getWorkerDashboard,
  getAdminDashboard,
  getReportHistory,
  getPublicStats,
  getAvailableWorkers,
} = require("../controllers/reportController");
const {
  protect,
  workerOnly,
  adminOnly,
} = require("../middleware/authMiddleware");


router.get("/", getAllReports);
router.get("/stats", getPublicStats);
router.get("/nearby", getNearbyReports);
router.get("/my-reports", protect, getMyReports);
router.get("/my-assigned", protect, workerOnly, getAssignedReports);
router.get("/my-dashboard", protect, getMyDashboard);
router.get("/worker-dashboard", protect, workerOnly, getWorkerDashboard);
router.get("/admin-dashboard", protect, adminOnly, getAdminDashboard);
//Test
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Test route works",
  });
});
router.get("/:id", getSingleReport);
router.get("/:id/available-workers", protect, adminOnly, getAvailableWorkers);
router.get("/:id/history", protect, getReportHistory);

router.post("/", protect, createReport);

router.put("/:id", protect, updateReport);

router.patch("/:id/status", protect, updateReportStatus);
router.patch("/:id/upvote", protect, toggleUpvote);
router.patch("/:id/assign", protect, adminOnly, assignWorker);

router.delete("/:id", protect, deleteReport);

module.exports = router;
