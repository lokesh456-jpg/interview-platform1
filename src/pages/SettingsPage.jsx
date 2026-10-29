import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  Shield,
  Lock,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/settings';
import { authApi } from '../api/auth';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'mid');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'English');
  const [roleInput, setRoleInput] = useState('');
  const [preferredRoles, setPreferredRoles] = useState(user?.preferredRoles || ['Full Stack Engineer']);

  // Preferences Form State
  const [preferredDifficulty, setPreferredDifficulty] = useState(user?.preferredDifficulty || 'medium');
  const [preferredDuration, setPreferredDuration] = useState(user?.preferredDuration || 30);
  const [preferredAnswerMode, setPreferredAnswerMode] = useState(user?.preferredAnswerMode || 'text');
  const [skills, setSkills] = useState(
    user?.skills || [
      { name: 'Data Structures & Algorithms', level: 85 },
      { name: 'System Design', level: 72 },
      { name: 'React.js', level: 68 },
      { name: 'Node.js', level: 80 },
      { name: 'MongoDB', level: 70 },
    ]
  );
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(70);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Privacy Form State
  const [resumeRetention, setResumeRetention] = useState(user?.resumeRetentionPreference ?? true);
  const [audioConsent, setAudioConsent] = useState(user?.audioRecordingConsent ?? false);

  // Delete Account Form State
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setExperienceLevel(user.experienceLevel || 'mid');
      setPreferredLanguage(user.preferredLanguage || 'English');
      setPreferredRoles(user.preferredRoles || ['Full Stack Engineer']);
      setPreferredDifficulty(user.preferredDifficulty || 'medium');
      setPreferredDuration(user.preferredDuration || 30);
      setPreferredAnswerMode(user.preferredAnswerMode || 'text');
      if (user.skills && user.skills.length > 0) setSkills(user.skills);
      setResumeRetention(user.resumeRetentionPreference ?? true);
      setAudioConsent(user.audioRecordingConsent ?? false);
    }
  }, [user]);

  const clearMessages = () => {
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      setSaving(true);
      const res = await settingsApi.updateProfile({
        name,
        experienceLevel,
        preferredLanguage,
        preferredRoles,
      });
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Profile updated successfully.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      setSaving(true);
      const res = await settingsApi.updatePreferences({
        preferredDifficulty,
        preferredDuration: Number(preferredDuration),
        preferredAnswerMode,
        skills,
      });
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Interview preferences saved.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      setSaving(true);
      const res = await settingsApi.updatePrivacy({
        resumeRetentionPreference: resumeRetention,
        audioRecordingConsent: audioConsent,
      });
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccessMsg('Privacy preferences updated.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update privacy settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    try {
      setSaving(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setSuccessMsg('Password changed. Please log in with your new password.');
        setTimeout(logout, 2000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    clearMessages();
    try {
      const blob = await settingsApi.exportData();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'interviewai-export.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccessMsg('Personal data export downloaded.');
    } catch (err) {
      setErrorMsg('Data export failed: ' + err.message);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!window.confirm('WARNING: This will permanently delete your account, resumes, and reports. Continue?')) {
      return;
    }
    try {
      setSaving(true);
      const res = await settingsApi.deleteAccount(deleteConfirmPassword);
      if (res.success) {
        alert('Account deleted.');
        window.location.href = '/';
      }
    } catch (err) {
      setErrorMsg(err.message || 'Account deletion failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account & Preferences</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage your personal profile, mock interview configurations, privacy, and security settings.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-semibold text-gray-500 overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'preferences', label: 'Interview Preferences', icon: Sliders },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'privacy', label: 'Privacy & Data', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                clearMessages();
              }}
              className={`flex items-center gap-2 pb-3 transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 bg-gray-100 text-xs sm:text-sm text-gray-500 rounded-xl border border-gray-200 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="principal">Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Preferred Language</label>
              <input
                type="text"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <h2 className="text-sm font-bold text-gray-900">Default Interview Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Difficulty</label>
              <select
                value={preferredDifficulty}
                onChange={(e) => setPreferredDifficulty(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs text-gray-900 rounded-xl border border-gray-200 outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Duration</label>
              <select
                value={preferredDuration}
                onChange={(e) => setPreferredDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs text-gray-900 rounded-xl border border-gray-200 outline-none"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Answer Mode</label>
              <select
                value={preferredAnswerMode}
                onChange={(e) => setPreferredAnswerMode(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs text-gray-900 rounded-xl border border-gray-200 outline-none"
              >
                <option value="text">Text Input</option>
                <option value="voice">Voice Dictation</option>
              </select>
            </div>
          </div>

          {/* Manage Skills Bar */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-900 mb-2">Manage Top Skills</h3>
            <p className="text-[11px] text-gray-400 mb-4">
              These appear in the "Your Top Skills" card on your dashboard.
            </p>

            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => {
                      const updated = [...skills];
                      updated[idx].name = e.target.value;
                      setSkills(updated);
                    }}
                    className="flex-1 px-3 py-1.5 bg-gray-50 text-xs rounded-lg border border-gray-200 outline-none"
                  />
                  <div className="flex items-center gap-2 w-36">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={skill.level}
                      onChange={(e) => {
                        const updated = [...skills];
                        updated[idx].level = Number(e.target.value);
                        setSkills(updated);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg accent-indigo-600"
                    />
                    <span className="text-xs font-bold text-gray-700 w-8">{skill.level}%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="New skill name..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-gray-50 text-xs rounded-lg border border-gray-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkillName.trim()) {
                      setSkills([...skills, { name: newSkillName.trim(), level: 70 }]);
                      setNewSkillName('');
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Security */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5 max-w-xl">
          <h2 className="text-sm font-bold text-gray-900">Change Password</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters (upper, lower, number)"
              required
              className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50/70 focus:bg-white text-xs sm:text-sm text-gray-900 rounded-xl border border-gray-200 outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Privacy & Data */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <form onSubmit={handleSavePrivacy} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <h2 className="text-sm font-bold text-gray-900">Privacy & Consent</h2>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resumeRetention}
                  onChange={(e) => setResumeRetention(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-gray-300"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Resume Retention</span>
                  <span className="text-[11px] text-gray-500">
                    Retain uploaded resume files for ongoing interview personalization until deleted.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={audioConsent}
                  onChange={(e) => setAudioConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-gray-300"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Speech & Voice Processing Consent
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Allow browser speech recognition during mock interviews. Audio is transcribed locally in browser.
                  </span>
                </div>
              </label>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-[11px] text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-800 block mb-1">External AI Processing Notice:</span>
              Interview responses and resume extracts are processed by modern foundation AI models (Gemini / OpenAI) strictly for mock evaluation. Data is never used to train public models.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                Save Privacy Settings
              </button>
            </div>
          </form>

          {/* Export Data */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Export Your Data</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Download a JSON archive of your profile, mock interviews, and reports.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </div>

          {/* Delete Account */}
          <form onSubmit={handleDeleteAccount} className="bg-red-50/40 p-6 sm:p-8 rounded-3xl border border-red-100 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-red-700">Delete Account Permanently</h3>
              <p className="text-xs text-red-600/80 mt-0.5">
                This will delete all your resumes, interviews, scores, and account records forever.
              </p>
            </div>

            <div className="max-w-md">
              <input
                type="password"
                placeholder="Confirm your password to delete"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-white text-xs rounded-xl border border-red-200 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Account</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
