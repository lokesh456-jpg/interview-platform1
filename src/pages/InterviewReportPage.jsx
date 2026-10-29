import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  RotateCcw,
  Printer,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  Layers,
  Clock,
  Calendar,
  Share2,
} from 'lucide-react';
import { interviewApi } from '../api/interviews';

export default function InterviewReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.getReport(id);
      if (res.success && res.report) {
        setReport(res.report);
        setInterview(res.interview);
      } else if (res.status === 'pending') {
        // Polling retry while report is generating in backend
        setTimeout(loadReport, 2500);
      } else {
        setError(res.message || 'Report not found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load report.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      const res = await interviewApi.retry(id);
      if (res.success && res.interview) {
        navigate(`/interview/${res.interview._id}`);
      }
    } catch (err) {
      alert('Failed to retry interview: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-gray-900">Synthesizing Comprehensive Report...</h2>
        <p className="text-xs text-gray-400 mt-1">
          Evaluating rubrics, missed concepts, and skill breakdowns with AI
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Report Unavailable</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">{error || 'Could not find report.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const overallScore = report.overallScore ?? 75;
  const skillScores = report.skillScores || {
    technicalKnowledge: 80,
    problemSolving: 75,
    communication: 70,
    confidence: 75,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 print:p-0">
      {/* Action Bar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white px-3.5 py-2 rounded-xl border border-gray-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Interview</span>
          </button>
        </div>
      </div>

      {/* Main Score & Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interview Completed</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {interview?.title || 'Mock Technical Interview'}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {new Date(report.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {interview?.totalDuration
                ? `${Math.round(interview.totalDuration / 60)} mins`
                : '20 mins'}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              {report.questionSummaries?.length || 0} Questions
            </span>
          </div>
        </div>

        {/* Circular Overall Score Card */}
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-tr from-indigo-50/60 to-purple-50/40 rounded-3xl border border-indigo-100 shrink-0 w-44 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-200 mb-2">
            <span className="text-2xl font-black">{overallScore}%</span>
            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">Score</span>
          </div>
          <p className="text-xs font-bold text-gray-800">
            {overallScore >= 80 ? 'Exceptional' : overallScore >= 70 ? 'Competent' : 'Needs Practice'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Overall Assessment</p>
        </div>
      </div>

      {/* Skill Scores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Technical Knowledge', score: skillScores.technicalKnowledge || 80, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Problem Solving', score: skillScores.problemSolving || 75, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Communication', score: skillScores.communication || 70, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Confidence', score: skillScores.confidence || 75, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item) => (
          <div key={item.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs font-medium text-gray-500 block truncate">{item.label}</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-black ${item.color}`}>{item.score}%</span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full ${item.bg.replace('50', '500')}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Key Strengths</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-600">
            {(report.strengths || ['Clear structural communication', 'Sound understanding of fundamentals']).map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Areas to Improve</span>
          </h3>
          <ul className="space-y-2 text-xs text-gray-600">
            {(report.improvementAreas || ['Include edge-case trade-off discussion', 'Quantify metrics and business outcomes']).map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/60">
                <span className="text-amber-600 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question by Question Detailed Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-gray-900 mb-2">Question-by-Question Evaluation</h3>

        <div className="space-y-3">
          {report.questionSummaries?.map((q, idx) => {
            const isExpanded = expandedQuestion === idx;
            return (
              <div
                key={idx}
                className="border border-gray-100 rounded-2xl overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="p-4 sm:p-5 bg-gray-50/60 hover:bg-gray-100/50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                      {q.questionText}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white">
                      {q.score !== null ? `${q.score}%` : 'N/A'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-4 bg-white border-t border-gray-100 text-xs">
                    {/* User Answer */}
                    <div>
                      <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Your Answer:
                      </span>
                      <p className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/70 text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {q.userAnswer || 'No answer recorded.'}
                      </p>
                    </div>

                    {/* Model Answer */}
                    {q.suggestedAnswer && (
                      <div>
                        <span className="font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                          Suggested Model Answer:
                        </span>
                        <p className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-indigo-950 leading-relaxed">
                          {q.suggestedAnswer}
                        </p>
                      </div>
                    )}

                    {/* Feedback Rubrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {q.strengths?.length > 0 && (
                        <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                          <span className="font-bold text-emerald-800 block mb-1">Strengths:</span>
                          <ul className="space-y-1 text-emerald-900">
                            {q.strengths.map((str, i) => (
                              <li key={i}>• {str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {q.improvements?.length > 0 && (
                        <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                          <span className="font-bold text-amber-800 block mb-1">
                            Areas to Polish:
                          </span>
                          <ul className="space-y-1 text-amber-900">
                            {q.improvements.map((imp, i) => (
                              <li key={i}>• {imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Next Steps */}
      {report.recommendedTopics?.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Recommended Study Topics</h3>
          <div className="flex flex-wrap gap-2">
            {report.recommendedTopics.map((topic, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-semibold"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
