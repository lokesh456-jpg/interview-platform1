const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Report = require('../models/Report');
const Resume = require('../models/Resume');
const { generateInterviewQuestions, evaluateInterviewAnswer, generateInterviewReport } = require('../services/aiService');
const { isAIConfigured } = require('../config/aiProvider');
const { checkInterviewQuota, incrementInterviewCount } = require('../services/quotaService');
const { notifyInterviewReportReady, notifyInterviewFailed } = require('../services/notificationService');

// POST /api/interviews
const createInterview = async (req, res, next) => {
  try {
    const { title, jobRole, interviewType, experienceLevel, difficulty, durationLimit, questionCount, resumeId, skillsToPractice, preferredLanguage, answerMode } = req.body;

    // Check quota
    const quota = await checkInterviewQuota(req.user._id);
    if (!quota.allowed) {
      return res.status(403).json({ success: false, message: quota.message });
    }

    const interview = await Interview.create({
      userId: req.user._id,
      resumeId: resumeId || null,
      title,
      jobRole,
      interviewType,
      experienceLevel: experienceLevel || req.user.experienceLevel,
      difficulty: difficulty || 'medium',
      durationLimit: durationLimit || 30,
      questionCount: questionCount || 10,
      preferredLanguage: preferredLanguage || 'English',
      answerMode: answerMode || 'text',
      skillsToPractice: skillsToPractice || [],
      status: 'draft',
    });

    res.status(201).json({ success: true, message: 'Interview created.', interview });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews
const getInterviews = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, status, interviewType, minScore, maxScore,
      sortBy = 'createdAt', sortOrder = 'desc', search,
    } = req.query;

    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (interviewType) query.interviewType = interviewType;
    if (minScore !== undefined || maxScore !== undefined) {
      query.overallScore = {};
      if (minScore !== undefined) query.overallScore.$gte = Number(minScore);
      if (maxScore !== undefined) query.overallScore.$lte = Number(maxScore);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { jobRole: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [interviews, total] = await Promise.all([
      Interview.find(query).sort(sortObj).skip(skip).limit(Number(limit)).lean(),
      Interview.countDocuments(query),
    ]);

    res.json({
      success: true,
      interviews,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews/:id
const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }
    const questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
    res.json({ success: true, interview, questions });
  } catch (error) {
    next(error);
  }
};

// POST /api/interviews/:id/start
const startInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });

    // Allow re-entering in_progress (recovery after refresh)
    if (interview.status === 'in_progress') {
      const questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
      return res.json({ success: true, message: 'Interview already in progress.', interview, questions });
    }

    if (!['draft', 'ready'].includes(interview.status)) {
      return res.status(409).json({ success: false, message: `Cannot start interview in status: ${interview.status}` });
    }

    if (!isAIConfigured()) {
      return res.status(503).json({ success: false, message: 'AI provider is not configured. Cannot generate questions.' });
    }

    // Generate questions if not already done
    let questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
    if (questions.length === 0) {
      interview.status = 'generating_questions';
      await interview.save();

      try {
        let resumeContext = null;
        if (interview.resumeId) {
          const resume = await Resume.findOne({ _id: interview.resumeId, userId: req.user._id }).select('+extractedText');
          if (resume?.extractedText) {
            resumeContext = resume.extractedText;
          }
        }

        const generatedQuestions = await generateInterviewQuestions({
          jobRole: interview.jobRole,
          interviewType: interview.interviewType,
          difficulty: interview.difficulty,
          questionCount: interview.questionCount,
          skills: interview.skillsToPractice,
          resumeContext,
          experienceLevel: interview.experienceLevel,
        });

        questions = await Question.insertMany(
          generatedQuestions.map(q => ({ ...q, interviewId: interview._id }))
        );
      } catch (genErr) {
        interview.status = 'failed';
        interview.errorMessage = genErr.message;
        await interview.save();
        await notifyInterviewFailed(req.user._id, interview._id, interview.title);
        return res.status(500).json({ success: false, message: 'Failed to generate questions. Please try again.' });
      }
    }

    interview.status = 'in_progress';
    interview.startedAt = new Date();
    interview.currentQuestionIndex = 0;
    await interview.save();

    await incrementInterviewCount(req.user._id);

    res.json({ success: true, message: 'Interview started.', interview, questions });
  } catch (error) {
    next(error);
  }
};

// POST /api/interviews/:id/next-question
const nextQuestion = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview || interview.status !== 'in_progress') {
      return res.status(404).json({ success: false, message: 'Active interview not found.' });
    }

    const questions = await Question.find({ interviewId: interview._id }).sort({ order: 1 });
    const nextIndex = interview.currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      return res.json({ success: true, isLast: true, message: 'No more questions.' });
    }

    interview.currentQuestionIndex = nextIndex;
    await interview.save();

    res.json({ success: true, currentIndex: nextIndex, question: questions[nextIndex], isLast: nextIndex === questions.length - 1 });
  } catch (error) {
    next(error);
  }
};

// POST /api/interviews/:id/complete
const completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    if (!['in_progress', 'evaluating'].includes(interview.status)) {
      return res.status(409).json({ success: false, message: 'Interview is not in a completable state.' });
    }

    // Prevent duplicate completion
    if (interview.reportId) {
      const existingReport = await Report.findById(interview.reportId);
      if (existingReport && existingReport.reportStatus === 'completed') {
        return res.json({ success: true, message: 'Interview already completed.', reportId: interview.reportId });
      }
    }

    interview.status = 'evaluating';
    interview.completedAt = new Date();
    if (interview.startedAt) {
      interview.totalDuration = Math.round((interview.completedAt - interview.startedAt) / 1000);
    }
    await interview.save();

    res.json({ success: true, message: 'Interview submitted. Generating report...' });

    // Generate report in background
    setImmediate(() => generateReportInBackground(interview._id, req.user._id));
  } catch (error) {
    next(error);
  }
};

const generateReportInBackground = async (interviewId, userId) => {
  try {
    const interview = await Interview.findById(interviewId);
    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    const answers = await Answer.find({ interviewId, userId }).lean();

    // Calculate scores from evaluations
    const evaluatedAnswers = answers.filter(a => a.evaluationStatus === 'completed' && a.evaluation?.score !== undefined);
    const avgScore = evaluatedAnswers.length > 0
      ? Math.round(evaluatedAnswers.reduce((sum, a) => sum + a.evaluation.score, 0) / evaluatedAnswers.length)
      : 0;

    let reportData = {
      overallStrengths: [],
      improvementAreas: [],
      skillScores: { technicalKnowledge: null, problemSolving: null, communication: null, confidence: null },
      recommendedTopics: [],
      suggestedNextInterview: null,
    };

    if (isAIConfigured() && answers.length > 0) {
      try {
        reportData = await generateInterviewReport({ interview, answers, questions });
      } catch (err) {
        console.error('Report generation AI error:', err.message);
      }
    }

    const questionSummaries = answers.map(a => {
      const q = questions.find(q => q._id.toString() === a.questionId.toString());
      return {
        questionId: a.questionId,
        questionText: q?.questionText || '',
        userAnswer: a.textAnswer || a.transcript || '',
        score: a.evaluation?.score || null,
        strengths: a.evaluation?.strengths || [],
        improvements: a.evaluation?.improvements || [],
        missingConcepts: a.evaluation?.missingConcepts || [],
        suggestedAnswer: a.evaluation?.suggestedAnswer || '',
        rubricScores: a.evaluation?.rubricScores || {},
      };
    });

    const report = await Report.create({
      userId,
      interviewId,
      overallScore: avgScore,
      skillScores: reportData.skillScores || {},
      strengths: reportData.overallStrengths || [],
      improvementAreas: reportData.improvementAreas || [],
      questionSummaries,
      recommendedTopics: reportData.recommendedTopics || [],
      suggestedNextInterview: reportData.suggestedNextInterview || null,
      reportStatus: 'completed',
    });

    interview.overallScore = avgScore;
    interview.reportId = report._id;
    interview.status = 'completed';
    await interview.save();

    await notifyInterviewReportReady(userId, interviewId, interview.title);
  } catch (err) {
    console.error('Report generation failed:', err.message);
    try {
      await Interview.findByIdAndUpdate(interviewId, { status: 'failed', errorMessage: err.message });
      const interview = await Interview.findById(interviewId);
      await notifyInterviewFailed(userId, interviewId, interview?.title || 'Interview');
    } catch (_) {}
  }
};

// POST /api/interviews/:id/cancel
const cancelInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    if (['completed', 'cancelled', 'failed'].includes(interview.status)) {
      return res.status(409).json({ success: false, message: 'Cannot cancel this interview.' });
    }
    interview.status = 'cancelled';
    await interview.save();
    res.json({ success: true, message: 'Interview cancelled.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/interviews/:id
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });

    await Promise.all([
      Question.deleteMany({ interviewId: interview._id }),
      Answer.deleteMany({ interviewId: interview._id }),
      Report.deleteOne({ interviewId: interview._id }),
      interview.deleteOne(),
    ]);

    res.json({ success: true, message: 'Interview and all related data deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/interviews/:id/retry
const retryInterview = async (req, res, next) => {
  try {
    const original = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) return res.status(404).json({ success: false, message: 'Interview not found.' });

    const newInterview = await Interview.create({
      userId: req.user._id,
      resumeId: original.resumeId,
      title: `${original.title} (Retry)`,
      jobRole: original.jobRole,
      interviewType: original.interviewType,
      experienceLevel: original.experienceLevel,
      difficulty: original.difficulty,
      durationLimit: original.durationLimit,
      questionCount: original.questionCount,
      preferredLanguage: original.preferredLanguage,
      answerMode: original.answerMode,
      skillsToPractice: original.skillsToPractice,
      status: 'draft',
    });

    res.status(201).json({ success: true, interview: newInterview });
  } catch (error) {
    next(error);
  }
};

module.exports = { createInterview, getInterviews, getInterview, startInterview, nextQuestion, completeInterview, cancelInterview, deleteInterview, retryInterview };
