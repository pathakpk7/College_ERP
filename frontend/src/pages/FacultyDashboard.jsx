import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getFacultyDashboard } from '../services/erpService';
import { User, BookOpen, Users, Upload, CheckSquare, Edit3, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacultyDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageContainer><LoadingSpinner message="Loading faculty portal..." /></PageContainer>;

  return (
    <PageContainer>
      {/* Faculty Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-medium text-indigo-200">
              <span>Employee ID: {data.employee_id}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {data.faculty_name}!</h1>
            <p className="text-sm text-indigo-200/80">
              {data.designation} &bull; {data.department}
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">Assigned Subjects</p>
              <p className="text-2xl font-black text-white">{data.assigned_subjects?.length}</p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">Materials Uploaded</p>
              <p className="text-2xl font-black text-emerald-300">{data.total_materials_uploaded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Class Traversal Workspace" icon={Users} subtitle="Select class, view roster, attendance & marks">
          <Link
            to="/faculty/classes"
            className="mt-4 inline-flex items-center justify-between w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <span>Traverse Classes & Roster</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card title="Mark Attendance" icon={CheckSquare} subtitle="Record class presence for enrolled students">
          <Link
            to="/faculty/attendance"
            className="mt-4 inline-flex items-center justify-between w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <span>Open Attendance Sheet</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card title="Enter Sessional Marks" icon={Edit3} subtitle="Record Sessional 1, Sessional 2 & lab scores">
          <Link
            to="/faculty/marks"
            className="mt-4 inline-flex items-center justify-between w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <span>Enter Sessional Scores</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card title="Upload Study Material" icon={Upload} subtitle="Share lecture notes, slides & assignments">
          <Link
            to="/faculty/materials"
            className="mt-4 inline-flex items-center justify-between w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <span>Upload New Resource</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Assigned Subjects Overview */}
      <Card title="My Assigned Subjects & Courses" icon={BookOpen}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.assigned_subjects?.map((sub) => (
            <div key={sub.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono font-bold text-[10px] rounded">
                {sub.code}
              </span>
              <p className="font-bold text-slate-900 text-sm">{sub.name}</p>
              <p className="text-xs text-slate-500 font-medium">{sub.credits} Academic Credits</p>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
