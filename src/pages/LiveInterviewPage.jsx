import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  RotateCcw,
  LogOut,
  Send,
  HelpCircle,
  Check,
} from 'lucide-react';
import { interviewApi } from '../api/interviews';

export default function LiveInterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentTextAnswer, setCurrentTextAnswer] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // in seconds
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    initInterview();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [id]);

  const initInterview = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch interview and start if needed
      const res = await interviewApi.start(id);
      if (res.success && res.interview) {
        setInterview(res.interview);
        setQuestions(res.questions || []);
        setCurrentIndex(res.interview.currentQuestionIndex || 0);

        // Set duration timer
        const durationSecs = (res.interview.durationLimit || 30) * 60;
        setTimeLeft(durationSecs);
        startTimer(durationSecs);

        // Fetch existing answers to restore progress
        fetchExistingAnswers(res.interview._id);
      } else {
        setError(res.message || 'Failed to start interview.');
      }
    } catch (err) {
      setError(err.message || 'Error loading interview session.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAnswers = async (interviewId) => {
    try {
      const res = await interviewApi.getAnswers(interviewId);
      if (res.success && res.answers) {
        const answersMap = {};
        res.answers.forEach((ans) => {
          const qId = typeof ans.questionId === 'object' ? ans.questionId._id : ans.questionId;
          answersMap[qId] = ans;
        });
        setAnswers(answersMap);
      }
    } catch (err) {
      console.warn('Failed to load answers:', err);
    }
  };

  const startTimer = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinishInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Setup Web Speech API for voice recording
  const toggleSpeechRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      alert('Speech Recognition is not supported in this browser. Please type your answer.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let liveTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            liveTranscript += event.results[i][0].transcript;
          }
          setTranscript(liveTranscript);
          setCurrentTextAnswer((prev) => (prev ? `${prev} ${liveTranscript}` : liveTranscript));
        };

        recognition.onerror = (event) => {
          console.warn('Speech error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition failed to start:', err);
        setIsRecording(false);
      }
    }
  };

  // Text to speech for reading current question
  const toggleSpeakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeakingQuestion(false);
      utterance.onerror = () => setIsSpeakingQuestion(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingQuestion(true);
    }
  };

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentQId = currentQuestion?._id;
  const hasAnsweredCurrent = answers[currentQId] !== undefined;

  const handleSubmitAnswer = async () => {
    const answerContent = currentTextAnswer.trim() || transcript.trim();
    if (!answerContent) {
      setError('Please provide an answer before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }

      const res = await interviewApi.submitAnswer(id, {
        questionId: currentQId,
        textAnswer: answerContent,
        transcript: transcript || null,
        submissionStatus: 'submitted',
      });

      if (res.success && res.answer) {
        setAnswers((prev) => ({ ...prev, [currentQId]: res.answer }));
        if (res.answer.evaluation) {
          setCurrentEvaluation(res.answer.evaluation);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    setCurrentTextAnswer('');
    setTranscript('');
    setCurrentEvaluation(null);

    if (isLastQuestion) {
      handleFinishInterview();
    } else {
      try {
        await interviewApi.nextQuestion(id);
        setCurrentIndex((prev) => prev + 1);
      } catch {
        setCurrentIndex((prev) => prev + 1);
      }
    }
  };

  const handleFinishInterview = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.complete(id);
      if (res.success) {
        navigate(`/interviews/${id}/report`);
      } else {
        navigate(`/interviews/${id}/report`);
      }
    } catch (err) {
      console.warn('Complete interview response:', err);
      navigate(`/interviews/${id}/report`);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-gray-900">Preparing Interview Room...</h2>
        <p className="text-xs text-gray-400 mt-1">Generating personalized questions and configuring AI rubrics</p>
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Failed to Load Interview</h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      {/* Top Interview Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>{interview?.title || 'Mock Interview'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
              {interview?.interviewType}
            </span>
          </h1>
          <p className="text-[11px] text-gray-400">
            {interview?.jobRole} • Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono font-bold text-gray-700">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {/* End / Exit Button */}
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">End Session</span>
          </button>
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex flex-col">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700">
                Question {currentIndex + 1}
              </span>
              <span className="text-xs text-gray-400 capitalize">
                {currentQuestion?.difficulty} difficulty
              </span>
            </div>

            {/* Read question audio button */}
            <button
              onClick={() => toggleSpeakQuestion(currentQuestion?.questionText)}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title="Read Question Aloud"
            >
              {isSpeakingQuestion ? (
                <VolumeX className="w-4 h-4 text-indigo-600 animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
            {currentQuestion?.questionText}
          </h2>

          {/* Expected concepts / criteria tags if any */}
          {currentQuestion?.expectedConcepts?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-[11px] font-semibold text-gray-400">Key Themes:</span>
              {currentQuestion.expectedConcepts.map((concept, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 font-medium"
                >
                  {concept}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Answer Input Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Your Answer
              </label>

              {/* Voice recording toggle button */}
              <button
                type="button"
                onClick={toggleSpeechRecording}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse shadow-xs shadow-red-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Listening (Click to stop)' : 'Speak Answer'}</span>
              </button>
            </div>

            {hasAnsweredCurrent ? (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {answers[currentQId]?.textAnswer || answers[currentQId]?.transcript}
              </div>
            ) : (
              <div className="relative">
                <textarea
                  rows={7}
                  value={currentTextAnswer}
                  onChange={(e) => setCurrentTextAnswer(e.target.value)}
                  placeholder="Type your answer clearly, or click 'Speak Answer' to dictate using your microphone..."
                  className="w-full p-4 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                />
                {transcript && (
                  <p className="text-[11px] text-gray-400 italic mt-1 px-1">
                    Speech preview: "{transcript}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Feedback Card (if answer was submitted and evaluated) */}
          {currentEvaluation && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-100 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  AI Evaluation
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-600 text-white">
                  Score: {currentEvaluation.score}%
                </span>
              </div>

              {currentEvaluation.strengths?.length > 0 && (
                <div className="text-xs text-emerald-800">
                  <span className="font-bold">Strength: </span>
                  {currentEvaluation.strengths[0]}
                </div>
              )}

              {currentEvaluation.improvements?.length > 0 && (
                <div className="text-xs text-amber-800">
                  <span className="font-bold">To Improve: </span>
                  {currentEvaluation.improvements[0]}
                </div>
              )}

              {currentEvaluation.suggestedAnswer && (
                <div className="text-xs text-gray-600 bg-white/70 p-3 rounded-xl border border-white">
                  <span className="font-bold text-gray-800 block mb-1">Model Answer:</span>
                  {currentEvaluation.suggestedAnswer}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Submit & Next */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {hasAnsweredCurrent ? '✓ Answer submitted' : 'Answer before proceeding'}
            </span>

            <div className="flex items-center gap-3">
              {!hasAnsweredCurrent ? (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || (!currentTextAnswer.trim() && !transcript.trim())}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Evaluating...' : 'Submit Answer'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
                >
                  <span>{isLastQuestion ? 'Complete Interview' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">End this interview session?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your submitted answers will be preserved and a report will be generated for the completed questions.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Continue Interview
              </button>
              <button
                onClick={handleFinishInterview}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
