import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { publishPlacementDrive, getAllPlacementDrives, deletePlacementDrive } from '../services/erpService';
import { Briefcase, CheckCircle2, Trash2, Calendar, Building2 } from 'lucide-react';

export default function AdminPlacementPublisher() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    company_name: '',
    job_role: '',
    eligibility_criteria: '',
    drive_date: '',
    application_deadline: '',
    salary_package: '',
    preparation_resources: '',
  });
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const data = await getAllPlacementDrives();
      setDrives(data);
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
      await publishPlacementDrive(form);
      setSuccess('Corporate placement drive published successfully!');
      setForm({
        company_name: '', job_role: '', eligibility_criteria: '',
        drive_date: '', application_deadline: '', salary_package: '', preparation_resources: ''
      });
      fetchDrives();
    } catch (err) {
      alert('Failed to publish placement drive.');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) return;
    setDeletingId(id);
    try {
      await deletePlacementDrive(id);
      fetchDrives();
    } catch (err) {
      alert('Failed to delete placement drive.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageContainer>
      {/* Placement Publisher Form */}
      <Card title="Publish Corporate Campus Placement Drive" icon={Briefcase} subtitle="Post new campus recruitment opportunities for eligible students">
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Google / Microsoft / Amazon"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Job Role</label>
              <input
                type="text"
                required
                value={form.job_role}
                onChange={(e) => setForm({ ...form, job_role: e.target.value })}
                placeholder="Software Engineer (SDE I)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Salary Package (LPA)</label>
              <input
                type="text"
                required
                value={form.salary_package}
                onChange={(e) => setForm({ ...form, salary_package: e.target.value })}
                placeholder="₹ 28.5 LPA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Drive Date</label>
              <input
                type="date"
                required
                value={form.drive_date}
                onChange={(e) => setForm({ ...form, drive_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={form.application_deadline}
                onChange={(e) => setForm({ ...form, application_deadline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Eligibility Criteria</label>
              <textarea
                required
                rows={2}
                value={form.eligibility_criteria}
                onChange={(e) => setForm({ ...form, eligibility_criteria: e.target.value })}
                placeholder="CGPA >= 8.0, No active backlogs, B.Tech CSE / IT"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Preparation Guidance</label>
              <textarea
                rows={2}
                value={form.preparation_resources}
                onChange={(e) => setForm({ ...form, preparation_resources: e.target.value })}
                placeholder="LeetCode Data Structures, System Design & SQL fundamentals"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={publishing}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : 'Publish Placement Opportunity'}
          </button>
        </form>
      </Card>

      {/* Previously Published Placement Drives Table */}
      <Card title="All Previously Published Placement Drives" icon={Building2} subtitle="Inspect and manage active corporate drive postings">
        {loading ? (
          <LoadingSpinner message="Fetching placement drive records..." />
        ) : drives.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-4">Salary Package</th>
                  <th className="py-3 px-4">Eligibility Criteria</th>
                  <th className="py-3 px-4">Drive Date</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{d.company_name}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">{d.job_role}</td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{d.salary_package}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{d.eligibility_criteria}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{d.drive_date}</td>
                    <td className="py-3 px-4 font-mono text-rose-600 font-semibold">{d.application_deadline}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        disabled={deletingId === d.id}
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Placement Drive"
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
            No published placement drives found in system repository.
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
