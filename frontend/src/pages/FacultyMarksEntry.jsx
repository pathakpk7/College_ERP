import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getEnrolledStudents, submitStudentMarks, getFacultyDashboard } from '../services/erpService';
import { Edit3, CheckCircle2 } from 'lucide-react';

export default function FacultyMarksEntry() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    student_id: '',
    subject_id: '',
    assessment_type: 'SESSIONAL_1',
    marks: 25.0,
    maximum_marks: 30.0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    Promise.all([getEnrolledStudents(), getFacultyDashboard()])
      .then(([stdRes, facRes]) => {
        setStudents(stdRes);
        if (facRes.assigned_subjects?.length > 0) {
          setSubjects(facRes.assigned_subjects);
          setForm(prev => ({
            ...prev,
            student_id: stdRes[0]?.id || '',
            subject_id: facRes.assigned_subjects[0].id,
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    try {
      await submitStudentMarks({
        student_id: parseInt(form.student_id),
        subject_id: parseInt(form.subject_id),
        assessment_type: form.assessment_type,
        marks: parseFloat(form.marks),
        maximum_marks: parseFloat(form.maximum_marks),
      });
      setSuccess('Sessional marks submitted successfully!');
    } catch (err) {
      alert('Failed to submit marks.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Loading marks entry form..." /></PageContainer>;

  return (
    <PageContainer>
      <Card title="Enter Sessional Exam Marks" icon={Edit3} subtitle="Record mid-term evaluation scores for enrolled students">
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Select Student</label>
              <select
                value={form.student_id}
                onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.enrollment_number} - {s.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Select Subject</label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Assessment Type</label>
              <select
                value={form.assessment_type}
                onChange={(e) => setForm({ ...form, assessment_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="SESSIONAL_1">SESSIONAL_1</option>
                <option value="SESSIONAL_2">SESSIONAL_2</option>
                <option value="MARKUP_1">MARKUP_1</option>
                <option value="MARKUP_2">MARKUP_2</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Marks Obtained</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max={form.maximum_marks}
                required
                value={form.marks}
                onChange={(e) => setForm({ ...form, marks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Maximum Marks</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={form.maximum_marks}
                onChange={(e) => setForm({ ...form, maximum_marks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Submit Sessional Score'}
          </button>
        </form>
      </Card>
    </PageContainer>
  );
}
