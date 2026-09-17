import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const titleMap = {
  '/dashboard': 'Student Dashboard',
  '/attendance': 'Attendance Tracker & Calculator',
  '/registration': 'Semester Registration Log',
  '/noc': 'No Objection Certificate (NOC) Applications',
  '/fees': 'Fee Info & Receipt Portal',
  '/marks': 'Sessional Marks & Internal Estimates',
  '/library': 'Library Transactions & Fine Status',
  '/messages': 'Messages & Grievances',
  '/placement': 'Placement Drives & Readiness',
  '/forum': 'Student & Faculty Discussion Forum',
  '/timetable': 'Weekly Class Timetable',
  '/materials': 'Notes & Assignment Repository',
  '/faculty/dashboard': 'Faculty Overview Dashboard',
  '/faculty/classes': 'Class Traversal Workspace',
  '/faculty/attendance': 'Faculty Attendance Marker',
  '/faculty/marks': 'Sessional Marks Entry',
  '/faculty/materials': 'Study Materials & Notes',
  '/admin/dashboard': 'Executive Admin Control Center',
  '/admin/noc-review': 'NOC Submissions Reviewer',
  '/admin/notices': 'Campus Notice Publisher',
  '/admin/placements': 'Placement Drive Manager',
};

export default function AppLayout() {
  const location = useLocation();
  const title = titleMap[location.pathname] || 'College ERP System';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    // If screen is mobile/tablet (< 1024px), toggle mobileMenuOpen
    if (window.innerWidth < 1024) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setDesktopSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        isDesktopOpen={desktopSidebarOpen}
        onToggleDesktop={() => setDesktopSidebarOpen((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          onToggleMobileMenu={handleToggleSidebar}
          isDesktopSidebarOpen={desktopSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
