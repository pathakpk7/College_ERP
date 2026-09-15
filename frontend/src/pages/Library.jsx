import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getLibraryRecords } from '../services/erpService';
import { BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Library() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLibraryRecords()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageContainer><LoadingSpinner message="Fetching library transactions..." /></PageContainer>;

  return (
    <PageContainer>
      <Card title="Library Transactions & Fine Details" icon={BookOpen} subtitle="Book borrowings, return dates & per-day late fine calculation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Return Date</th>
                <th className="py-3 px-4 text-center">Fine Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{r.book_title}</td>
                  <td className="py-3 px-4 text-slate-600">{r.book_author}</td>
                  <td className="py-3 px-4 text-slate-600">{r.issue_date}</td>
                  <td className="py-3 px-4 text-slate-600">{r.due_date}</td>
                  <td className="py-3 px-4 text-slate-600">{r.return_date || 'Not Returned'}</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600">₹ {r.fine_amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                      r.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' :
                      r.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {r.status}
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
