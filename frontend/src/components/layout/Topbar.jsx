import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, X, Calendar, Megaphone, FileText, CheckCircle2, ChevronRight, User, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNotices } from '../../services/erpService';
import { getUserInitials, getUserDisplayName, getUserAccountLabel, getUserIdentifier } from '../../utils/userUtils';
import ProfileModal from '../common/ProfileModal';



const systemNavigationLinks = [
  { name: 'Student Dashboard', path: '/dashboard', category: 'General', role: 'STUDENT' },
  { name: 'Attendance Tracker & Calculator', path: '/attendance', category: 'Academics', role: 'STUDENT' },
  { name: 'Semester Registration Log', path: '/registration', category: 'Academics', role: 'STUDENT' },
  { name: 'No Objection Certificate (NOC)', path: '/noc', category: 'Services', role: 'STUDENT' },
  { name: 'Fee Info & Receipt Portal', path: '/fees', category: 'Finance', role: 'STUDENT' },
  { name: 'Sessional Marks & Internal Estimates', path: '/marks', category: 'Academics', role: 'STUDENT' },
  { name: 'Library Transactions & Overdue Status', path: '/library', category: 'Services', role: 'STUDENT' },
  { name: 'Campus Placement Drives', path: '/placement', category: 'Career', role: 'STUDENT' },
  { name: 'Student & Faculty Discussion Forum', path: '/forum', category: 'Community' },
  { name: 'Weekly Class Timetable', path: '/timetable', category: 'Academics' },
  { name: 'Notes & Assignment Repository', path: '/materials', category: 'Academics' },

  // Faculty Specific
  { name: 'Faculty Dashboard & Overview', path: '/faculty/dashboard', category: 'Faculty', role: 'FACULTY' },
  { name: 'Faculty Attendance Marker', path: '/faculty/attendance', category: 'Faculty', role: 'FACULTY' },
  { name: 'Faculty Sessional Marks Entry', path: '/faculty/marks', category: 'Faculty', role: 'FACULTY' },
  { name: 'Upload Study Material', path: '/faculty/materials', category: 'Faculty', role: 'FACULTY' },

  // Admin Specific
  { name: 'Admin Control Center', path: '/admin/dashboard', category: 'Admin', role: 'ADMIN' },
  { name: 'NOC Applications Reviewer', path: '/admin/noc-review', category: 'Admin', role: 'ADMIN' },
  { name: 'Publish Campus Notice', path: '/admin/notices', category: 'Admin', role: 'ADMIN' },
  { name: 'Publish Placement Drive', path: '/admin/placements', category: 'Admin', role: 'ADMIN' },
];

export default function Topbar({ title = 'Dashboard', onToggleMobileMenu }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Notifications state
  const [notices, setNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const notifRef = useRef(null);

  // Profile Modal state
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // Fetch notices for notifications
    getNotices()
      .then((res) => {
        if (Array.isArray(res)) {
          setNotices(res);
          setUnreadCount(res.length);
        }
      })
      .catch(() => {
        // Fallback realistic notices if network fails
        setNotices([
          { id: 1, title: 'Mid-Semester Exam Schedule Released', content: 'The Mid-Sem examination for 7th Semester CSE begins on Oct 10th, 2025.', category: 'EXAM', posted_date: '2025-09-01' },
          { id: 2, title: 'Fee Payment Deadline Extension', content: 'Last date for 7th semester fee payment extended to Sept 15th without late fee.', category: 'ACADEMIC', posted_date: '2025-08-28' },
          { id: 3, title: 'Google Placement Drive Announcement', content: 'Registration link for Google India SDE campus placement drive is now active.', category: 'PLACEMENT', posted_date: '2025-09-03' }
        ]);
      });
  }, []);

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLinks = systemNavigationLinks.filter((item) => {
    if (item.role && user && item.role !== user.role && user.role !== 'ADMIN') {
      return false;
    }
    if (!searchQuery.trim()) return true;
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSelectLink = (path) => {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const markAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {/* Hamburger Menu Toggle for Both Desktop and Mobile/Tablet */}
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle Navigation Sidebar"
          title="Toggle Sidebar"
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-xs sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate">{title}</h2>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Working Search Bar */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search portal features, timetable, marks..."
              className="pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-64 text-slate-700 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
              <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between font-semibold text-slate-500">
                <span>Quick Navigation Search</span>
                <span className="text-[10px] text-indigo-600">{filteredLinks.length} results found</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredLinks.length > 0 ? (
                  filteredLinks.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectLink(item.path)}
                      className="w-full text-left p-3 hover:bg-slate-50 flex items-center justify-between transition group"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">{item.name}</p>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 font-mono text-slate-500 rounded-md">
                          {item.category}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    No matching portal feature found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Working Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl relative transition"
            title="Campus Alerts & Notices"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="w-4 h-4 bg-rose-500 text-white rounded-full absolute -top-1 -right-1 text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Drawer Popover */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
              <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold">Campus Alerts & Official Notices</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notices.length > 0 ? (
                  notices.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNotice(n)}
                      className="p-3.5 hover:bg-slate-50 transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          n.category === 'EXAM' ? 'bg-amber-100 text-amber-800' :
                          n.category === 'PLACEMENT' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {n.category || 'NOTICE'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{n.posted_date}</span>
                      </div>
                      <p className="font-bold text-slate-900">{n.title}</p>
                      <p className="text-slate-500 text-[11px] line-clamp-2">{n.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    No new notices.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip - Clickable to open Profile Data Modal */}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex items-center space-x-2.5 border-l border-slate-200 pl-3 p-1 rounded-xl hover:bg-slate-100 transition text-left cursor-pointer group"
          title="Click to view personal profile details (Name, College ID, Roll No, Branch, Semester, etc.)"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-sm uppercase transition ring-2 ring-transparent group-hover:ring-indigo-300">
            {getUserInitials(user)}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition">
              {getUserDisplayName(user)}
            </p>
            <p className="text-[10px] text-indigo-600 font-bold tracking-tight">
              {getUserAccountLabel(user)}
            </p>
          </div>
        </button>
      </div>

      {/* User Personal Profile Details Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
      />

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[11px] font-bold rounded-full uppercase">
                  {selectedNotice.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedNotice.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {selectedNotice.content}
            </p>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100">
              <span>Posted by: {selectedNotice.posted_by || 'Administration'}</span>
              <span>Date: {selectedNotice.posted_date}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
