import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAcademicMaterials } from '../services/erpService';
import { useAuth } from '../context/AuthContext';
import {
  BookMarked, Download, ExternalLink, FileText, Calendar,
  User, Search, Filter, Code, Sparkles, Megaphone, CheckCircle2,
  Tag, Compass
} from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Resources', icon: BookMarked },
  { id: 'NOTE', label: 'Lecture Notes', icon: FileText },
  { id: 'PYQ', label: 'PYQ Question Papers', icon: Sparkles },
  { id: 'ASSIGNMENT', label: 'Assignments', icon: Calendar },
  { id: 'CONTEST_PREP', label: 'Contest & DSA Sheets', icon: Code },
  { id: 'REFERENCE_LINK', label: 'Reference & Links', icon: Compass },
  { id: 'ANNOUNCEMENT', label: 'Announcements', icon: Megaphone },
];

export default function NotesAssignments() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const fetchMaterials = () => {
    setLoading(true);
    const params = {};
    if (selectedYear) params.year = parseInt(selectedYear);
    if (filter !== 'ALL') params.material_type = filter;
    if (searchQuery) params.search = searchQuery;

    getAcademicMaterials(params)
      .then(setMaterials)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, [filter, selectedYear]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMaterials();
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'NOTE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PYQ':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ASSIGNMENT':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CONTEST_PREP':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'REFERENCE_LINK':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'ANNOUNCEMENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <PageContainer>
      {/* Top Banner */}
      <div className="mb-6 p-6 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Knowledge & Resource Repository</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Digital Study Material Hub</h1>
          <p className="text-xs text-indigo-100/80 leading-relaxed">
            Access previous year question papers (PYQs), lecture slides, homework assignments, coding contest sheets, and faculty reference links targeted to your year and branch.
          </p>
        </div>
      </div>

      <Card
        title="Study Materials & Question Papers"
        icon={BookMarked}
        subtitle="Retrieve class resources uploaded by faculty for your year and section"
      >
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, subject code, or keyword..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
            >
              Search
            </button>
          </form>

          {/* Target Year Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">All Relevant</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2 mb-6 text-xs font-bold">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Resources Grid / Table */}
        {loading ? (
          <LoadingSpinner message="Filtering academic resources..." />
        ) : materials.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No study materials found for this filter.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try choosing "All Resources" or adjusting your search keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map((m) => {
              const isExternal = Boolean(m.external_link);
              let resourceUrl = m.external_link || m.file_path;
              if (resourceUrl && resourceUrl.startsWith('/uploads')) {
                const backendOrigin = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
                resourceUrl = `${backendOrigin}${resourceUrl}`;
              }

              return (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] border ${getBadgeStyle(m.material_type)}`}>
                        {m.material_type.replace('_', ' ')}
                      </span>

                      {/* Target Audience Tag */}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>
                          {m.target_year ? `Year ${m.target_year}` : 'All Years'}
                          {m.target_section ? ` (Sec ${m.target_section})` : ' (All Secs)'}
                        </span>
                      </span>
                    </div>

                    {/* Title & Subject */}
                    <h3 className="text-sm font-black text-slate-900 leading-snug mb-1">
                      {m.title}
                    </h3>
                    <p className="text-[11px] font-mono text-indigo-600 font-bold mb-2">
                      {m.subject_code} &bull; {m.subject_name}
                    </p>

                    {/* Description */}
                    {m.description && (
                      <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        {m.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.uploaded_by_name}</span>
                    </div>

                    <a
                      href={resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                        isExternal
                          ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isExternal ? (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Resource</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}

