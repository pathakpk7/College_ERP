import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getNocApplications, submitNocApplication, getStudentProfile } from '../services/erpService';
import { FileText, AlertCircle, CheckCircle2, ShieldAlert, PlusCircle } from 'lucide-react';

export default function NocApplication() {
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    application_type: 'Industrial Training / Internship NOC',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNocData();
  }, []);

  const fetchNocData = async () => {
    try {
      setLoading(true);
      const [profRes, appsRes] = await Promise.all([
        getStudentProfile(),
        getNocApplications(),
      ]);
      setStudent(profRes);
      setApplications(appsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await submitNocApplication(form);
      setSuccess('NOC Application submitted successfully!');
      setForm({ application_type: 'Industrial Training / Internship NOC', reason: '' });
      fetchNocData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit NOC application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Checking NOC eligibility & records..." /></PageContainer>;

  const isEligible = student?.current_semester >= 7;

  return (
    <PageContainer>
      {/* Eligibility Notice Banner */}
      <div className={`p-6 rounded-2xl border ${isEligible ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'} shadow-sm flex items-start space-x-4`}>
        {isEligible ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <h3 className="font-bold text-sm">
            {isEligible ? 'You are Eligible to Apply for NOC' : 'Ineligible for NOC Application'}
          </h3>
          <p className="text-xs">
            NOC eligibility policy requires student status in <strong>Semester 7 or above</strong>. Your current status is <strong>Semester {student?.current_semester}</strong>.
          </p>
        </div>
      </div>

      {/* Submission Form */}
      {isEligible && (
        <Card title="Submit New NOC Application" icon={PlusCircle}>
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Type</label>
              <select
                value={form.application_type}
                onChange={(e) => setForm({ ...form, application_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Industrial Training / Internship NOC">Industrial Training / Internship NOC</option>
                <option value="Higher Studies Entrance NOC">Higher Studies Entrance NOC</option>
                <option value="Passport / Visa Verification NOC">Passport / Visa Verification NOC</option>
                <option value="Project Off-Campus Training NOC">Project Off-Campus Training NOC</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Details for NOC Request</label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Provide detailed justification (company name, duration, offer letter details)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application to HOD'}
            </button>
          </form>
        </Card>
      )}

      {/* Applications List */}
      <Card title="Submitted NOC Applications" icon={FileText}>
        {applications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No NOC applications submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Application Type</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Remarks / Admin Review</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{app.application_type}</td>
                    <td className="py-3 px-4 text-slate-600">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{app.reason}</td>
                    <td className="py-3 px-4 text-slate-600">{app.remarks || 'Under Review'}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
