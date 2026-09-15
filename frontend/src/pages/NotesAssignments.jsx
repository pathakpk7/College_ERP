import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAcademicMaterials } from '../services/erpService';
import { BookMarked, Download, FileText, Calendar, User } from 'lucide-react';

export default function NotesAssignments() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    getAcademicMaterials()
      .then(setMaterials)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageContainer><LoadingSpinner message="Fetching notes and assignments..." /></PageContainer>;

  const filteredMaterials = filter === 'ALL' ? materials : materials.filter(m => m.material_type === filter);

  return (
    <PageContainer>
      <Card title="Notes & Assignments Repository" icon={BookMarked} subtitle="Download lecture slides, lab manuals, and homework assignments">
        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-5 text-xs font-semibold">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition ${filter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All Resources ({materials.length})
          </button>
          <button
            onClick={() => setFilter('NOTE')}
            className={`px-3 py-1.5 rounded-xl transition ${filter === 'NOTE' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Lecture Notes
          </button>
          <button
            onClick={() => setFilter('ASSIGNMENT')}
            className={`px-3 py-1.5 rounded-xl transition ${filter === 'ASSIGNMENT' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Assignments
          </button>
        </div>

        {/* Materials Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Title & Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{m.title}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{m.subject_code} &bull; {m.subject_name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${m.material_type === 'NOTE' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>
                      {m.material_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{m.uploaded_by_name}</td>
                  <td className="py-3 px-4 text-slate-600">{m.upload_date}</td>
                  <td className="py-3 px-4 text-slate-600">{m.due_date || 'No Due Date'}</td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={m.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
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
