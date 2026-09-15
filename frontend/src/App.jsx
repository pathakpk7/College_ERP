import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import RegistrationLog from './pages/RegistrationLog';
import NocApplication from './pages/NocApplication';
import FeeInfo from './pages/FeeInfo';
import SessionalMarks from './pages/SessionalMarks';
import Library from './pages/Library';
import Sms from './pages/Sms';
import Placement from './pages/Placement';
import DiscussionForum from './pages/DiscussionForum';
import Timetable from './pages/Timetable';
import NotesAssignments from './pages/NotesAssignments';

// Faculty Pages
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyClassView from './pages/FacultyClassView';
import FacultyAttendanceMarker from './pages/FacultyAttendanceMarker';
import FacultyMarksEntry from './pages/FacultyMarksEntry';
import FacultyUploadMaterial from './pages/FacultyUploadMaterial';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminNocReviewer from './pages/AdminNocReviewer';
import AdminNoticePublisher from './pages/AdminNoticePublisher';
import AdminPlacementPublisher from './pages/AdminPlacementPublisher';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if authorized elsewhere
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student & Common Portal Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            
            {/* Student Specific */}
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><Dashboard /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute allowedRoles={['STUDENT']}><Attendance /></ProtectedRoute>} />
            <Route path="registration" element={<ProtectedRoute allowedRoles={['STUDENT']}><RegistrationLog /></ProtectedRoute>} />
            <Route path="noc" element={<ProtectedRoute allowedRoles={['STUDENT']}><NocApplication /></ProtectedRoute>} />
            <Route path="fees" element={<ProtectedRoute allowedRoles={['STUDENT']}><FeeInfo /></ProtectedRoute>} />
            <Route path="marks" element={<ProtectedRoute allowedRoles={['STUDENT']}><SessionalMarks /></ProtectedRoute>} />
            <Route path="library" element={<ProtectedRoute allowedRoles={['STUDENT']}><Library /></ProtectedRoute>} />
            <Route path="placement" element={<ProtectedRoute allowedRoles={['STUDENT']}><Placement /></ProtectedRoute>} />
            <Route path="materials" element={<ProtectedRoute allowedRoles={['STUDENT', 'FACULTY']}><NotesAssignments /></ProtectedRoute>} />

            {/* Faculty Specific */}
            <Route path="faculty/dashboard" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="faculty/classes" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><FacultyClassView /></ProtectedRoute>} />
            <Route path="faculty/attendance" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><FacultyAttendanceMarker /></ProtectedRoute>} />
            <Route path="faculty/marks" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><FacultyMarksEntry /></ProtectedRoute>} />
            <Route path="faculty/materials" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><FacultyUploadMaterial /></ProtectedRoute>} />

            {/* Admin Specific */}
            <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/noc-review" element={<ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}><AdminNocReviewer /></ProtectedRoute>} />
            <Route path="admin/notices" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminNoticePublisher /></ProtectedRoute>} />
            <Route path="admin/placements" element={<ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}><AdminPlacementPublisher /></ProtectedRoute>} />

            {/* Common Shared */}
            <Route path="messages" element={<Sms />} />
            <Route path="forum" element={<DiscussionForum />} />
            <Route path="timetable" element={<Timetable />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
