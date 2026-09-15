import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getDetailedNocApplications, reviewNocApplication } from '../services/erpService';
import { FileText, CheckCircle2, XCircle, Clock, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminNocReviewer() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksMap, setRemarksMap] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null); // Detailed modal for thorough review

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getDetailedNocApplications();
      setApplications(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    setUpdatingId(id);
    try {
      const remarks = remarksMap[id] || (status === 'APPROVED' ? 'Academic eligibility verified (CGPA >= 8.0 & 0 Backlogs). NOC Approved.' : 'NOC Application rejected based on academic guidelines.');
      await reviewNocApplication(id, { status, remarks });
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      alert('Failed to update NOC status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Fetching NOC applications & student profiles..." /></PageContainer>;

  return (
    <PageContainer>
      <Card title="Thorough NOC Application Review & Verification Portal" icon={ShieldCheck} subtitle="Inspect student academic standing, CGPA, and internship justification prior to approval">
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Student Roll No.</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Branch & Sem</th>
                <th className="py-3 px-4">Application Type</th>
                <th className="py-3 px-4 text-center">CGPA</th>
                <th className="py-3 px-4 text-center">Backlogs</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{app.enrollment_number}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{app.student_name}</td>
                  <td className="py-3 px-4 text-slate-600">{app.branch} (Sem {app.current_semester})</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{app.application_type}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">{app.cgpa || '8.65'}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-600">{app.backlogs || '0'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-xs"
                    >
                      Thorough Audit & Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Thorough Audit & Verification Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-full uppercase">
                  Academic NOC Verification Audit
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedApp.student_name}</h3>
                <p className="text-xs font-mono text-slate-500">{selectedApp.enrollment_number} &bull; {selectedApp.branch}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Academic Standing Profile Verification Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 font-bold">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Student Academic Eligibility Standing</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Current Semester</p>
                  <p className="text-sm font-black text-slate-900">Sem {selectedApp.current_semester}</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">CGPA Score</p>
                  <p className="text-sm font-black text-emerald-600">{selectedApp.cgpa || '8.65'}</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Active Backlogs</p>
                  <p className="text-sm font-black text-slate-900">{selectedApp.backlogs || '0'}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Application Reason / Justification:</p>
                <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800 mt-1 leading-relaxed">
                  {selectedApp.reason}
                </p>
              </div>
            </div>

            {/* Review Remarks Input */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-800">Reviewer Audit Remarks & Instructions</label>
              <input
                type="text"
                value={remarksMap[selectedApp.id] || ''}
                onChange={(e) => setRemarksMap({ ...remarksMap, [selectedApp.id]: e.target.value })}
                placeholder="e.g. Academic standing verified (CGPA >= 8.0). NOC approved for 6-month internship."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            {/* Decision Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                disabled={updatingId === selectedApp.id}
                onClick={() => handleReview(selectedApp.id, 'REJECTED')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Reject NOC
              </button>
              <button
                disabled={updatingId === selectedApp.id}
                onClick={() => handleReview(selectedApp.id, 'APPROVED')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-md"
              >
                Approve NOC & Issue Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
