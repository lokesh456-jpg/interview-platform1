import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Star,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Code,
  Layers,
} from 'lucide-react';
import { resumeApi } from '../api/resumes';

export default function UploadResumePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const res = await resumeApi.getAll();
      if (res.success && res.resumes) {
        setResumes(res.resumes);
        const active = res.resumes.find((r) => r.isActive) || res.resumes[0];
        if (active) {
          setSelectedResume(active);
          fetchAnalysis(active._id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (id) => {
    try {
      const res = await resumeApi.getAnalysis(id);
      if (res.success && res.analysis) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      console.warn('Failed to fetch analysis:', err);
    }
  };

  const handleFileSelect = (file) => {
    setError('');
    setActionSuccess('');

    if (!file) return;

    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowed.includes(file.type)) {
      setError('Invalid file format. Please upload a PDF or DOCX file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      setUploading(true);
      setUploadProgress(10);
      const res = await resumeApi.upload(formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.success && res.resume) {
        setActionSuccess('Resume uploaded! AI analysis started in background.');
        await loadResumes();
        setSelectedResume(res.resume);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleActivate = async (id) => {
    try {
      await resumeApi.activate(id);
      setResumes((prev) =>
        prev.map((r) => ({ ...r, isActive: r._id === id }))
      );
      setActionSuccess('Active resume updated for future interviews.');
    } catch (err) {
      setError(err.message || 'Failed to activate resume.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumeApi.delete(id);
      const remaining = resumes.filter((r) => r._id !== id);
      setResumes(remaining);
      if (selectedResume?._id === id) {
        const next = remaining[0] || null;
        setSelectedResume(next);
        if (next) fetchAnalysis(next._id);
        else setAnalysis(null);
      }
      setActionSuccess('Resume removed.');
    } catch (err) {
      setError(err.message || 'Failed to delete resume.');
    }
  };

  const handleReanalyze = async (id) => {
    try {
      setActionSuccess('Re-analyzing resume with AI...');
      await resumeApi.reanalyze(id);
      setTimeout(() => fetchAnalysis(id), 3000);
    } catch (err) {
      setError(err.message || 'Failed to trigger re-analysis.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Upload & Manage Resumes</h1>
        <p className="text-xs text-gray-500 mt-1">
          Our AI parses your experience to generate personalized mock interview questions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Upload Area on Left, List & Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Drag & Drop Upload Card */}
        <div className="lg:col-span-5 space-y-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.[0]) {
                handleFileSelect(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-sm font-bold text-gray-900">
              Drag & Drop your resume here
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Supports PDF or DOCX formats (Max 10MB)
            </p>

            <button
              type="button"
              className="mt-5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              Browse Files
            </button>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex justify-between text-xs font-semibold text-gray-700 mb-2">
                <span>Uploading and extracting text...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Uploaded Resumes List */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Your Resumes ({resumes.length})</h3>

            {resumes.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {resumes.map((r) => {
                  const isSelected = selectedResume?._id === r._id;
                  return (
                    <div
                      key={r._id}
                      onClick={() => {
                        setSelectedResume(r);
                        fetchAnalysis(r._id);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {r.originalFilename}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 uppercase">
                              {r.fileType} • {(r.fileSize / 1024).toFixed(0)} KB
                            </span>
                            {r.isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!r.isActive && (
                          <button
                            title="Set as Active Resume"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivate(r._id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-white"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          title="Delete Resume"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(r._id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis & Resume Details */}
        <div className="lg:col-span-7">
          {selectedResume ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
              {/* Header with quick CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedResume.originalFilename}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedResume.analysisStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : selectedResume.analysisStatus === 'processing'
                          ? 'bg-blue-50 text-blue-700 animate-pulse'
                          : selectedResume.analysisStatus === 'failed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {selectedResume.analysisStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Uploaded on{' '}
                    {new Date(selectedResume.createdAt).toLocaleDateString([], {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReanalyze(selectedResume._id)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold flex items-center gap-1.5"
                    title="Re-analyze with AI"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-analyze</span>
                  </button>

                  <button
                    onClick={() =>
                      navigate('/interview/new', {
                        state: {
                          selectedResumeId: selectedResume._id,
                          suggestedRole: analysis?.results?.recommendedRoles?.[0] || '',
                        },
                      })
                    }
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Practice with this Resume</span>
                  </button>
                </div>
              </div>

              {/* Analysis Content */}
              {selectedResume.analysisStatus === 'completed' && analysis?.results ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Professional Summary
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                      {analysis.results.summary}
                    </p>
                  </div>

                  {/* Strengths & Gaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Top Strengths
                      </h4>
                      <ul className="space-y-1.5 text-xs text-emerald-950">
                        {analysis.results.strengths?.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Identified Gaps
                      </h4>
                      <ul className="space-y-1.5 text-xs text-amber-950">
                        {analysis.results.gaps?.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Extracted Skills */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      Extracted Skills & Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(analysis.parsedSkills || analysis.results.keyTechnologies || []).map(
                        (skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-indigo-50/70 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Recommended Target Roles */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                      Recommended Job Roles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.results.recommendedRoles?.map((role, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-semibold"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : selectedResume.analysisStatus === 'processing' ? (
                <div className="py-16 text-center">
                  <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-900">AI is analyzing your resume...</p>
                  <p className="text-xs text-gray-400 mt-1">Extracting skills, experience, and custom questions</p>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-xs text-gray-500">
                    Analysis is pending or was not initiated. Click "Re-analyze" above to start.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900">No Resume Selected</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Upload a resume on the left or select an existing one to review parsed skills and AI insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
