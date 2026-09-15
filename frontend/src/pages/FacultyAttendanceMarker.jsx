import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  getEnrolledStudents, markStudentAttendance,
  getFacultyDashboard, getFacultyClasses
} from '../services/erpService';
import {
  CheckSquare, CheckCircle2, AlertCircle, Users,
  ArrowRight, ArrowLeft, Calendar, BookOpen, Layers, Clock
} from 'lucide-react';

const BRANCH_OPTIONS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];
const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function FacultyAttendanceMarker() {
  // Step 1: Selection | Step 2: Marking
  const [step, setStep] = useState(1);

  // Class Selection State
  const [selectedSemester, setSelectedSemester] = useState(7);
  const [selectedBranch, setSelectedBranch] = useState('Computer Science & Engineering');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('BCS701');
  const [selectedSubjectName, setSelectedSubjectName] = useState('ARTIFICIAL INTELLIGENCE');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriods, setSelectedPeriods] = useState([1]);

  // Data State
  const [facultyClasses, setFacultyClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Student ID -> Attendance Status ('PRESENT' or 'ABSENT')
  const [attMap, setAttMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    Promise.all([getFacultyDashboard(), getFacultyClasses()])
      .then(([facRes, classesRes]) => {
        if (facRes.assigned_subjects?.length > 0) {
          setSubjects(facRes.assigned_subjects);
          setSelectedSubjectId(facRes.assigned_subjects[0].id);
          setSelectedSubjectCode(facRes.assigned_subjects[0].code);
          setSelectedSubjectName(facRes.assigned_subjects[0].name);
        }
        if (classesRes && classesRes.length > 0) {
          setFacultyClasses(classesRes);
          // Default selection to the first assigned class
          const firstCls = classesRes[0];
          setSelectedSemester(firstCls.semester || 7);
          setSelectedBranch(firstCls.branch || 'Computer Science & Engineering');
          setSelectedSection(firstCls.section || 'A');
          if (firstCls.subject_id) setSelectedSubjectId(firstCls.subject_id);
          if (firstCls.subject_code) setSelectedSubjectCode(firstCls.subject_code);
          if (firstCls.subject_name) setSelectedSubjectName(firstCls.subject_name);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleQuickClassSelect = (cls) => {
    setSelectedSemester(cls.semester);
    setSelectedBranch(cls.branch);
    setSelectedSection(cls.section);
    if (cls.subject_id) setSelectedSubjectId(cls.subject_id);
    if (cls.subject_code) setSelectedSubjectCode(cls.subject_code);
    if (cls.subject_name) setSelectedSubjectName(cls.subject_name);
  };

  const handleProceedToMarking = async (e) => {
    if (e) e.preventDefault();
    setLoadingStudents(true);
    setFeedback(null);

    try {
      const stdRes = await getEnrolledStudents({
        semester: selectedSemester,
        branch: selectedBranch,
        section: selectedSection,
      });

      setStudents(stdRes);

      // Default all fetched students to PRESENT
      const initialMap = {};
      stdRes.forEach(s => { initialMap[s.id] = 'PRESENT'; });
      setAttMap(initialMap);

      setStep(2);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to fetch student roster for the selected class.' });
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setAttMap(updated);
  };

  const togglePeriodNumber = (periodNum) => {
    setSelectedPeriods(prev => {
      if (prev.includes(periodNum)) {
        if (prev.length === 1) return prev; // keep at least one period selected
        return prev.filter(p => p !== periodNum);
      } else {
        return [...prev, periodNum].sort((a, b) => a - b);
      }
    });
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const items = students.map(s => ({
        student_id: s.id,
        subject_id: parseInt(selectedSubjectId) || 1,
        date: attDate,
        status: attMap[s.id] || 'PRESENT',
        class_number: selectedPeriods[0] || 1,
        class_numbers: selectedPeriods,
      }));

      const res = await markStudentAttendance(items);
      setFeedback({
        type: 'success',
        message: `${res.message || 'Attendance recorded successfully'} for ${items.length} students across Period(s): ${selectedPeriods.join(', ')}.`
      });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to submit class attendance. Check 2-edit limit regulations.';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Loading faculty teaching schedule & classes..." /></PageContainer>;

  return (
    <PageContainer>
      {/* STEP 1: CLASS SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <Card
            title="Step 1: Select Class & Schedule Slot"
            icon={Layers}
            subtitle="Choose the target Semester, Branch, Section, Subject and Lecture Periods before taking attendance"
          >
            {feedback && (
              <div className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Quick-Select Cards for Faculty's Assigned Classes */}
            {facultyClasses.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quick Select from Your Assigned Timetable Classes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {facultyClasses.map((cls, idx) => {
                    const isSelected =
                      selectedSemester === cls.semester &&
                      selectedBranch === cls.branch &&
                      selectedSection === cls.section &&
                      (cls.subject_code ? selectedSubjectCode === cls.subject_code : true);

                    return (
                      <div
                        key={idx}
                        onClick={() => handleQuickClassSelect(cls)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 shadow-md shadow-indigo-100'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded-md">
                            Sem {cls.semester} &bull; Sec {cls.section}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {cls.room_number || 'LH 101'}
                          </span>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">
                            {cls.subject_name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {cls.branch}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detailed Selection Form */}
            <form onSubmit={handleProceedToMarking} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    {SEMESTER_OPTIONS.map(sem => (
                      <option key={sem} value={sem}>Semester {sem} (Year {Math.ceil(sem / 2)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Branch / Department</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    {BRANCH_OPTIONS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Section</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    {SECTION_OPTIONS.map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedSubjectId(val);
                      const matched = subjects.find(s => String(s.id) === String(val));
                      if (matched) {
                        setSelectedSubjectCode(matched.code);
                        setSelectedSubjectName(matched.name);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Attendance Date</label>
                  <input
                    type="date"
                    required
                    value={attDate}
                    onChange={(e) => setAttDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Lecture Period Slots (1-7)</label>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => {
                      const isSel = selectedPeriods.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => togglePeriodNumber(p)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
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
                  <p className="text-[10px] text-slate-400 mt-1">Select multiple for combined 2-hour labs or double periods</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loadingStudents}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>{loadingStudents ? 'Fetching Roster...' : 'Proceed to Take Attendance'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* STEP 2: MARK ATTENDANCE ROSTER */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Active Class Header Badge */}
          <div className="p-4 bg-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-800 rounded-xl">
                <CheckSquare className="w-5 h-5 text-indigo-200" />
              </div>
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
                  <span>Semester {selectedSemester}</span>
                  <span>&bull;</span>
                  <span>Section {selectedSection}</span>
                  <span>&bull;</span>
                  <span>{selectedBranch}</span>
                </div>
                <h2 className="text-sm sm:text-base font-black text-white">
                  {selectedSubjectCode} — {selectedSubjectName}
                </h2>
                <div className="flex items-center space-x-3 text-[11px] text-indigo-200/80 mt-0.5">
                  <span>Date: <b>{attDate}</b></span>
                  <span>&bull;</span>
                  <span>Slot(s): <b>Period {selectedPeriods.join(', ')}</b></span>
                  <span>&bull;</span>
                  <span>Students: <b>{students.length} Enrolled</b></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Class</span>
            </button>
          </div>

          <Card
            title="Step 2: Mark Student Attendance Roster"
            icon={Users}
            subtitle="Click student status buttons to toggle between Present and Absent. Edit limit (2 max) strictly applied."
          >
            {feedback && (
              <div className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Bulk Present / Absent Actions */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="text-slate-500">Quick Actions:</span>
                <button
                  type="button"
                  onClick={() => markAll('PRESENT')}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 transition"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAll('ABSENT')}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold border border-rose-200 transition"
                >
                  Mark All Absent
                </button>
              </div>

              <div className="text-xs font-bold text-slate-600">
                <span>Present: <b className="text-emerald-600">{Object.values(attMap).filter(v => v === 'PRESENT').length}</b></span>
                <span className="mx-2">&bull;</span>
                <span>Absent: <b className="text-rose-600">{Object.values(attMap).filter(v => v === 'ABSENT').length}</b></span>
              </div>
            </div>

            {/* Student Roster Table */}
            {students.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No students enrolled in this specific semester and section.</p>
                <button
                  onClick={() => setStep(1)}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Select Another Section
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitAttendance} className="space-y-6">
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Roll / Enrollment No.</th>
                        <th className="py-3 px-4">Student Full Name</th>
                        <th className="py-3 px-4">Class / Section</th>
                        <th className="py-3 px-4 text-right">Attendance Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s, idx) => {
                        const isPresent = attMap[s.id] === 'PRESENT';
                        return (
                          <tr key={s.id} className="hover:bg-slate-50/70">
                            <td className="py-3 px-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.enrollment_number}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              <p>{s.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-normal">{s.email}</p>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                                Sem {s.semester} &bull; Sec {s.section}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => toggleStatus(s.id)}
                                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition shadow-xs ${
                                  isPresent
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-rose-600 text-white hover:bg-rose-700'
                                }`}
                              >
                                {isPresent ? '✓ PRESENT' : '✗ ABSENT'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Class Selection</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving Attendance Records...' : 'Submit Class Attendance'}
                  </button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

