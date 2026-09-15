import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { postNotice, getNotices, deleteNotice } from '../services/erpService';
import { Megaphone, CheckCircle2, Trash2, Calendar, FileText } from 'lucide-react';

export default function AdminNoticePublisher() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'ACADEMIC',
  });
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await getNotices();
      setNotices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setSuccess(null);
    try {
      await postNotice(form);
      setSuccess('Official notice published successfully to student & faculty portal!');
      setForm({ title: '', content: '', category: 'ACADEMIC' });
      fetchNotices();
    } catch (err) {
      alert('Failed to publish notice.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    setDeletingId(id);
    try {
      await deleteNotice(id);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageContainer>
      {/* Notice Publisher Form */}
      <Card title="Publish Official Campus Announcement" icon={Megaphone} subtitle="Post notices to the student & faculty portal feed">
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Notice Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. End Semester Exam Schedule & Guidelines"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="EXAM">EXAM</option>
                <option value="PLACEMENT">PLACEMENT</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Notice Details & Content</label>
            <textarea
              required
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Provide clear announcement instructions for students and faculty..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={publishing}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : 'Publish Official Notice'}
          </button>
        </form>
      </Card>

      {/* Previously Published Notices Table */}
      <Card title="All Previously Published Campus Notices" icon={FileText} subtitle="Manage, inspect, or revoke past announcements">
        {loading ? (
          <LoadingSpinner message="Fetching published notice records..." />
        ) : notices.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Posted Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Notice Title</th>
                  <th className="py-3 px-4">Content Preview</th>
                  <th className="py-3 px-4">Posted By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notices.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-600">{n.posted_date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 font-bold rounded-md text-[10px] uppercase ${
                        n.category === 'EXAM' ? 'bg-amber-100 text-amber-800' :
                        n.category === 'PLACEMENT' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {n.category || 'NOTICE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{n.title}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{n.content}</td>
                    <td className="py-3 px-4 text-slate-500">{n.posted_by || 'Administration'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        disabled={deletingId === n.id}
                        onClick={() => handleDelete(n.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
            No published notices found in the system repository.
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
