const User = require("../models/userModel");
const Report = require("../models/reportModel");
const generateToken = require("../utils/generateToken");
const cloudinary = require("../config/cloudinary");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const createOtpCode = () => {
  const code = crypto.randomInt(100000, 1000000).toString();
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
  return { code, hashedCode };
};

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, municipality } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const { code: verificationCode, hashedCode } = createOtpCode();

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password,
      phone: phone || null,
      municipality: municipality || null,
      emailVerificationToken: hashedCode,
      emailVerificationExpires: Date.now() + 10 * 60 * 1000,
    });

    await sendEmail({
      to: user.email,
      subject: "Your SadakSewa verification code",
      text: `Your SadakSewa verification code is ${verificationCode}.\n\nThis code expires in 10 minutes.`,
      html: `
        <p>Welcome to SadakSewa.</p>
        <p>Use this 6-digit code to verify your email address:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${verificationCode}</p>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    const response = {
      success: true,
      message: "Account created. Please check your email to verify your account.",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        municipality: user.municipality,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
      },
    };

    res.status(201).json({
      ...response,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before signing in",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        municipality: user.municipality,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
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

const logoutUser = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please sign in again.",
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be 6 digits",
      });
    }

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      emailVerificationToken: hashedCode,
      emailVerificationExpires: { $gt: Date.now() },
      isActive: true,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification code is invalid or has expired",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const publicMessage =
      "If an active account exists for that email, a password reset code has been sent.";

    const user = await User.findOne({ email: email.trim().toLowerCase(), isActive: true });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: publicMessage,
      });
    }

    const { code: resetCode, hashedCode } = createOtpCode();
    user.passwordResetToken = hashedCode;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const response = {
      success: true,
      message: publicMessage,
    };

    await sendEmail({
      to: user.email,
      subject: "Your SadakSewa password reset code",
      text: `Your SadakSewa password reset code is ${resetCode}.\n\nThis code expires in 15 minutes.`,
      html: `
        <p>You requested a password reset for SadakSewa.</p>
        <p>Use this 6-digit code to reset your password:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${resetCode}</p>
        <p>This code expires in 15 minutes.</p>
      `,
    });

    res.status(200).json(response);
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and reset code are required",
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Reset code must be 6 digits",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      passwordResetToken: hashedCode,
      passwordResetExpires: { $gt: Date.now() },
      isActive: true,
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset code is invalid or has expired",
      });
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user._id }).select("status upvoteCount");
    const reportCount = reports.length;
    const resolvedCount = reports.filter((report) => report.status === "resolved").length;
    const upvoteCount = reports.reduce((sum, report) => sum + (report.upvoteCount || 0), 0);

    res.status(200).json({
      success: true,
      user: {
        ...req.user.toObject(),
        reportCount,
        resolvedCount,
        upvoteCount,
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
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["fullName", "phone", "municipality"];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const getPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const versionIndex = parts.findIndex((p) => p.startsWith("v") && !isNaN(p.slice(1)));
  const relevantParts = parts.slice(versionIndex + 1);
  const lastPart = relevantParts[relevantParts.length - 1];
  relevantParts[relevantParts.length - 1] = lastPart.replace(/\.[^/.]+$/, "");
  return relevantParts.join("/");
};

const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image provided",
      });
    }

    const user = await User.findById(req.user._id);

    if (user.profilePicture) {
      try {
        const publicId = getPublicIdFromUrl(user.profilePicture);
        await cloudinary.uploader.destroy(publicId);
      } catch {
        // old image deletion failed — not critical, continue anyway
      }
    }

    user.profilePicture = req.file.path;
    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: updatedUser,
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
};
