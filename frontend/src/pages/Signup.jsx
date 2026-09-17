import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CaptchaWidget from '../components/common/CaptchaWidget';
import {
  GraduationCap,
  Lock,
  User,
  Mail,
  AlertCircle,
  UserPlus,
  LogIn,
  Building2,
  BadgeCheck,
  Award,
  Users,
  Briefcase,
  ShieldCheck
} from 'lucide-react';

export default function Signup() {
  const [role, setRole] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student specific
  const [fullName, setFullName] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('A');

  // Faculty specific
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Professor');

  // Captcha & View Mode
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSolution, setCaptchaSolution] = useState('');
  const [infoTab, setInfoTab] = useState('COLLEGE');

  const { register, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        role,
        username: role === 'STUDENT' ? enrollmentNumber : employeeId || fullName,
        email,
        password,
        captcha_id: captchaId,
        captcha_solution: captchaSolution,
        full_name: fullName,
        enrollment_number: enrollmentNumber,
        branch,
        semester: parseInt(semester),
        section,
        employee_id: employeeId,
        department,
        designation,
      };

      const user = await register(payload);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'FACULTY') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* LEFT BLOCK: Immersed College & ERP Identity Section */}
      <div className="lg:w-7/12 relative bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-900 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Decorative background glow accents */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header & Branding */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src="/app_icon.png"
              alt="CampusERP"
              className="w-12 h-12 rounded-2xl shadow-xl shadow-cyan-500/10 object-contain shrink-0 ring-2 ring-white/10"
            />
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-[10px] font-bold text-indigo-300 tracking-wide uppercase shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AICTE Approved &bull; NAAC 'A+' Accredited &bull; Estd. 2005</span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-2xl font-black text-white tracking-tight">Campus</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">ERP</span>
                <span className="text-xs text-slate-400 font-bold ml-2 pl-2 border-l border-slate-700">United Institute of Technology</span>
              </div>
              <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest mt-0.5">
                CONNECT &bull; MANAGE &bull; EMPOWER
              </p>
            </div>
          </div>

          {/* Interactive Navigation Switcher */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setInfoTab('COLLEGE')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                infoTab === 'COLLEGE'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>About UIT College</span>
            </button>

            <button
              type="button"
              onClick={() => setInfoTab('ERP')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                infoTab === 'ERP'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>About Campus ERP</span>
            </button>

            <button
              type="button"
              onClick={() => setInfoTab('STATS')}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                infoTab === 'STATS'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Key Accreditations & Stats</span>
            </button>
          </div>

          {/* TAB 1: ABOUT COLLEGE (UIT) */}
          {infoTab === 'COLLEGE' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-100 leading-snug">
                  Premier Technical Education, Research & Innovation Hub
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  <strong className="text-slate-200">United Institute of Technology (UIT)</strong> is a center of academic excellence recognized for delivering outcome-based engineering education aligned with <span className="text-indigo-300 font-semibold">NEP 2020 guidelines</span>. With world-class laboratories, specialized incubation cells, and industry-sponsored Centers of Excellence, UIT nurtures innovative engineers and global technology leaders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5 mb-1">
                    <span>💻 CSE, AI/ML & Data Science</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Advanced computing laboratories, GPU research clusters, and high-performance algorithms incubation center.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5 mb-1">
                    <span>📡 Electronics & IoT Systems</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    State-of-the-art VLSI prototyping, embedded systems design, and wireless communication research suites.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5 mb-1">
                    <span>⚙️ Mechanical & Robotics Labs</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Industry 4.0 automation, CNC machinery, 3D printing suites, and computer-aided engineering modeling.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5 mb-1">
                    <span>🏛️ Smart Campus Infrastructure</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    40-acre digital Wi-Fi campus, 50,000+ volume technical library, indoor sports complex, and on-campus hostel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT CAMPUS ERP */}
          {infoTab === 'ERP' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-100 leading-snug">
                  Integrated Digital Campus Operating System
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  The <strong className="text-slate-200">UIT ERP Platform</strong> is a unified, paperless governance infrastructure engineered to streamline the entire student and faculty academic lifecycle — from enrollment and attendance tracking to continuous sessional evaluation and corporate placement clearance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-indigo-300 mb-1">
                    📊 Live Attendance & Edit Regulations
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Timetable-linked multi-period attendance marking with strict 2-edit institutional audit limits and 75% compliance tracking.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-emerald-300 mb-1">
                    📝 Dynamic Sessional Marks Grid
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Spreadsheet-style bulk marks entry for Sessional 1, Sessional 2, and Lab assessments with automated grade computation.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-300 mb-1">
                    📚 Centralized Academic Notes & PYQs
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Faculty-uploaded lecture notes, syllabus blueprints, and previous year university question papers organized by semester.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                  <h4 className="text-xs font-bold text-cyan-300 mb-1">
                    💼 Placement Portal & Digital NOC
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Campus recruitment drives, automated eligibility filtering, and tamper-proof digital NOC applications for off-campus internships.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEY ACCREDITATIONS & STATS */}
          {infoTab === 'STATS' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-100 leading-snug">
                  Recognized Excellence & Placement Benchmark
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  UIT maintains exemplary standards in technical pedagogy, engineering research, and corporate placements with top multinational technology companies and global research labs.
                </p>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
                  <p className="text-xl font-black text-indigo-400">₹ 44.0 LPA</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Highest Domestic CTC</p>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
                  <p className="text-xl font-black text-emerald-400">98.4%</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Placement Conversion</p>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
                  <p className="text-xl font-black text-amber-400">15,000+</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Global Alumni Base</p>
                </div>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-center">
                  <p className="text-xl font-black text-cyan-400">50+ MoUs</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Industry Partnerships</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs space-y-1.5 text-slate-400">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
                  <BadgeCheck className="w-4 h-4" />
                  <span>Statutory Recognitions & Technical Affiliations</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Approved by All India Council for Technical Education (AICTE), Ministry of Education, Govt. of India. Affiliated to State Technical University. Accredited with Grade 'A+' by NAAC.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info in left panel */}
        <div className="relative z-10 pt-4 mt-6 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 space-y-1 sm:space-y-0">
          <span>&copy; 2026 United Institute of Technology. All rights reserved.</span>
          <span className="text-slate-400">UIT Digital Campus Operating System &bull; Version 2.4</span>
        </div>
      </div>

      {/* RIGHT BLOCK: Signup Form Box */}
      <div className="lg:w-5/12 p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-slate-950 relative overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center space-x-2.5 pb-1">
              <img src="/app_icon.png" alt="CampusERP" className="w-10 h-10 rounded-xl shadow-md object-contain ring-1 ring-white/10" />
              <div className="text-left">
                <div className="flex items-center space-x-1">
                  <span className="text-base font-black text-white tracking-tight">Campus</span>
                  <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">ERP</span>
                </div>
                <p className="text-[8px] text-cyan-300/90 font-bold uppercase tracking-widest">
                  CONNECT &bull; MANAGE &bull; EMPOWER
                </p>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Create Institutional Account</h3>
            <p className="text-[11px] text-slate-400">Register with your official roll number or employee ID</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => { setRole('STUDENT'); setError(null); }}
              className={`py-1.5 px-2 text-xs font-bold rounded-xl transition text-center ${
                role === 'STUDENT'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => { setRole('FACULTY'); setError(null); }}
              className={`py-1.5 px-2 text-xs font-bold rounded-xl transition text-center ${
                role === 'FACULTY'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => { setRole('ADMIN'); setError(null); }}
              className={`py-1.5 px-2 text-xs font-bold rounded-xl transition text-center ${
                role === 'ADMIN'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {role === 'STUDENT' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Roll / Enrollment No.</label>
                    <input
                      type="text"
                      required
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      placeholder="e.g. 2026CSE0199"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Branch</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Information Technology">IT</option>
                      <option value="Electronics Engineering">ECE</option>
                      <option value="Mechanical Engineering">ME</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Section</label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="A"
                      className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Robert Smith"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Employee ID</label>
                    <input
                      type="text"
                      required
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="FAC9901"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Designation</label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white"
                    >
                      <option value="Professor">Professor</option>
                      <option value="HOD">Head of Department (HOD)</option>
                      <option value="Dean">Dean</option>
                      <option value="Principal">Principal</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Computer Science & Engineering"
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@uit.edu"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Captcha Widget */}
            <CaptchaWidget
              onCaptchaChange={setCaptchaId}
              value={captchaSolution}
              onChange={setCaptchaSolution}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Signup & Enter Portal'}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>Already have an account?</span>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1">
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In Instead</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
