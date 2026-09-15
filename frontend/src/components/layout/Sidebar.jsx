import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, FileCheck, FileText,
  CreditCard, Award, BookOpen, MessageSquare, Briefcase,
  MessagesSquare, Calendar, BookMarked, LogOut, GraduationCap,
  CheckSquare, Edit3, Upload, Megaphone, ShieldCheck, Users, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const studentNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Registration Log', path: '/registration', icon: FileCheck },
  { name: 'NOC Application', path: '/noc', icon: FileText },
  { name: 'Fee Info', path: '/fees', icon: CreditCard },
  { name: 'Sessional Marks', path: '/marks', icon: Award },
  { name: 'Library', path: '/library', icon: BookOpen },
  { name: 'SMS & Grievances', path: '/messages', icon: MessageSquare },
  { name: 'Placement', path: '/placement', icon: Briefcase },
  { name: 'Discussion Forum', path: '/forum', icon: MessagesSquare },
  { name: 'Timetable', path: '/timetable', icon: Calendar },
  { name: 'Notes & Assignments', path: '/materials', icon: BookMarked },
];

const facultyNavItems = [
  { name: 'Faculty Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Class Traversal Workspace', path: '/faculty/classes', icon: Users },
  { name: 'Mark Attendance', path: '/faculty/attendance', icon: CheckSquare },
  { name: 'Enter Sessional Marks', path: '/faculty/marks', icon: Edit3 },
  { name: 'Upload Notes & Materials', path: '/faculty/materials', icon: Upload },
  { name: 'Class Timetable', path: '/timetable', icon: Calendar },
  { name: 'Discussion Forum', path: '/forum', icon: MessagesSquare },
  { name: 'Messages & Grievances', path: '/messages', icon: MessageSquare },
];

const adminNavItems = [
  { name: 'Admin Dashboard', path: '/admin/dashboard', icon: ShieldCheck },
  { name: 'Review NOC Applications', path: '/admin/noc-review', icon: FileText },
  { name: 'Publish Official Notice', path: '/admin/notices', icon: Megaphone },
  { name: 'Publish Placement Drive', path: '/admin/placements', icon: Briefcase },
  { name: 'Messages & Grievances', path: '/messages', icon: MessageSquare },
  { name: 'Discussion Forum', path: '/forum', icon: MessagesSquare },
];

export default function Sidebar({ isMobileOpen = false, onCloseMobile = () => {} }) {
  const { logout, user } = useAuth();
  const role = user?.role || 'STUDENT';

  let navItems = studentNavItems;
  if (role === 'FACULTY') {
    navItems = facultyNavItems;
  } else if (role === 'ADMIN') {
    navItems = adminNavItems;
  }

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30 text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight text-base">College ERP</h1>
              <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-wider">{role} PORTAL</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dynamic Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobile) onCloseMobile();
                }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold'
                      : 'hover:bg-slate-800 hover:text-white text-slate-400'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{user?.username || 'User'}</p>
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono bg-indigo-900/60 text-indigo-300 rounded border border-indigo-700/50">
              {role}
            </span>
          </div>
          <button
            onClick={() => {
              if (isMobile) onCloseMobile();
              logout();
            }}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile/tablet, visible on lg) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800">
        {renderContent(false)}
      </aside>

      {/* Mobile & Tablet Drawer Slide-over Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Mobile Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-300 shadow-2xl border-r border-slate-800">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
