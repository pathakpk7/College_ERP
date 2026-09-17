import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getSessionalMarks } from '../services/erpService';
import { Award, TrendingUp } from 'lucide-react';

export default function SessionalMarks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSessionalMarks()
      .then(setData)
      .catch((err) => setError(err.response?.data?.detail || 'Failed to fetch sessional marks.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageContainer><LoadingSpinner message="Fetching sessional marks..." /></PageContainer>;

  if (error || !data) {
    return (
      <PageContainer>
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex flex-col items-start space-y-3">
          <p className="font-bold">{error || 'Unable to load sessional marks.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition"
          >
            Retry Loading
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Estimated Internal Summary Banner */}
      <Card title="Estimated Internal Marks Assessment" icon={Award} subtitle="Based on sessional exams, lab evaluations & attendance">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div>
            <p className="text-xs text-slate-500 font-medium">Estimated Internal Marks Total</p>
            <p className="text-3xl font-black text-indigo-700">{data?.estimated_internal_total} <span className="text-sm font-normal text-slate-500">/ {data?.max_internal_total}</span></p>
          </div>
          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Performance</span>
              <span>{Math.round((data?.estimated_internal_total / data?.max_internal_total) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${(data?.estimated_internal_total / data?.max_internal_total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Marks Breakdown Table */}
      <Card title="Detailed Subject Marks">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Subject Name</th>
                <th className="py-3 px-4">Assessment Type</th>
                <th className="py-3 px-4 text-center">Marks Obtained</th>
                <th className="py-3 px-4 text-center">Maximum Marks</th>
                <th className="py-3 px-4 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.marks_list?.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{m.subject_code}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{m.subject_name}</td>
                  <td className="py-3 px-4 font-semibold text-indigo-600">{m.assessment_type}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">{m.marks}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{m.maximum_marks}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{m.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
