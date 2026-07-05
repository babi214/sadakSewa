const User = require("../models/userModel");

const getAllUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }
    if (req.query.search) {
      filter.$or = [
        { fullName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    if (req.query.province) {
      filter.province = { $regex: req.query.province, $options: "i" };
    }
    if (req.query.district) {
      filter.district = { $regex: req.query.district, $options: "i" };
    }
    if (req.query.municipality) {
      filter.municipality = { $regex: req.query.municipality, $options: "i" };
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      if (req.body.isActive === false) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate your own account",
        });
      }
      if (req.body.role && req.body.role !== req.user.role) {
        return res.status(400).json({
          success: false,
          message: "You cannot change your own role",
        });
      }
    }

    const allowedFields = ["role", "isActive", "municipality"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({
      success: false,
      message: isDev ? error.message : "Internal server error",
    });
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: await User.findById(user._id).select("-password"),
    });
  } catch (error) {
    const isDev = process.env.NODE_ENV === "development";
    res.status(500).json({ success: false, message: isDev ? error.message : "Internal server error" });
  }
};

module.exports = { getAllUsers, updateUser, toggleUserActive };
