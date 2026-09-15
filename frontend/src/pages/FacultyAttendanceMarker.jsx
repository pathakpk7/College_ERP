import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getEnrolledStudents, markStudentAttendance, getFacultyDashboard } from '../services/erpService';
import { CheckSquare, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FacultyAttendanceMarker() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriods, setSelectedPeriods] = useState([1]);

  // Student ID -> Attendance Status ('PRESENT' or 'ABSENT')
  const [attMap, setAttMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    Promise.all([getEnrolledStudents(), getFacultyDashboard()])
      .then(([stdRes, facRes]) => {
        setStudents(stdRes);
        if (facRes.assigned_subjects?.length > 0) {
          setSubjects(facRes.assigned_subjects);
          setSelectedSubject(facRes.assigned_subjects[0].id);
        }
        // Default all students to PRESENT
        const initialMap = {};
        stdRes.forEach(s => { initialMap[s.id] = 'PRESENT'; });
        setAttMap(initialMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = (studentId) => {
    setAttMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const items = students.map(s => ({
        student_id: s.id,
        subject_id: parseInt(selectedSubject),
        date: attDate,
        status: attMap[s.id] || 'PRESENT',
        class_number: selectedPeriods[0] || 1,
        class_numbers: selectedPeriods,
      }));

      await markStudentAttendance(items);
      setFeedback({
        type: 'success',
        message: `Attendance successfully recorded for ${items.length} students across Period(s): ${selectedPeriods.join(', ')}.`
      });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to submit class attendance. Check regulations.';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Fetching class roster..." /></PageContainer>;

  return (
    <PageContainer>
      <Card title="Mark Class Attendance" icon={CheckSquare} subtitle="Record student attendance for single or combined lecture periods (max 2 edit limit strictly enforced)">
        {feedback && (
          <div className={`mb-4 p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 border ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Attendance Date</label>
              <input
                type="date"
                required
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Select Class Period Slot(s)</label>
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
              <p className="text-[10px] text-slate-400 mt-1">Select multiple periods for combined lectures (e.g. P2 + P3)</p>
            </div>
          </div>

          {/* Student Roster */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Enrollment No.</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Branch & Section</th>
                  <th className="py-3 px-4 text-right">Attendance Status</th>
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
                          onClick={() => toggleStatus(s.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                            isPresent ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
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
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {submitting ? 'Saving Attendance...' : 'Submit Class Attendance'}
          </button>
        </form>
      </Card>
    </PageContainer>
  );
}
