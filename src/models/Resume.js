const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  originalFilename: {
    type: String,
    required: true,
    trim: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx'],
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  // Cloudinary reference
  cloudinaryPublicId: {
    type: String,
    default: null,
  },
  cloudinaryUrl: {
    type: String,
    default: null,
  },
  // Extracted data (not logged, not exposed in list views)
  extractedText: {
    type: String,
    select: false, // Never returned in queries by default
    default: null,
  },
  parsedSkills: {
    type: [String],
    default: [],
  },
  parsedEducation: [{
    degree: String,
    institution: String,
    year: String,
    field: String,
  }],
  parsedExperience: [{
    title: String,
    company: String,
    duration: String,
    description: String,
  }],
  parsedProjects: [{
    name: String,
    description: String,
    technologies: [String],
  }],
  analysisStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  analysisResults: {
    summary: String,
    strengths: [String],
    gaps: [String],
    recommendedRoles: [String],
    experienceLevel: String,
    keyTechnologies: [String],
    softSkills: [String],
    overallScore: Number,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

resumeSchema.index({ userId: 1, isActive: 1 });
resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
