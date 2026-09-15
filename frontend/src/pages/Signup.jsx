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

  // Captcha
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSolution, setCaptchaSolution] = useState('');

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* LEFT BLOCK: Immersed College Identity Section (About United Institute of Technology) */}
      <div className="lg:w-7/12 relative bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400 shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-semibold text-indigo-300 tracking-wide uppercase">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>AICTE Approved & NAAC Accredited</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                United Institute of Technology
              </h1>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-200 leading-snug">
              Join the Academic Community at United Institute of Technology
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create your institutional account to gain full access to course repositories, attendance tracking, automated sessional mark sheets, and campus placement drives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Roll Number Authentication</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct enrollment matching for transparent academic verification.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Designated Faculty Access</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Customized controls for Professors, HODs, Deans, and Principals.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 space-y-2 sm:space-y-0">
          <span>&copy; 2026 United Institute of Technology. All rights reserved.</span>
          <span className="text-slate-400">ERP Technical Support: support@uit.edu</span>
        </div>
      </div>

      {/* RIGHT BLOCK: Signup Form Box */}
      <div className="lg:w-5/12 p-6 sm:p-10 lg:p-12 flex items-center justify-center bg-slate-950 relative overflow-y-auto">
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">Create UIT Account</h3>
            <p className="text-xs text-slate-400">Register with your official institutional details</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => { setRole('STUDENT'); setError(null); }}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition text-center ${
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
              className={`py-2 px-2 text-xs font-bold rounded-xl transition text-center ${
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
              className={`py-2 px-2 text-xs font-bold rounded-xl transition text-center ${
                role === 'ADMIN'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {role === 'STUDENT' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Roll Number / Enrollment No.</label>
                    <input
                      type="text"
                      required
                      value={enrollmentNumber}
                      onChange={(e) => setEnrollmentNumber(e.target.value)}
                      placeholder="e.g. 2026CSE0199"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
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
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Robert Smith"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
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
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Designation</label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white"
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
                      className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@uit.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create strong password"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500"
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
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
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
