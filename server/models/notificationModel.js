const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 500 },
  type: {
    type: String,
    enum: ['report_update', 'status_change', 'assignment', 'upvote', 'comment', 'system'],
    default: 'system',
  },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
