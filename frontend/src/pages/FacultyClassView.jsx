import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  getEnrolledStudents,
  getFacultyDashboard,
  markStudentAttendance,
  submitBulkStudentMarks,
  getTimetable
} from '../services/erpService';
import {
  Users,
  CheckSquare,
  Edit3,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Filter,
  Save,
  Clock,
  BookOpen
} from 'lucide-react';

const presetClasses = [
  { label: 'CSE - Sem 7 (Sec A)', branch: 'Computer Science & Engineering', semester: 7, section: 'A' },
  { label: 'CSE - Sem 6 (Sec A)', branch: 'Computer Science & Engineering', semester: 6, section: 'A' },
  { label: 'IT - Sem 4 (Sec B)', branch: 'Information Technology', semester: 4, section: 'B' },
  { label: 'ECE - Sem 2 (Sec A)', branch: 'Electronics Engineering', semester: 2, section: 'A' },
];

export default function FacultyClassView() {
  const [loading, setLoading] = useState(true);

  // Selected Class Filter State
  const [selectedBranch, setSelectedBranch] = useState('Computer Science & Engineering');
  const [selectedSemester, setSelectedSemester] = useState(7);
  const [selectedSection, setSelectedSection] = useState('A');

  // Active Workspace Tab: 'ROSTER' | 'ATTENDANCE' | 'MARKS' | 'TIMETABLE'
  const [activeTab, setActiveTab] = useState('ROSTER');

  // Loaded Data
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  // Attendance Form State
  const [attSubject, setAttSubject] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriods, setSelectedPeriods] = useState([1]);
  const [attMap, setAttMap] = useState({}); // student_id -> 'PRESENT' | 'ABSENT'

  // Marks Form State
  const [marksSubject, setMarksSubject] = useState('');
  const [assessmentType, setAssessmentType] = useState('SESSIONAL_1');
  const [marksMap, setMarksMap] = useState({}); // student_id -> number score

  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Fetch data on Class Filter change
  useEffect(() => {
    fetchClassData();
  }, [selectedBranch, selectedSemester, selectedSection]);

  const fetchClassData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [stdList, facDashboard, ttList] = await Promise.all([
        getEnrolledStudents({
          branch: selectedBranch,
          semester: selectedSemester,
          section: selectedSection,
        }),
        getFacultyDashboard(),
        getTimetable(),
      ]);

      setStudents(stdList);

      if (facDashboard.assigned_subjects?.length > 0) {
        setSubjects(facDashboard.assigned_subjects);
        if (!attSubject) setAttSubject(facDashboard.assigned_subjects[0].id);
        if (!marksSubject) setMarksSubject(facDashboard.assigned_subjects[0].id);
      }

      // Filter timetable slots for selected class
      const filteredTT = ttList.filter(
        (t) =>
          t.branch?.toLowerCase().includes(selectedBranch.toLowerCase()) &&
          t.semester === parseInt(selectedSemester) &&
          t.section?.toLowerCase() === selectedSection.toLowerCase()
      );
      setTimetableSlots(filteredTT.length > 0 ? filteredTT : ttList);

      // Initialize Attendance Map to PRESENT
      const initialAtt = {};
      const initialMarks = {};
      stdList.forEach((s) => {
        initialAtt[s.id] = 'PRESENT';
        initialMarks[s.id] = 25.0;
      });
      setAttMap(initialAtt);
      setMarksMap(initialMarks);
    } catch (err) {
      console.error('Failed to load class data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setSelectedBranch(preset.branch);
    setSelectedSemester(preset.semester);
    setSelectedSection(preset.section);
  };

  const toggleAttendanceStatus = (studentId) => {
    setAttMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }));
  };

  const setAllAttendance = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttMap(updated);
  };

  const togglePeriodNumber = (periodNum) => {
    setSelectedPeriods(prev => {
      if (prev.includes(periodNum)) {
        if (prev.length === 1) return prev;
        return prev.filter(p => p !== periodNum);
      } else {
        return [...prev, periodNum].sort((a, b) => a - b);
      }
    });
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = students.map((s) => ({
        student_id: s.id,
        subject_id: parseInt(attSubject),
        date: attDate,
        status: attMap[s.id] || 'PRESENT',
        class_number: selectedPeriods[0] || 1,
        class_numbers: selectedPeriods,
      }));

      await markStudentAttendance(payload);
      setFeedback({ type: 'success', message: `Successfully recorded attendance for ${payload.length} students across Period(s): ${selectedPeriods.join(', ')}.` });
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to record class attendance. Check edit limit rules.';
      setFeedback({ type: 'error', message: detail });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = students.map((s) => ({
        student_id: s.id,
        subject_id: parseInt(marksSubject),
        assessment_type: assessmentType,
        marks: parseFloat(marksMap[s.id] || 0),
        maximum_marks: 30.0,
      }));

      await submitBulkStudentMarks(payload);
      setFeedback({ type: 'success', message: `Successfully submitted sessional scores for ${payload.length} students.` });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to submit class sessional marks.' });
    } finally {
      setSubmitting(false);
    }
  };

  const avgCgpa = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length).toFixed(2)
    : '0.00';

  return (
    <PageContainer>
      {/* Header Banner & Class Selector Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
              <Layers className="w-3.5 h-3.5" />
              <span>Faculty Class Traversal Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Class Management Workspace</h1>
            <p className="text-xs text-indigo-200/80">
              Select any class section to view student roster, submit online attendance, post sessional marks, and inspect weekly timetables.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Class Traversal</p>
            <div className="flex flex-wrap gap-2">
              {presetClasses.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedBranch === p.branch && selectedSemester === p.semester && selectedSection === p.section
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                      : 'bg-white/10 hover:bg-white/20 border-white/10 text-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual Class Selector Form */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-400 mb-1">Academic Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="Computer Science & Engineering">CSE — Computer Science</option>
              <option value="Information Technology">IT — Information Technology</option>
              <option value="Electronics Engineering">ECE — Electronics Engg</option>
              <option value="Mechanical Engineering">ME — Mechanical Engg</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:border-indigo-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-400 mb-1">Section</label>
            <input
              type="text"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value.toUpperCase())}
              placeholder="A"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Summary Metrics Bar for Selected Class */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-[10px] text-indigo-300 font-semibold uppercase">Students Enrolled</p>
            <p className="text-xl sm:text-2xl font-black text-white">{students.length}</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-[10px] text-indigo-300 font-semibold uppercase">Class Average CGPA</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-300">{avgCgpa}</p>
          </div>
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-[10px] text-indigo-300 font-semibold uppercase">Class Section</p>
            <p className="text-xl sm:text-2xl font-black text-amber-300">Sem {selectedSemester} - {selectedSection}</p>
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'ROSTER'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Whole Class Roster ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'ATTENDANCE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Take Online Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('MARKS')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'MARKS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Post Sessional Marks</span>
        </button>

        <button
          onClick={() => setActiveTab('TIMETABLE')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition ${
            activeTab === 'TIMETABLE'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Class Timetable</span>
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 border ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Fetching class details & roster..." />
      ) : (
        <>
          {/* TAB 1: CLASS ROSTER */}
          {activeTab === 'ROSTER' && (
            <Card title={`Whole Class Roster — ${selectedBranch} (Sem ${selectedSemester}, Sec ${selectedSection})`} icon={Users}>
              {students.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Roll Number / Enrollment No.</th>
                        <th className="py-3 px-4">Student Full Name</th>
                        <th className="py-3 px-4">Branch & Section</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4 text-center">CGPA</th>
                        <th className="py-3 px-4 text-center">Active Backlogs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-600">{s.enrollment_number}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{s.full_name}</td>
                          <td className="py-3 px-4 text-slate-600">{s.branch} (Sem {s.semester}-{s.section})</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{s.email}</td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">{s.cgpa || '8.5'}</td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-600">
                            {s.backlogs > 0 ? (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">{s.backlogs}</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  No students currently enrolled in this specific class filter.
                </div>
              )}
            </Card>
          )}

          {/* TAB 2: ONLINE ATTENDANCE */}
          {activeTab === 'ATTENDANCE' && (
            <Card title="Online Class Attendance Sheet" icon={CheckSquare} subtitle="Record student attendance for selected lecture date & subject">
              <form onSubmit={handleSaveAttendance} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 mb-1">Assigned Subject</label>
                    <select
                      value={attSubject}
                      onChange={(e) => setAttSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Lecture Date</label>
                    <input
                      type="date"
                      required
                      value={attDate}
                      onChange={(e) => setAttDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Select Period Slot(s)</label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {[1, 2, 3, 4, 5, 6, 7].map((p) => {
                        const isSel = selectedPeriods.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => togglePeriodNumber(p)}
                            className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                              isSel
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            P{p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Toggle Controls */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Quick Batch Attendance Actions:</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setAllAttendance('PRESENT')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition shadow-xs"
                    >
                      Mark All Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllAttendance('ABSENT')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition shadow-xs"
                    >
                      Mark All Absent
                    </button>
                  </div>
                </div>

                {/* Student Attendance List */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Roll Number</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Branch & Section</th>
                        <th className="py-3 px-4 text-right">Attendance Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s) => {
                        const isPresent = attMap[s.id] === 'PRESENT';
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.enrollment_number}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">{s.full_name}</td>
                            <td className="py-3 px-4 text-slate-600">Sem {s.semester} ({s.section})</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => toggleAttendanceStatus(s.id)}
                                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
                                  isPresent
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {isPresent ? 'PRESENT' : 'ABSENT'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving Class Attendance...' : 'Submit Class Attendance'}</span>
                </button>
              </form>
            </Card>
          )}

          {/* TAB 3: POST SESSIONAL MARKS FOR WHOLE CLASS */}
          {activeTab === 'MARKS' && (
            <Card title="Post Sessional Scores for Class" icon={Edit3} subtitle="Record sessional marks for each student in the selected class simultaneously">
              <form onSubmit={handleSaveMarks} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 mb-1">Assigned Subject</label>
                    <select
                      value={marksSubject}
                      onChange={(e) => setMarksSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Assessment Examination</label>
                    <select
                      value={assessmentType}
                      onChange={(e) => setAssessmentType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="SESSIONAL_1">SESSIONAL_1 (Max 30 Marks)</option>
                      <option value="SESSIONAL_2">SESSIONAL_2 (Max 30 Marks)</option>
                      <option value="MARKUP_1">MARKUP_1 (Lab Assessment)</option>
                      <option value="MARKUP_2">MARKUP_2 (Project Assessment)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Roll Number</th>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Max Marks</th>
                        <th className="py-3 px-4 w-44">Obtained Marks (/30)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.enrollment_number}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{s.full_name}</td>
                          <td className="py-3 px-4 font-semibold text-slate-500">30.0</td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="30"
                              required
                              value={marksMap[s.id] !== undefined ? marksMap[s.id] : 25}
                              onChange={(e) => {
                                const val = e.target.value;
                                setMarksMap((prev) => ({ ...prev, [s.id]: val }));
                              }}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:border-indigo-500 focus:bg-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving All Sessional Marks...' : 'Submit All Class Sessional Scores'}</span>
                </button>
              </form>
            </Card>
          )}

          {/* TAB 4: CLASS TIMETABLE */}
          {activeTab === 'TIMETABLE' && (
            <Card title={`Weekly Schedule — ${selectedBranch} (Sem ${selectedSemester}, Sec ${selectedSection})`} icon={Calendar}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timetableSlots.map((slot, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold text-[10px] rounded-lg">
                        {slot.day_of_week}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        {slot.start_time} - {slot.end_time}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{slot.subject_name}</p>
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                      <span>Faculty: {slot.faculty_name}</span>
                      <span className="font-semibold text-indigo-600">{slot.room_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </PageContainer>
  );
}
