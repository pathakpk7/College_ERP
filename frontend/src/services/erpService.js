import api from './api';

// Student & Common ERP Services
export const getDashboardSummary = () => api.get('/dashboard').then(res => res.data);
export const getStudentProfile = () => api.get('/students/me').then(res => res.data);

export const getStudentSemesters = () => api.get('/attendance/semesters').then(res => res.data);
export const getAttendanceSummary = (semester) => api.get('/attendance/summary', { params: { semester } }).then(res => res.data);
export const getDayWiseAttendance = (semester) => api.get('/attendance/day-wise', { params: { semester } }).then(res => res.data);
export const calculateAttendance = (data) => api.post('/attendance/calculate', data).then(res => res.data);

export const getRegistrationHistory = () => api.get('/registration').then(res => res.data);

export const getNocApplications = () => api.get('/noc').then(res => res.data);
export const submitNocApplication = (data) => api.post('/noc', data).then(res => res.data);

export const getFeeRecords = () => api.get('/fees').then(res => res.data);
export const downloadFeeReceipt = (feeId) => api.get(`/fees/${feeId}/receipt`, { responseType: 'blob' }).then(res => res.data);

export const getSessionalMarks = () => api.get('/marks').then(res => res.data);

export const getLibraryRecords = () => api.get('/library').then(res => res.data);

export const getMessages = () => api.get('/messages').then(res => res.data);
export const getMessageRecipients = () => api.get('/messages/recipients').then(res => res.data);
export const sendMessage = (data) => api.post('/messages', data).then(res => res.data);

export const getPlacementDrives = () => api.get('/placements').then(res => res.data);
export const updatePlacementProfile = (data) => api.patch('/placements/profile', data).then(res => res.data);

export const getForumPosts = () => api.get('/forum').then(res => res.data);
export const createForumPost = (data) => api.post('/forum', data).then(res => res.data);

export const getTimetable = () => api.get('/timetable').then(res => res.data);

export const getAcademicMaterials = () => api.get('/academic-materials').then(res => res.data);

// Faculty Portal Services
export const getFacultyDashboard = () => api.get('/faculty-portal/dashboard').then(res => res.data);
export const getEnrolledStudents = (params) => api.get('/faculty-portal/students', { params }).then(res => res.data);
export const markStudentAttendance = (data) => api.post('/faculty-portal/attendance', data).then(res => res.data);
export const submitStudentMarks = (data) => api.post('/faculty-portal/marks', data).then(res => res.data);
export const submitBulkStudentMarks = (data) => api.post('/faculty-portal/marks/bulk', data).then(res => res.data);
export const uploadStudyMaterial = (data) => api.post('/faculty-portal/materials', data).then(res => res.data);

// Admin Portal & Notices Services
export const getAdminDashboard = () => api.get('/admin-portal/dashboard').then(res => res.data);
export const getNotices = () => api.get('/admin-portal/notices').then(res => res.data);
export const deleteNotice = (id) => api.delete(`/admin-portal/notices/${id}`).then(res => res.data);
export const getDetailedNocApplications = () => api.get('/admin-portal/noc-applications').then(res => res.data);
export const reviewNocApplication = (id, data) => api.patch(`/admin-portal/noc/${id}`, data).then(res => res.data);
export const postNotice = (data) => api.post('/admin-portal/notices', data).then(res => res.data);
export const getAllPlacementDrives = () => api.get('/admin-portal/placements/all').then(res => res.data);
export const publishPlacementDrive = (data) => api.post('/admin-portal/placements', data).then(res => res.data);
export const deletePlacementDrive = (id) => api.delete(`/admin-portal/placements/${id}`).then(res => res.data);
export const resetAttendanceCycle = (data) => api.post('/admin-portal/attendance/reset', data).then(res => res.data);

