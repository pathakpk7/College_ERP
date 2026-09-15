import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getRegistrationHistory } from '../services/erpService';
import { FileCheck, CheckCircle2 } from 'lucide-react';

export default function RegistrationLog() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRegistrationHistory()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageContainer><LoadingSpinner message="Fetching registration history..." /></PageContainer>;

  return (
    <PageContainer>
      <Card title="Semester Registration Records" icon={FileCheck} subtitle="History of all registered academic semesters">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Registration No.</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">Semester {r.semester_number}</td>
                  <td className="py-3 px-4 text-slate-600">{r.academic_year}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{r.registration_number}</td>
                  <td className="py-3 px-4 text-slate-600">{r.registration_date}</td>
                  <td className="py-3 px-4 text-slate-600">{r.remarks || 'N/A'}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{r.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
