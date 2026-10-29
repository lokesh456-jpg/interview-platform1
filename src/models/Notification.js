const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'resume_analysis_complete',
      'resume_analysis_failed',
      'interview_report_ready',
      'interview_failed',
      'account_event',
      'system',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  relatedResourceType: {
    type: String,
    enum: ['resume', 'interview', 'report', 'user', null],
    default: null,
  },
  relatedResourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  readAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, readAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
