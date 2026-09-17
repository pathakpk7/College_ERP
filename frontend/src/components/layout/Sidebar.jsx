import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarCheck, FileCheck, FileText,
  CreditCard, Award, BookOpen, MessageSquare, Briefcase,
  MessagesSquare, Calendar, BookMarked, LogOut, GraduationCap,
  CheckSquare, Edit3, Upload, Megaphone, ShieldCheck, Users, X,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserInitials, getUserDisplayName, getUserAccountLabel, getUserIdentifier } from '../../utils/userUtils';
import ProfileModal from '../common/ProfileModal';



const studentNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Study Material & PYQs', path: '/materials', icon: BookMarked },
  { name: 'Campus Book Store', path: '/bookstore', icon: ShoppingBag },
  { name: 'Library Borrowings', path: '/library', icon: BookOpen },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Registration Log', path: '/registration', icon: FileCheck },
  { name: 'NOC Application', path: '/noc', icon: FileText },
  { name: 'Fee Info', path: '/fees', icon: CreditCard },
  { name: 'Sessional Marks', path: '/marks', icon: Award },
  { name: 'SMS & Grievances', path: '/messages', icon: MessageSquare },
  { name: 'Placement', path: '/placement', icon: Briefcase },
  { name: 'Discussion Forum', path: '/forum', icon: MessagesSquare },
  { name: 'Timetable', path: '/timetable', icon: Calendar },
];

const facultyNavItems = [
  { name: 'Faculty Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Upload Notes & PYQs', path: '/faculty/materials', icon: Upload },
  { name: 'Study Materials Hub', path: '/materials', icon: BookMarked },
  { name: 'Campus Book Store', path: '/bookstore', icon: ShoppingBag },
  { name: 'Class Traversal Workspace', path: '/faculty/classes', icon: Users },
  { name: 'Mark Attendance', path: '/faculty/attendance', icon: CheckSquare },
  { name: 'Enter Sessional Marks', path: '/faculty/marks', icon: Edit3 },
  { name: 'Class Timetable', path: '/timetable', icon: Calendar },
  { name: 'Discussion Forum', path: '/forum', icon: MessagesSquare },
  { name: 'Messages & Grievances', path: '/messages', icon: MessageSquare },
];

const adminNavItems = [
  { name: 'Admin Dashboard', path: '/admin/dashboard', icon: ShieldCheck },
  { name: 'Campus Book Store', path: '/bookstore', icon: ShoppingBag },
  { name: 'Study Materials Hub', path: '/materials', icon: BookMarked },
  { name: 'Review NOC Applications', path: '/admin/noc-review', icon: FileText },
  { name: 'Publish Official Notice', path: '/admin/notices', icon: Megaphone },
  { name: 'Publish Placement Drive', path: '/admin/placements', icon: Briefcase },
  { name: 'Messages & Grievances', path: '/messages', icon: MessageSquare },
  { name: 'Discussion Forum', path: '/forum', icon: MessagesSquare },
];


export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile = () => {},
  isDesktopOpen = true,
  onToggleDesktop = () => {},
}) {
  const { logout, user } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);
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
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <img
              src="/app_icon.png"
              alt="CampusERP"
              className="w-9 h-9 rounded-xl shadow-lg shadow-cyan-500/10 object-contain shrink-0 ring-1 ring-white/10"
            />
            <div className="min-w-0">
              <div className="flex items-center space-x-1">
                <span className="font-black text-white tracking-tight text-base">Campus</span>
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300 text-base">ERP</span>
              </div>
              <p className="text-[8px] sm:text-[9px] text-cyan-300/80 font-bold uppercase tracking-widest truncate">
                CONNECT • MANAGE • EMPOWER
              </p>
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
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center space-x-2.5 truncate hover:opacity-80 transition cursor-pointer text-left flex-1 min-w-0"
            title="Click to view full personal profile details"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm uppercase ring-2 ring-transparent hover:ring-indigo-400 transition">
              {getUserInitials(user)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate" title={getUserDisplayName(user)}>
                {getUserDisplayName(user)}
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <span
                  className="inline-block px-1.5 py-0.2 text-[9px] font-medium bg-indigo-950/80 text-indigo-300 rounded border border-indigo-700/50 truncate max-w-[130px]"
                  title={getUserAccountLabel(user)}
                >
                  {getUserAccountLabel(user)}
                </span>
              </div>
            </div>
          </button>
          <button
            onClick={() => {
              if (isMobile) onCloseMobile();
              logout();
            }}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition shrink-0 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Toggled with hamburger or collapse button) */}
      <aside
        className={`hidden lg:flex bg-slate-900 text-slate-300 flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 transition-all duration-300 overflow-hidden ${
          isDesktopOpen ? 'w-64' : 'w-0 border-r-0 opacity-0 pointer-events-none'
        }`}
      >
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
      {/* Profile Details Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />
    </>
  );
}
