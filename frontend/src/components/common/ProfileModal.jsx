import React, { useState, useEffect } from 'react';
import { X, User, Mail, Hash, BookOpen, Layers, Calendar, Award, Shield, Check, Copy, RefreshCw } from 'lucide-react';
import { getUserInitials, getUserDisplayName, getUserAccountLabel } from '../../utils/userUtils';
import { getStudentProfile } from '../../services/erpService';
import { getCurrentUser } from '../../services/authService';

export default function ProfileModal({ isOpen, onClose, user }) {
  const [copiedField, setCopiedField] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLiveProfile();
    }
  }, [isOpen]);

  const loadLiveProfile = async () => {
    setLoading(true);
    try {
      if (user?.role === 'STUDENT') {
        const data = await getStudentProfile();
        if (data) {
          setProfile(data);
        }
      } else {
        const meData = await getCurrentUser();
        if (meData) {
          setProfile(meData);
        }
      }
    } catch (err) {
      console.warn('Could not fetch live profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isStudent = user.role === 'STUDENT';
  const isFaculty = user.role === 'FACULTY';
  const isAdmin = user.role === 'ADMIN';

  // Prefer live database profile, fallback to context user
  const effectiveData = profile || user;

  const initials = getUserInitials(effectiveData);
  const displayName = effectiveData.full_name || getUserDisplayName(effectiveData);
  
  const currentSem = effectiveData.current_semester ?? effectiveData.semester ?? user.current_semester ?? user.semester ?? 1;
  const yearNumber = effectiveData.admission_year 
    ? (2027 - effectiveData.admission_year)
    : (effectiveData.year ?? Math.ceil(currentSem / 2));
  
  const branchName = effectiveData.branch || user.branch || 'Engineering';
  const branchShort = branchName.includes('(') ? branchName.split('(')[0].trim() : (branchName.toLowerCase().includes('computer') ? 'CSE' : branchName);
  const accountLabel = isStudent ? `Student • ${branchShort} (Year ${yearNumber})` : getUserAccountLabel(effectiveData);

  const collegeId = effectiveData.college_id || user.college_id || (effectiveData.id ? `UIT26${String(effectiveData.id).padStart(4, '0')}` : 'UIT260001');
  const rollNumber = effectiveData.enrollment_number || effectiveData.roll_number || user.enrollment_number || user.roll_number || user.identifier || user.username;
  const email = effectiveData.email || user.email || 'N/A';
  const section = effectiveData.section ? `Section ${effectiveData.section}` : (user.section ? `Section ${user.section}` : 'Section A');
  const semesterStr = `Semester ${currentSem}`;
  const academicYear = `Year ${yearNumber} (B.Tech)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900 dark:text-white transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            {/* Avatar Initials Chip */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-2xl font-black shadow-lg ring-4 ring-white/10 shrink-0 uppercase">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider mb-1">
                <Shield className="w-3 h-3 mr-1" />
                <span>{user.role} PROFILE</span>
              </div>
              <h3 className="text-lg font-black truncate leading-tight">{displayName}</h3>
              <p className="text-xs text-indigo-300 font-medium truncate mt-0.5">{accountLabel}</p>
            </div>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Key ID Badges */}
          <div className="grid grid-cols-2 gap-3">
            {/* College ID */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 relative group">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">College ID</span>
                <button
                  onClick={() => handleCopy(collegeId, 'college_id')}
                  title="Copy College ID"
                  className="text-slate-400 hover:text-indigo-600 transition"
                >
                  {copiedField === 'college_id' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400 tracking-wide">
                {collegeId}
              </p>
            </div>

            {/* University Roll No / Employee ID */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 relative group">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {isStudent ? 'Roll No / Enrollment' : 'Employee ID'}
                </span>
                <button
                  onClick={() => handleCopy(rollNumber, 'roll_number')}
                  title="Copy Roll Number"
                  className="text-slate-400 hover:text-indigo-600 transition"
                >
                  {copiedField === 'roll_number' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {rollNumber}
              </p>
            </div>
          </div>

          {/* Detailed Info List */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/60 divide-y divide-slate-100 dark:divide-slate-800">
            {/* Email */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs font-semibold">Email Address</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate max-w-[200px]" title={email}>
                {email}
              </span>
            </div>

            {/* Branch / Department */}
            <div className="p-3 sm:p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs font-semibold">{isStudent ? 'Branch / Program' : 'Department'}</span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 text-right">
                {branchName}
              </span>
            </div>

            {isStudent && (
              <>
                {/* Class Section */}
                <div className="p-3 sm:p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                    <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-semibold">Class Section</span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-bold font-mono">
                    {section}
                  </span>
                </div>

                {/* Semester */}
                <div className="p-3 sm:p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-semibold">Current Semester</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {semesterStr}
                  </span>
                </div>

                {/* Academic Year */}
                <div className="p-3 sm:p-3.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                    <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-xs font-semibold">Academic Year</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                    {academicYear}
                  </span>
                </div>
              </>
            )}

            {isFaculty && (
              <div className="p-3 sm:p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                  <Award className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-xs font-semibold">Designation</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  {effectiveData.designation || 'Professor'}
                </span>
              </div>
            )}
          </div>

          {/* Institutional Note */}
          <div className="p-3 bg-indigo-50/50 dark:bg-slate-800/60 rounded-xl border border-indigo-100 dark:border-slate-700 text-center space-y-0.5">
            <p className="text-[11px] font-black text-slate-900 dark:text-white">
              Campus<span className="text-cyan-500">ERP</span> &bull; <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">CONNECT &bull; MANAGE &bull; EMPOWER</span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              United Institute of Technology &bull; Student Academic Identity
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition shadow-sm"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
