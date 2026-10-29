import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PlaySquare,
  Sparkles,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  Mic,
  AlignLeft,
  ArrowRight,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import { interviewApi } from '../api/interviews';
import { resumeApi } from '../api/resumes';
import { useAuth } from '../context/AuthContext';

const INTERVIEW_TYPES = [
  { id: 'technical', name: 'Technical', desc: 'Core CS, frameworks, architecture, and language specifics' },
  { id: 'behavioral', name: 'Behavioral', desc: 'STAR-format questions on leadership, conflict, teamwork' },
  { id: 'hr', name: 'HR / Cultural', desc: 'Motivation, career goals, culture fit, situational scenarios' },
  { id: 'coding', name: 'Coding & Algorithms', desc: 'Data structures, algorithms, complexity & problem solving' },
  { id: 'system_design', name: 'System Design', desc: 'Scalability, microservices, databases, trade-off analysis' },
  { id: 'mixed', name: 'Mixed Comprehensive', desc: 'Balanced combination of technical, soft skills, and design' },
];

const DIFFICULTY_LEVELS = [
  { id: 'easy', name: 'Easy', desc: 'Foundational concepts & straightforward scenarios' },
  { id: 'medium', name: 'Medium', desc: 'Standard industry interview depth' },
  { id: 'hard', name: 'Hard', desc: 'Edge cases, deep optimization & complex trade-offs' },
];

export default function StartInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const presetRole = location.state?.presetRole || '';
  const presetType = location.state?.presetType || 'technical';
  const presetDifficulty = location.state?.presetDifficulty || 'medium';
  const selectedResumeId = location.state?.selectedResumeId || '';

  const [title, setTitle] = useState('');
  const [jobRole, setJobRole] = useState(presetRole || 'Full Stack Software Engineer');
  const [interviewType, setInterviewType] = useState(presetType);
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'mid');
  const [difficulty, setDifficulty] = useState(presetDifficulty);
  const [durationLimit, setDurationLimit] = useState(30);
  const [questionCount, setQuestionCount] = useState(10);
  const [answerMode, setAnswerMode] = useState('text');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState(selectedResumeId);
  const [skillInput, setSkillInput] = useState('');
  const [skillsToPractice, setSkillsToPractice] = useState(['React.js', 'Node.js', 'System Design']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const res = await resumeApi.getAll();
      if (res.success && res.resumes) {
        setResumes(res.resumes);
        if (!resumeId) {
          const active = res.resumes.find((r) => r.isActive) || res.resumes[0];
          if (active) setResumeId(active._id);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch resumes:', err);
    }
  };

  const handleAddSkill = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && skillInput.trim()) {
      e.preventDefault();
      if (!skillsToPractice.includes(skillInput.trim())) {
        setSkillsToPractice([...skillsToPractice, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsToPractice(skillsToPractice.filter((s) => s !== skillToRemove));
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError('');

    if (!jobRole.trim()) {
      setError('Please specify a target Job Role.');
      return;
    }

    const finalTitle =
      title.trim() ||
      `${jobRole} (${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)})`;

    try {
      setLoading(true);
      // 1. Create interview session in database
      const createRes = await interviewApi.create({
        title: finalTitle,
        jobRole,
        interviewType,
        experienceLevel,
        difficulty,
        durationLimit: Number(durationLimit),
        questionCount: Number(questionCount),
        resumeId: resumeId || null,
        skillsToPractice,
        preferredLanguage,
        answerMode,
      });

      if (createRes.success && createRes.interview) {
        const interviewId = createRes.interview._id;
        // 2. Start session (triggers question generation)
        navigate(`/interview/${interviewId}`);
      } else {
        setError(createRes.message || 'Failed to initialize interview.');
      }
    } catch (err) {
      setError(err.message || 'Error creating interview session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span>Configure Your Mock Interview</span>
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Customize your interview parameters, questions, and evaluation criteria.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="space-y-6">
        {/* Card 1: Role & Title */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-indigo-600">
            1. Role & Context
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Target Job Role *
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                required
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Session Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Google Mock Prep Round 1"
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Active Resume Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Active Resume Context (Optional)
            </label>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            >
              <option value="">No Resume (General Questions)</option>
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.originalFilename} {r.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              Selecting a resume allows the AI to tailor questions directly to your actual projects and skills.
            </p>
          </div>

          {/* Skills tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Specific Skills / Topics to Practice
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skillsToPractice.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-indigo-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="Type skill & press Enter (e.g. Docker, GraphQL, System Design)"
                className="flex-1 px-4 py-2 bg-gray-50/70 focus:bg-white text-xs text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Interview Type & Difficulty */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-indigo-600">
            2. Category & Depth
          </h2>

          {/* Interview Type Cards */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Interview Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTERVIEW_TYPES.map((type) => {
                const isSelected = interviewType === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setInterviewType(type.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-900">{type.name}</p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">{type.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Difficulty & Experience Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTY_LEVELS.map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      difficulty === diff.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {diff.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              >
                <option value="entry">Entry Level (0 - 1 years)</option>
                <option value="junior">Junior (1 - 3 years)</option>
                <option value="mid">Mid Level (3 - 5 years)</option>
                <option value="senior">Senior (5 - 8 years)</option>
                <option value="lead">Lead / Staff (8+ years)</option>
                <option value="principal">Principal Architect</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Session Rules & Mode */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-indigo-600">
            3. Duration & Answering Mode
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Questions Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              >
                <option value={5}>5 Questions (Quick)</option>
                <option value={10}>10 Questions (Standard)</option>
                <option value={15}>15 Questions (In-depth)</option>
                <option value={20}>20 Questions (Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Duration Limit
              </label>
              <select
                value={durationLimit}
                onChange={(e) => setDurationLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Answer Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAnswerMode('text')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    answerMode === 'text'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnswerMode('voice')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    answerMode === 'voice'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Generating Questions with AI...' : 'Begin Mock Interview'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
