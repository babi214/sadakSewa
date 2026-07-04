const Report = require("../models/reportModel");
const User = require("../models/userModel");
const ReportHistory = require("../models/reportHistoryModel");
const cloudinary = require("../config/cloudinary");
const { createNotification } = require("./notificationController");

const VALID_STATUSES = ["pending", "verified", "in_progress", "resolved", "rejected"];

const logHistory = async (reportId, action, performedBy, details = {}) => {
  await ReportHistory.create({ report: reportId, action, performedBy, details });
};

const merge = (left, right, compareFn) => {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }

  return [...result, ...left.slice(i), ...right.slice(j)];
};

const mergeSort = (arr, compareFn) => {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compareFn);
  const right = mergeSort(arr.slice(mid), compareFn);

  return merge(left, right, compareFn);
};

const SORT_COMPARATORS = {
  createdAt_desc: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  createdAt_asc: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  severity_desc: (a, b) => {
    const order = { high: 3, medium: 2, low: 1 };
    return (order[b.severity] || 0) - (order[a.severity] || 0);
  },
  severity_asc: (a, b) => {
    const order = { high: 3, medium: 2, low: 1 };
    return (order[a.severity] || 0) - (order[b.severity] || 0);
  },
  title_asc: (a, b) => a.title.localeCompare(b.title),
  title_desc: (a, b) => b.title.localeCompare(a.title),
};


const createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      municipality,
      locationName,
      longitude,
      latitude,
      images,
    } = req.body;

    if (!title || !description || !category || longitude === undefined || longitude === null || latitude === undefined || latitude === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const report = await Report.create({
      title,
      description,
      category,
      severity,
      municipality,
      locationName,
      images: images || [],
      reportedBy: req.user._id,
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    await logHistory(report._id, "created", req.user._id, { title: report.title });

    createNotification(req.user._id, 'Report Created', `Your report "${report.title}" has been submitted successfully.`, 'report_update', report._id);

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getAllReports = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = { $ne: "rejected" };
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.severity) filter.severity = req.query.severity;

    if (req.query.municipality) {
      filter.municipality = { $regex: req.query.municipality, $options: "i" };
    }

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
        { locationName: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const total = await Report.countDocuments(filter);

    const rawReports = await Report.find(filter)
      .populate("reportedBy", "fullName email profilePicture")
      .populate("assignedWorker", "fullName email");

    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";
    const comparatorKey = `${sortBy}_${order}`;
    const compareFn = SORT_COMPARATORS[comparatorKey] || SORT_COMPARATORS.createdAt_desc;

    const sortedReports = mergeSort(rawReports, compareFn);
    const paginatedReports = sortedReports.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      count: paginatedReports.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      sortedBy: comparatorKey,
      reports: paginatedReports,
    });

  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getSingleReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reportedBy", "fullName email profilePicture")
      .populate("assignedWorker", "fullName email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (
      report.reportedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (report.images?.length) {
      for (const image of report.images) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (err) {
          console.error(
            `Failed to delete Cloudinary image: ${image.publicId}`,
            err.message
          );
        }
      }
    }
    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (status === report.status) {
      return res.status(400).json({
        success: false,
        message: "Report is already in that status",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isWorker = req.user.role === "worker";
    const isAssignedWorker = report.assignedWorker?.toString() === req.user._id.toString();

    if (isAdmin) {
      const allowedAdminTransitions = {
        pending: ["verified", "rejected"],
      };
      const allowed = allowedAdminTransitions[report.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Admins can only review pending reports as verified or rejected",
        });
      }
    } else if (isWorker) {
      if (!isAssignedWorker) {
        return res.status(403).json({
          success: false,
          message: "Only the assigned worker can update this report",
        });
      }

      const allowedWorkerTransitions = {
        verified: ["in_progress"],
        in_progress: ["resolved"],
      };
      const allowed = allowedWorkerTransitions[report.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Workers can only move verified reports to in progress, then resolve them",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Only admins and assigned workers can update report status",
      });
    }

    const previousStatus = report.status;
    report.status = status;
    await report.save();

    await logHistory(report._id, "status_changed", req.user._id, {
      from: previousStatus,
      to: status,
    });

    createNotification(report.reportedBy, 'Status Updated', `Your report "${report.title}" status changed to ${status.replace('_', ' ')}.`, 'status_change', report._id);

    res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};
const getNearbyReports = async (req, res) => {
  try {
    const { longitude, latitude, distance = 5000, limit } = req.query;

    let query = { status: { $ne: "rejected" } };
    if (
      longitude !== undefined &&
      longitude !== null &&
      latitude !== undefined &&
      latitude !== null
    ) {
      query = {
        status: { $ne: "rejected" },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: Number(distance),
          },
        },
      };
    }

    let reportsQuery = Report.find(query)
      .sort({ createdAt: -1 })
      .populate("reportedBy", "fullName email profilePicture")
      .populate("assignedWorker", "fullName email");

    if (limit) {
      reportsQuery = reportsQuery.limit(Number(limit));
    }

    const reports = await reportsQuery;

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }
    if (
      report.reportedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "category",
      "severity",
      "municipality",
      "locationName",
      "images",
    ];

    const changes = {};
    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined &&
        JSON.stringify(report[field]) !== JSON.stringify(req.body[field])
      ) {
        changes[field] = {
          from: report[field],
          to: req.body[field],
        };

        report[field] = req.body[field];
      }
    });

    if (
      req.body.longitude !== undefined &&
      req.body.latitude !== undefined
    ) {
      const newCoords = [Number(req.body.longitude), Number(req.body.latitude)];
      const oldCoords = report.location?.coordinates || [];
      if (newCoords[0] !== oldCoords[0] || newCoords[1] !== oldCoords[1]) {
        changes.location = { from: oldCoords, to: newCoords };
        report.location = {
          type: "Point",
          coordinates: newCoords,
        };
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes detected",
      });
    }

    await report.save();

    await logHistory(report._id, "updated", req.user._id, { changes });

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({
      reportedBy: req.user._id,
    })
      .populate("reportedBy", "fullName email profilePicture")
      .populate("assignedWorker", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const toggleUpvote = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }
    const added = report.toggleUpvote(req.user._id);
    await report.save();

    await logHistory(report._id, added ? "upvoted" : "removed_upvote", req.user._id);

    res.status(200).json({
      success: true,
      message: added ? "Report upvoted successfully" : "Upvote removed successfully",
      upvoteCount: report.upvoteCount,
      upvotes: report.upvotes,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const assignWorker = async (req, res) => {
  try {
    const { workerId } = req.body;
    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: "Worker ID is required",
      });
    }
    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }
    if (worker.role !== "worker") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a worker",
      });
    }
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }
    if (report.status !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Verify the report before assigning a worker",
      });
    }

    report.assignedWorker = worker._id;
    await report.save();
    await report.populate("assignedWorker", "fullName email");

    await logHistory(report._id, "assigned", req.user._id, {
      assignedTo: worker._id,
      workerName: worker.fullName,
    });

    createNotification(report.reportedBy, 'Worker Assigned', `A worker has been assigned to your report "${report.title}".`, 'assignment', report._id);
    createNotification(worker._id, 'New Assignment', `You have been assigned to report "${report.title}".`, 'assignment', report._id);

    res.status(200).json({
      success: true,
      message: "Worker assigned successfully",
      report,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getAssignedReports = async (req, res) => {
  try {
    const reports = await Report.find({
      assignedWorker: req.user._id,
    })
      .populate("reportedBy", "fullName email profilePicture")
      .populate("assignedWorker", "fullName email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getMyDashboard = async (req, res) => {
  try {
    const reports = await Report.find({
      reportedBy: req.user._id,
    });
    const dashboard = {
      totalReports: reports.length,
      pending: 0,
      verified: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
      totalUpvotes: 0,
    };
    reports.forEach((report) => {
      if (dashboard.hasOwnProperty(report.status)) {
        dashboard[report.status]++;
      }
      dashboard.totalUpvotes += report.upvoteCount || 0;
    });
    res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getWorkerDashboard = async (req, res) => {
  try {
    const reports = await Report.find({
      assignedWorker: req.user._id,
    });
    const dashboard = {
      assigned: reports.length,
      pending: 0,
      verified: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };
    reports.forEach((report) => {
      if (dashboard.hasOwnProperty(report.status)) {
        dashboard[report.status]++;
      }
    });
    res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalReports,
      pending,
      verified,
      inProgress,
      resolved,
      rejected,
      totalCitizens,
      totalWorkers,
      totalAdmins,
      recentReports,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "verified" }),
      Report.countDocuments({ status: "in_progress" }),
      Report.countDocuments({ status: "resolved" }),
      Report.countDocuments({ status: "rejected" }),
      User.countDocuments({ role: "citizen" }),
      User.countDocuments({ role: "worker" }),
      User.countDocuments({ role: "admin" }),
      Report.find()
        .populate("reportedBy", "fullName email")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);
    res.status(200).json({
      success: true,
      dashboard: {
        totalReports,
        pending,
        verified,
        inProgress,
        resolved,
        rejected,
        totalCitizens,
        totalWorkers,
        totalAdmins,
        recentReports,
      },
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getReportHistory = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const history = await ReportHistory.find({ report: req.params.id })
      .populate("performedBy", "fullName email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

module.exports = {
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
};
