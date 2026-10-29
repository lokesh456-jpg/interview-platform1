const Resume = require('../models/Resume');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { extractText, validateExtractedText } = require('../services/resumeService');
const { generateResumeAnalysis } = require('../services/aiService');
const { isAIConfigured } = require('../config/aiProvider');
const { checkResumeQuota, incrementResumeCount } = require('../services/quotaService');
const { notifyResumeAnalysisComplete, notifyResumeAnalysisFailed } = require('../services/notificationService');

// POST /api/resumes/upload
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const fileType = mimetype === 'application/pdf' ? 'pdf' : 'docx';

    // Upload to Cloudinary if configured
    let cloudinaryPublicId = null;
    let cloudinaryUrl = null;

    if (isCloudinaryConfigured()) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `interviewai/resumes/${req.user._id}`,
            resource_type: 'raw',
            public_id: `${Date.now()}_${originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`,
            access_mode: 'authenticated',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      cloudinaryPublicId = uploadResult.public_id;
      cloudinaryUrl = uploadResult.secure_url;
    }

    // Extract text from file
    let extractedText = '';
    try {
      extractedText = await extractText(buffer, mimetype);
      extractedText = validateExtractedText(extractedText);
    } catch (extractErr) {
      return res.status(422).json({ success: false, message: extractErr.message });
    }

    // Create resume record
    const resume = await Resume.create({
      userId: req.user._id,
      originalFilename: originalname,
      fileType,
      fileSize: size,
      cloudinaryPublicId,
      cloudinaryUrl,
      extractedText,
      analysisStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully.',
      resume: {
        _id: resume._id,
        originalFilename: resume.originalFilename,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        analysisStatus: resume.analysisStatus,
        isActive: resume.isActive,
        createdAt: resume.createdAt,
      },
    });

    // Trigger analysis in background (non-blocking)
    setImmediate(() => analyzeResumeInBackground(resume._id, req.user._id));
  } catch (error) {
    next(error);
  }
};

// Background analysis worker
const analyzeResumeInBackground = async (resumeId, userId) => {
  const resume = await Resume.findById(resumeId).select('+extractedText');
  if (!resume) return;

  try {
    resume.analysisStatus = 'processing';
    await resume.save();

    if (!isAIConfigured()) {
      resume.analysisStatus = 'failed';
      resume.errorMsg = 'AI provider not configured.';
      await resume.save();
      await notifyResumeAnalysisFailed(userId, resume.originalFilename);
      return;
    }

    // Check quota
    const quota = await checkResumeQuota(userId);
    if (!quota.allowed) {
      resume.analysisStatus = 'failed';
      await resume.save();
      await notifyResumeAnalysisFailed(userId, resume.originalFilename);
      return;
    }

    const analysis = await generateResumeAnalysis(resume.extractedText);

    resume.parsedSkills = analysis.parsedSkills || [];
    resume.parsedEducation = analysis.parsedEducation || [];
    resume.parsedExperience = analysis.parsedExperience || [];
    resume.parsedProjects = analysis.parsedProjects || [];
    resume.analysisResults = {
      summary: analysis.summary,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      recommendedRoles: analysis.recommendedRoles,
      experienceLevel: analysis.experienceLevel,
      keyTechnologies: analysis.keyTechnologies,
      softSkills: analysis.softSkills,
      overallScore: analysis.overallScore,
    };
    resume.analysisStatus = 'completed';
    await resume.save();

    await incrementResumeCount(userId);
    await notifyResumeAnalysisComplete(userId, resumeId, resume.originalFilename);
  } catch (err) {
    console.error('Resume analysis failed:', err.message);
    try {
      await Resume.findByIdAndUpdate(resumeId, { analysisStatus: 'failed' });
      await notifyResumeAnalysisFailed(userId, resume?.originalFilename || 'your resume');
    } catch (_) {}
  }
};

// GET /api/resumes
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    res.json({ success: true, resumes });
  } catch (error) {
    next(error);
  }
};

// GET /api/resumes/:id
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id })
      .select('-extractedText');

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// GET /api/resumes/:id/analysis
const getResumeAnalysis = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id })
      .select('-extractedText');

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    res.json({
      success: true,
      analysis: {
        status: resume.analysisStatus,
        results: resume.analysisResults,
        parsedSkills: resume.parsedSkills,
        parsedEducation: resume.parsedEducation,
        parsedExperience: resume.parsedExperience,
        parsedProjects: resume.parsedProjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/resumes/:id/analyze (re-analyze)
const reanalyzeResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    if (resume.analysisStatus === 'processing') {
      return res.status(409).json({ success: false, message: 'Analysis is already in progress.' });
    }

    resume.analysisStatus = 'pending';
    await resume.save();

    res.json({ success: true, message: 'Re-analysis started.' });

    setImmediate(() => analyzeResumeInBackground(resume._id, req.user._id));
  } catch (error) {
    next(error);
  }
};

// PATCH /api/resumes/:id/activate
const activateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Deactivate all others
    await Resume.updateMany({ userId: req.user._id }, { isActive: false });
    resume.isActive = true;
    await resume.save();

    res.json({ success: true, message: 'Resume activated.', resume });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/resumes/:id
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    // Delete from Cloudinary
    if (resume.cloudinaryPublicId && isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(resume.cloudinaryPublicId, { resource_type: 'raw' });
      } catch (cloudErr) {
        console.warn('Failed to delete Cloudinary file:', cloudErr.message);
      }
    }

    await resume.deleteOne();
    res.json({ success: true, message: 'Resume deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResume,
  getResumeAnalysis,
  reanalyzeResume,
  activateResume,
  deleteResume,
};
