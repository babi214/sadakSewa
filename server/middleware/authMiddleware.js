const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select(
      "-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires"
    );

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    if (req.user.passwordChangedAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: "Password recently changed, please login again",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin" && req.user.isActive) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
};

const workerOnly = (req, res, next) => {
  if (req.user && ["worker", "admin"].includes(req.user.role) && req.user.isActive) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Worker access only",
    });
  }
};

module.exports = { protect, adminOnly, workerOnly };
