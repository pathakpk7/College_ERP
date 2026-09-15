import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getFeeRecords, downloadFeeReceipt } from '../services/erpService';
import { CreditCard, Download, CheckCircle2 } from 'lucide-react';

export default function FeeInfo() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeeRecords()
      .then(setFees)
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadReceipt = async (feeId) => {
    try {
      const blob = await downloadFeeReceipt(feeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fee_Receipt_${feeId}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download receipt.');
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Fetching fee records..." /></PageContainer>;

  return (
    <PageContainer>
      <Card title="Semester Fee Status & Payment History" icon={CreditCard}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-4">Total Tuition Fee</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Remaining Due</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">Semester {f.semester_number}</td>
                  <td className="py-3 px-4 text-slate-600">{f.academic_year}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">₹ {f.total_fee.toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">₹ {f.amount_paid.toLocaleString()}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">₹ {f.remaining_due.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-600">{f.payment_date || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${f.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {f.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDownloadReceipt(f.id)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
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
