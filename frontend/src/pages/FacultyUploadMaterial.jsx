import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { uploadStudyMaterial, getFacultyDashboard } from '../services/erpService';
import { Upload, CheckCircle2 } from 'lucide-react';

export default function FacultyUploadMaterial() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject_code: 'CS701',
    subject_name: 'Distributed Systems',
    file_path: '/uploads/lecture_notes_new.pdf',
    material_type: 'NOTE',
    due_date: '',
  });

  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getFacultyDashboard()
      .then(res => {
        if (res.assigned_subjects?.length > 0) {
          setSubjects(res.assigned_subjects);
          setForm(prev => ({
            ...prev,
            subject_code: res.assigned_subjects[0].code,
            subject_name: res.assigned_subjects[0].name,
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubjectChange = (e) => {
    const sub = subjects.find(s => s.code === e.target.value);
    if (sub) {
      setForm({ ...form, subject_code: sub.code, subject_name: sub.name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccess(null);
    try {
      await uploadStudyMaterial({
        ...form,
        due_date: form.due_date ? form.due_date : null,
      });
      setSuccess('Academic material uploaded successfully!');
      setForm(prev => ({ ...prev, title: '', description: '' }));
    } catch (err) {
      alert('Failed to upload material.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Loading course subjects..." /></PageContainer>;

  return (
    <PageContainer>
      <Card title="Upload Study Material / Assignment" icon={Upload} subtitle="Share lecture notes, slides & lab assignments for students">
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Distributed Systems Chapter 3 Lecture Slides"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Select Subject</label>
              <select
                value={form.subject_code}
                onChange={handleSubjectChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {subjects.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Material Type</label>
              <select
                value={form.material_type}
                onChange={(e) => setForm({ ...form, material_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="NOTE">Lecture Note</option>
                <option value="ASSIGNMENT">Homework Assignment</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Document File Path / URL</label>
              <input
                type="text"
                required
                value={form.file_path}
                onChange={(e) => setForm({ ...form, file_path: e.target.value })}
                placeholder="/uploads/lecture_file.pdf"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Due Date (Optional for Assignments)</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Description / Instructions</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide assignment guidelines or chapter overview..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {uploading ? 'Uploading Resource...' : 'Publish Academic Resource'}
          </button>
        </form>
      </Card>
    </PageContainer>
  );
}
