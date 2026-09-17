import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  getEnrolledStudents, submitBulkStudentMarks,
  getFacultyDashboard, getFacultyClasses
} from '../services/erpService';
import {
  Table2, CheckCircle2, AlertCircle, FileSpreadsheet,
  Download, Printer, Save, Sparkles, Filter, Users, HelpCircle
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

const ASSESSMENT_TYPES = [
  { id: 'SESSIONAL_1', label: 'Sessional Exam 1 (Mid-Term 1)' },
  { id: 'SESSIONAL_2', label: 'Sessional Exam 2 (Mid-Term 2)' },
  { id: 'MARKUP_1', label: 'Markup Exam 1' },
  { id: 'MARKUP_2', label: 'Markup Exam 2' },
  { id: 'INTERNAL_EVAL', label: 'Internal Assignment / Lab Assessment' },
];

export default function FacultyMarksEntry() {
  const [selectedSemester, setSelectedSemester] = useState(7);
  const [selectedBranch, setSelectedBranch] = useState('Computer Science & Engineering');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('BCS701');
  const [selectedSubjectName, setSelectedSubjectName] = useState('ARTIFICIAL INTELLIGENCE');
  const [assessmentType, setAssessmentType] = useState('SESSIONAL_1');
  
  // Global Maximum Marks (Set Once at the Top)
  const [globalMaxMarks, setGlobalMaxMarks] = useState(30.0);

  // Student list & Marks state: { [studentId]: marks_obtained }
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
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
          const firstCls = classesRes[0];
          setSelectedSemester(firstCls.semester || 7);
          setSelectedBranch(firstCls.branch || 'Computer Science & Engineering');
          setSelectedSection(firstCls.section || 'A');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch students whenever class/section filters change
  const fetchStudentsForClass = async () => {
    setLoadingStudents(true);
    try {
      const res = await getEnrolledStudents({
        semester: selectedSemester,
        branch: selectedBranch,
        section: selectedSection,
      });
      setStudents(res);

      // Initialize marks with sensible defaults
      const initMap = {};
      res.forEach((s, idx) => {
        initMap[s.id] = marksMap[s.id] !== undefined ? marksMap[s.id] : Math.min(globalMaxMarks, Math.round((globalMaxMarks * 0.75 + (idx % 5) * 1.5) * 2) / 2);
      });
      setMarksMap(initMap);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to fetch student roster for the chosen class section.' });
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchStudentsForClass();
    }
  }, [selectedSemester, selectedBranch, selectedSection, loading]);

  const handleMarkChange = (studentId, value) => {
    const num = parseFloat(value);
    setMarksMap(prev => ({
      ...prev,
      [studentId]: isNaN(num) ? '' : num,
    }));
  };

  const handleApplyGlobalMax = (newMax) => {
    const val = parseFloat(newMax) || 30.0;
    setGlobalMaxMarks(val);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    // Validate that no student marks exceed the global maximum
    const invalidStudent = students.find(s => {
      const markVal = marksMap[s.id];
      return markVal === '' || markVal < 0 || markVal > globalMaxMarks;
    });

    if (invalidStudent) {
      setFeedback({
        type: 'error',
        message: `Validation Error: Marks for ${invalidStudent.full_name} must be between 0 and ${globalMaxMarks}.`
      });
      setSubmitting(false);
      return;
    }

    try {
      const payload = students.map(s => ({
        student_id: s.id,
        subject_id: parseInt(selectedSubjectId) || 1,
        assessment_type: assessmentType,
        marks: parseFloat(marksMap[s.id]) || 0,
        maximum_marks: parseFloat(globalMaxMarks),
      }));

      const res = await submitBulkStudentMarks(payload);
      setFeedback({
        type: 'success',
        message: `${res.message || 'Sessional marks updated successfully!'} Students can now view their scores in their portals.`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to submit bulk marks.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintSheet = () => {
    window.print();
  };

  if (loading) return <PageContainer><LoadingSpinner message="Loading sessional marks spreadsheet..." /></PageContainer>;

  return (
    <PageContainer>
      {/* Top Banner */}
      <div className="mb-6 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold mb-2 border border-indigo-500/30">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Faculty Gradebook & Sessional Evaluation</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Class Sessional Marks Spreadsheet
          </h1>
          <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
            Set the maximum marks once, enter marks inline across the entire section roster, and commit with a single bulk update. Scores are immediately reflected on the Student Portal.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrintSheet}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition flex items-center space-x-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center space-x-2.5 border transition ${
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

      {/* Control Bar: Class Filter & Global Maximum Marks Header */}
      <Card
        title="1. Class Filter & Global Examination Parameters"
        icon={Filter}
        subtitle="Specify the section and evaluation criteria. Maximum marks entered here applies to all student entries."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs font-semibold">
          {/* Semester */}
          <div>
            <label className="block text-slate-700 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
            >
              {SEMESTER_OPTIONS.map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-slate-700 mb-1">Branch</label>
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

          {/* Section */}
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

          {/* Subject */}
          <div>
            <label className="block text-slate-700 mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSubjectId(val);
                const s = subjects.find(sub => String(sub.id) === String(val));
                if (s) {
                  setSelectedSubjectCode(s.code);
                  setSelectedSubjectName(s.name);
                }
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          {/* Assessment Type */}
          <div>
            <label className="block text-slate-700 mb-1">Assessment Type</label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
            >
              {ASSESSMENT_TYPES.map(a => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Max Marks Setting */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Table2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-indigo-950">
                Global Maximum Marks (Set Once for Section)
              </h3>
              <p className="text-[11px] text-indigo-800/80">
                All row scores are validated against this ceiling. Standard sessional = 30.0, University Mid-Term = 50.0.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-black text-slate-700">Max Marks:</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="100"
              value={globalMaxMarks}
              onChange={(e) => handleApplyGlobalMax(e.target.value)}
              className="w-24 px-3 py-2 text-center font-mono font-black text-sm bg-white border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            <span className="text-xs font-bold text-indigo-900">Points</span>
          </div>
        </div>
      </Card>

      {/* Spreadsheet Grid Table */}
      <Card
        title={`2. Student Marks Sheet (${students.length} Enrolled in Sem ${selectedSemester} Sec ${selectedSection})`}
        icon={Users}
        subtitle="Enter or edit obtained marks directly in the cells below, then click 'Update & Publish Sessional Marks'."
      >
        {loadingStudents ? (
          <LoadingSpinner message="Fetching enrolled student list..." />
        ) : students.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No students found in this semester & section.</p>
            <p className="text-xs text-slate-400 mt-1">Please check the branch or section filter above.</p>
          </div>
        ) : (
          <form onSubmit={handleBulkSubmit} className="space-y-6">
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Roll / Enrollment No.</th>
                    <th className="py-3 px-4">Student Full Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 w-44">Marks Obtained</th>
                    <th className="py-3 px-4 text-center">Max Marks</th>
                    <th className="py-3 px-4 text-center">Percentage</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {students.map((student, idx) => {
                    const markVal = marksMap[student.id];
                    const numVal = parseFloat(markVal);
                    const isExceeding = !isNaN(numVal) && numVal > globalMaxMarks;
                    const isMissing = markVal === '' || isNaN(numVal);
                    const pct = (!isMissing && !isExceeding && globalMaxMarks > 0)
                      ? ((numVal / globalMaxMarks) * 100).toFixed(1)
                      : null;

                    return (
                      <tr key={student.id} className="hover:bg-indigo-50/40 transition">
                        <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {student.enrollment_number}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{student.full_name}</p>
                          <p className="text-[10px] text-indigo-600 font-mono font-bold">{student.college_id || student.enrollment_number}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                            Sem {student.semester} &bull; Sec {student.section}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="relative">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={globalMaxMarks}
                              value={markVal !== undefined ? markVal : ''}
                              onChange={(e) => handleMarkChange(student.id, e.target.value)}
                              placeholder={`0 - ${globalMaxMarks}`}
                              className={`w-32 px-3 py-1.5 font-mono font-bold text-xs rounded-xl border focus:outline-none transition ${
                                isExceeding
                                  ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-300'
                                  : isMissing
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                          / {globalMaxMarks}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {pct !== null ? (
                            <span className={`font-mono font-bold ${
                              parseFloat(pct) >= 75 ? 'text-emerald-600' :
                              parseFloat(pct) >= 50 ? 'text-indigo-600' : 'text-amber-600'
                            }`}>
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isExceeding ? (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-md">
                              Exceeds Max ({globalMaxMarks})
                            </span>
                          ) : isMissing ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                              Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500 font-medium">
                Showing <b>{students.length}</b> student records for <b>{selectedSubjectCode} ({assessmentType.replace('_', ' ')})</b>.
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Updating Sheet...' : 'Update & Publish All Sessional Marks'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </PageContainer>
  );
}

