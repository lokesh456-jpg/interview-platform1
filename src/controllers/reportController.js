const Report = require('../models/Report');
const Interview = require('../models/Interview');

// GET /api/reports
const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      Report.find({ userId: req.user._id, reportStatus: 'completed' })
        .populate('interviewId', 'title jobRole interviewType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments({ userId: req.user._id, reportStatus: 'completed' }),
    ]);

    res.json({
      success: true,
      reports,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/:id
const getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('interviewId');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews/:id/report
const getInterviewReport = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });

    if (!interview.reportId) {
      if (['evaluating', 'in_progress'].includes(interview.status)) {
        return res.json({ success: true, status: 'pending', message: 'Report is still being generated. Please check back shortly.' });
      }
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const report = await Report.findOne({ _id: interview.reportId, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });

    res.json({ success: true, report, interview });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReports, getReport, getInterviewReport };
