import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { uploadMaterialFile, getFacultyDashboard } from '../services/erpService';
import {
  Upload, CheckCircle2, Link2, FileText, Target, BookOpen,
  Sparkles, Calendar, Paperclip, X, AlertCircle, Layers
} from 'lucide-react';

const BRANCH_OPTIONS = [
  { id: '', label: 'All Branches / Programs' },
  { id: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
  { id: 'Information Technology', label: 'Information Technology (IT)' },
  { id: 'Electronics & Communication Engineering', label: 'Electronics & Communication (ECE)' },
  { id: 'Mechanical Engineering', label: 'Mechanical Engineering (ME)' },
  { id: 'Civil Engineering', label: 'Civil Engineering (CE)' },
];

const YEAR_OPTIONS = [
  { id: '', label: 'All Academic Years' },
  { id: '1', label: '1st Year' },
  { id: '2', label: '2nd Year' },
  { id: '3', label: '3rd Year' },
  { id: '4', label: '4th Year' },
];

const SEMESTER_OPTIONS = [
  { id: '', label: 'All Semesters' },
  { id: '1', label: 'Semester 1' },
  { id: '2', label: 'Semester 2' },
  { id: '3', label: 'Semester 3' },
  { id: '4', label: 'Semester 4' },
  { id: '5', label: 'Semester 5' },
  { id: '6', label: 'Semester 6' },
  { id: '7', label: 'Semester 7' },
  { id: '8', label: 'Semester 8' },
];

const SECTION_OPTIONS = [
  { id: '', label: 'All Sections (Whole Cohort)' },
  { id: 'A', label: 'Section A' },
  { id: 'B', label: 'Section B' },
  { id: 'C', label: 'Section C' },
  { id: 'D', label: 'Section D' },
];

export default function FacultyUploadMaterial() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('FILE'); // 'FILE' or 'LINK'

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectCode, setSubjectCode] = useState('BCS701');
  const [subjectName, setSubjectName] = useState('ARTIFICIAL INTELLIGENCE');
  const [materialType, setMaterialType] = useState('NOTE');

  // Separate Target Dropdowns
  const [targetYear, setTargetYear] = useState('4');
  const [semesterNumber, setSemesterNumber] = useState('7');
  const [targetBranch, setTargetBranch] = useState('Computer Science & Engineering');
  const [targetSection, setTargetSection] = useState('A');
  const [dueDate, setDueDate] = useState('');
  const [externalLink, setExternalLink] = useState('');

  // Selected Local Computer File
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    getFacultyDashboard()
      .then(res => {
        if (res.assigned_subjects?.length > 0) {
          setSubjects(res.assigned_subjects);
          setSubjectCode(res.assigned_subjects[0].code);
          setSubjectName(res.assigned_subjects[0].name);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubjectChange = (e) => {
    const sub = subjects.find(s => s.code === e.target.value);
    if (sub) {
      setSubjectCode(sub.code);
      setSubjectName(sub.name);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'FILE' && !selectedFile) {
      setFeedback({ type: 'error', message: 'Please select a file from your computer to upload.' });
      return;
    }
    if (mode === 'LINK' && !externalLink) {
      setFeedback({ type: 'error', message: 'Please provide an external URL.' });
      return;
    }

    setUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subject_code', subjectCode);
      formData.append('subject_name', subjectName);
      formData.append('material_type', materialType);
      if (description) formData.append('description', description);
      if (targetYear) formData.append('target_year', parseInt(targetYear));
      if (semesterNumber) formData.append('semester_number', parseInt(semesterNumber));
      if (targetBranch) formData.append('target_branch', targetBranch);
      if (targetSection) formData.append('target_section', targetSection);
      if (dueDate) formData.append('due_date', dueDate);
      if (mode === 'LINK' && externalLink) formData.append('external_link', externalLink);
      if (mode === 'FILE' && selectedFile) formData.append('file', selectedFile);

      const res = await uploadMaterialFile(formData);
      setFeedback({
        type: 'success',
        message: `${res.message || 'Material uploaded successfully!'} Available immediately in Student Hub.`
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setExternalLink('');
      setDueDate('');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to upload study material file.'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Loading faculty portal..." /></PageContainer>;

  return (
    <PageContainer>
      <div className="mb-6 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold mb-2 border border-indigo-500/30">
            <Upload className="w-3.5 h-3.5" />
            <span>Digital Study Material & Resource Publisher</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Upload & Distribute Academic Resources
          </h1>
          <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
            Upload local PDF lecture slides, handwritten notes, previous year question papers (PYQs), or share external links with granular Year, Semester, Branch, and Section targeting.
          </p>
        </div>
      </div>

      <Card
        title="Publish Academic Resource to Student Hub"
        icon={BookOpen}
        subtitle="Complete the resource details and select target cohort filters"
      >
        {feedback && (
          <div className={`mb-5 p-3.5 rounded-2xl text-xs font-bold flex items-center space-x-2.5 border transition ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold">
          {/* Row 1: Title & Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Resource Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CS701 — Complete End-Sem Revision Notes & PYQ Solutions"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Associated Subject *</label>
              <select
                value={subjectCode}
                onChange={handleSubjectChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition"
              >
                {subjects.map(s => (
                  <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TARGET AUDIENCE: SEPARATE DROPDOWNS FOR YEAR, SEMESTER, CLASS/BRANCH, SECTION */}
          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100">
            <div className="flex items-center space-x-2 text-indigo-950 font-black mb-3 text-xs">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Target Audience Controls (Separate Dropdowns for Full Granularity)</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Year Dropdown */}
              <div>
                <label className="block text-slate-700 mb-1">Academic Year</label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  {YEAR_OPTIONS.map(y => (
                    <option key={y.id} value={y.id}>{y.label}</option>
                  ))}
                </select>
              </div>

              {/* Semester Dropdown */}
              <div>
                <label className="block text-slate-700 mb-1">Semester</label>
                <select
                  value={semesterNumber}
                  onChange={(e) => setSemesterNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  {SEMESTER_OPTIONS.map(sm => (
                    <option key={sm.id} value={sm.id}>{sm.label}</option>
                  ))}
                </select>
              </div>

              {/* Class / Branch Dropdown */}
              <div>
                <label className="block text-slate-700 mb-1">Class / Branch</label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  {BRANCH_OPTIONS.map(b => (
                    <option key={b.id} value={b.id}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Section Dropdown */}
              <div>
                <label className="block text-slate-700 mb-1">Section</label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  {SECTION_OPTIONS.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Material Category & Optional Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Resource Classification</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
              >
                <option value="NOTE">📖 Lecture Notes & Slides</option>
                <option value="PYQ">📝 Previous Year Questions (PYQs)</option>
                <option value="ASSIGNMENT">📋 Assignment / Problem Set</option>
                <option value="CONTEST_PREP">⚡ Coding Contest / DSA Problem Sheet</option>
                <option value="REFERENCE_LINK">🔗 Reference Documentation / Playlist</option>
                <option value="ANNOUNCEMENT">📢 Exam / Hackathon Announcement</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Submission Due Date (Optional for Assignments)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* REAL FILE PICKER OR EXTERNAL LINK */}
          <div>
            <label className="block text-slate-700 mb-1.5">Resource Source Format</label>
            <div className="flex space-x-2 mb-3">
              <button
                type="button"
                onClick={() => setMode('FILE')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border transition text-xs font-bold ${
                  mode === 'FILE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Upload File from Computer (PDF, Doc, ZIP)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('LINK')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border transition text-xs font-bold ${
                  mode === 'LINK'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>External Web Link (Drive, GitHub, YouTube)</span>
              </button>
            </div>

            {mode === 'FILE' ? (
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 transition text-center">
                <input
                  type="file"
                  id="material-file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg"
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="flex items-center justify-between p-3 bg-white border border-indigo-200 rounded-xl shadow-xs">
                    <div className="flex items-center space-x-2.5 text-left">
                      <FileText className="w-6 h-6 text-indigo-600 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB &bull; Selected from Computer</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="material-file-upload" className="cursor-pointer block py-4">
                    <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-slate-800">
                      Click to choose a file from your computer
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supports PDF, PowerPoint, Word documents, text sheets, and ZIP archives (Up to 50MB)
                    </p>
                  </label>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-slate-600 mb-1">External Resource URL *</label>
                <input
                  type="url"
                  required={mode === 'LINK'}
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://github.com/topics/competitive-programming or https://drive.google.com/file/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 mb-1">Description & Teacher Instructions</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide chapter summary, problem solutions overview, submission guidelines or contest rules..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center space-x-2 text-xs"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading File & Publishing...' : 'Upload & Publish to Student Hub'}</span>
          </button>
        </form>
      </Card>
    </PageContainer>
  );
}


