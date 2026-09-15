import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getDashboardSummary } from '../services/erpService';
import {
  User, CalendarCheck, CreditCard, Briefcase, Bell,
  MessageSquare, ArrowUpRight, Megaphone
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardSummary();
      setData(res);
    } catch (err) {
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Fetching dashboard metrics..." /></PageContainer>;

  if (error) return (
    <PageContainer>
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
        {error}
      </div>
    </PageContainer>
  );

  const { student, overall_attendance_percentage, fee_status, fee_due_amount, recent_notices } = data;

  return (
    <PageContainer>
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-medium text-indigo-200">
              <span>Enrollment: {student.enrollment_number}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {student.full_name}!</h1>
            <p className="text-sm text-indigo-200/80">
              {student.branch} &bull; Semester {student.current_semester} (Section {student.section})
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">Academic CGPA</p>
              <p className="text-2xl font-black text-white">{student.cgpa} <span className="text-xs font-normal text-indigo-200">/ 10.0</span></p>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-indigo-200 font-semibold">Backlogs</p>
              <p className="text-2xl font-black text-emerald-300">{student.backlogs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card title="Attendance" icon={CalendarCheck}>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{overall_attendance_percentage}%</p>
              <p className="text-xs text-slate-500 mt-1">{data.present_classes} / {data.total_classes} classes attended</p>
            </div>
            <Link to="/attendance" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </Card>

        <Card title="Fee Status" icon={CreditCard}>
          <div className="flex items-end justify-between mt-2">
            <div>
              <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md ${fee_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {fee_status}
              </span>
              <p className="text-xs text-slate-500 mt-1">Due: ₹ {fee_due_amount.toLocaleString()}</p>
            </div>
            <Link to="/fees" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </Card>

        <Card title="Upcoming Drives" icon={Briefcase}>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{data.upcoming_placements_count}</p>
              <p className="text-xs text-slate-500 mt-1">Placement Drives Active</p>
            </div>
            <Link to="/placement" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </Card>

        <Card title="Unread Messages" icon={MessageSquare}>
          <div className="flex items-end justify-between mt-2">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">{data.unread_messages_count}</p>
              <p className="text-xs text-slate-500 mt-1">New Messages</p>
            </div>
            <Link to="/messages" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Dynamic Notices & Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Official College Notices" icon={Megaphone}>
            <div className="space-y-3">
              {recent_notices?.map((n) => (
                <div key={n.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[10px]">
                      {n.category}
                    </span>
                  </div>
                  <p className="text-slate-600">{n.content}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Posted by {n.posted_by} &bull; {n.posted_date}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card title="Quick Portal Links" icon={Bell}>
            <div className="space-y-2 text-xs font-semibold">
              <Link to="/attendance" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition">
                <span>View Subject Attendance</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link to="/noc" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition">
                <span>Apply for NOC Certificate</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link to="/marks" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition">
                <span>Check Sessional Marks</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link to="/materials" className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition">
                <span>Download Notes & Assignments</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
