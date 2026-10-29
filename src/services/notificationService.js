const Notification = require('../models/Notification');

const createNotification = async ({ userId, type, title, message, relatedResourceType = null, relatedResourceId = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedResourceType,
      relatedResourceId,
    });
    return notification;
  } catch (error) {
    // Notifications are non-critical; log and continue
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

const notifyResumeAnalysisComplete = async (userId, resumeId, filename) => {
  await createNotification({
    userId,
    type: 'resume_analysis_complete',
    title: 'Resume Analysis Complete',
    message: `Your resume "${filename}" has been analyzed successfully. View your personalized insights.`,
    relatedResourceType: 'resume',
    relatedResourceId: resumeId,
  });
};

const notifyResumeAnalysisFailed = async (userId, filename) => {
  await createNotification({
    userId,
    type: 'resume_analysis_failed',
    title: 'Resume Analysis Failed',
    message: `We could not analyze "${filename}". Please try again or upload a different file.`,
    relatedResourceType: null,
    relatedResourceId: null,
  });
};

const notifyInterviewReportReady = async (userId, interviewId, interviewTitle) => {
  await createNotification({
    userId,
    type: 'interview_report_ready',
    title: 'Interview Report Ready',
    message: `Your report for "${interviewTitle}" is ready. View your detailed feedback and score.`,
    relatedResourceType: 'interview',
    relatedResourceId: interviewId,
  });
};

const notifyInterviewFailed = async (userId, interviewId, interviewTitle) => {
  await createNotification({
    userId,
    type: 'interview_failed',
    title: 'Interview Processing Failed',
    message: `We encountered an error processing "${interviewTitle}". Please try again.`,
    relatedResourceType: 'interview',
    relatedResourceId: interviewId,
  });
};

module.exports = {
  createNotification,
  notifyResumeAnalysisComplete,
  notifyResumeAnalysisFailed,
  notifyInterviewReportReady,
  notifyInterviewFailed,
};
