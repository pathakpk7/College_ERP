import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAdminDashboard, resetAttendanceCycle } from '../services/erpService';
import { ShieldCheck, Users, FileText, CreditCard, Megaphone, Briefcase, ArrowUpRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageContainer><LoadingSpinner message="Loading admin executive dashboard..." /></PageContainer>;

  return (
    <PageContainer>
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/30 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-medium text-indigo-200">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>System Administrator Control Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Executive Management</h1>
            <p className="text-sm text-slate-400">
              Campus administration, NOC reviews, fee management & official announcements
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card title="Enrolled Students" icon={Users}>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{data.total_students}</p>
          <p className="text-xs text-slate-500 mt-1">Active Academic Roster</p>
        </Card>

        <Card title="Faculty Members" icon={Users}>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{data.total_faculty}</p>
          <p className="text-xs text-slate-500 mt-1">Teaching Staff</p>
        </Card>

        <Card title="Pending NOCs" icon={FileText}>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-3xl font-extrabold text-amber-600">{data.pending_noc_applications}</p>
              <p className="text-xs text-slate-500 mt-1">Applications Review Needed</p>
            </div>
            <Link to="/admin/noc-review" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </Card>

        <Card title="Tuition Collected" icon={CreditCard}>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">₹ {data.total_fee_collected?.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Pending Due: ₹ {data.total_fee_due?.toLocaleString()}</p>
        </Card>
      </div>

      {/* Executive Quick Control Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Review NOC Applications" icon={FileText} subtitle="Approve or reject student internship NOC requests">
          <Link
            to="/admin/noc-review"
            className="mt-4 inline-flex items-center justify-between w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <span>Review NOC Submissions</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card title="Publish Notice" icon={Megaphone} subtitle="Post official campus announcements to student dashboard">
          <Link
            to="/admin/notices"
            className="mt-4 inline-flex items-center justify-between w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <span>Post Campus Announcement</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card title="Publish Placement Drive" icon={Briefcase} subtitle="Post upcoming corporate campus placement opportunities">
          <Link
            to="/admin/placements"
            className="mt-4 inline-flex items-center justify-between w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <span>Publish Placement Drive</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Official Administrative Attendance Reset Panel */}
      <AdminAttendanceResetPanel />
    </PageContainer>
  );
}

function AdminAttendanceResetPanel() {
  const [resetType, setResetType] = useState('SESSIONAL_1');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('Official administrative attendance reset following sessional exams.');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to trigger an official backend attendance reset for ${resetType}? All student percentages will recalculate starting from ${effectiveDate}.`)) {
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await resetAttendanceCycle({
        reset_type: resetType,
        effective_date: effectiveDate,
        remarks: remarks,
      });
      setMessage({ type: 'success', text: res.message || 'Official attendance reset executed successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to execute attendance reset.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Official Attendance Reset Control" icon={RotateCcw} subtitle="Under direct Admin control — Reset student attendance calculation cycle after sessional or semester exams">
      {message && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold">
          <div>
            <label className="block text-slate-700 mb-1">Reset Exam Event</label>
            <select
              value={resetType}
              onChange={(e) => setResetType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="SESSIONAL_1">Post Sessional Exam 1 Reset</option>
              <option value="SESSIONAL_2">Post Sessional Exam 2 Reset</option>
              <option value="SEMESTER_FINAL">Post Semester Final Exam Reset</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Effective Reset Date</label>
            <input
              type="date"
              required
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Official Remarks</label>
            <input
              type="text"
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="e.g. Sessional 1 Exam completed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500 italic">
            * Note: Resetting attendance will refresh all student attendance counters to 0 starting from the effective date. Past logs remain archived in backend DB.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{submitting ? 'Executing Reset...' : 'Trigger Attendance Reset'}</span>
          </button>
        </div>
      </form>
    </Card>
  );
}
