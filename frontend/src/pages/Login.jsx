import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CaptchaWidget from '../components/common/CaptchaWidget';
import {
  GraduationCap,
  Lock,
  User,
  AlertCircle,
  Sparkles,
  UserPlus,
  Building2,
  Award,
  Users,
  Briefcase,
  ShieldCheck,
  BadgeCheck
} from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'FACULTY' | 'ADMIN'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('Professor');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaSolution, setCaptchaSolution] = useState('');

  const { login, loading, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(
        identifier,
        password,
        captchaId,
        captchaSolution,
        role !== 'STUDENT' ? designation : null
      );
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'FACULTY') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  const fillCreds = (idVal, passVal, roleType = 'STUDENT', desig = 'Professor') => {
    setRole(roleType);
    setIdentifier(idVal);
    setPassword(passVal);
    if (roleType !== 'STUDENT') setDesignation(desig);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* LEFT BLOCK: Immersed College Identity Section (About United Institute of Technology) */}
      <div className="lg:w-7/12 relative bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Subtle decorative mesh background accents */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none"></div>

        {/* Top Header & Branding */}
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
              Empowering Next-Gen Engineers, Researchers & Academic Leaders
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Welcome to the official Enterprise Resource Planning (ERP) portal of <strong className="text-slate-200 font-semibold">United Institute of Technology</strong>. Our unified digital infrastructure seamlessly connects students, esteemed faculty, and college administration for real-time academic tracking, automated attendance, sessional score management, and career placement services.
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 mt-0.5">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Academic Excellence</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Industry-aligned curricula with state-of-the-art laboratory infrastructure.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Class & Roster Portal</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct class traversal, live attendance tracking, and sessional mark entry.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 mt-0.5">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">100% Placement Support</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct campus hiring drives with leading global engineering enterprises.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start space-x-3.5">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Secure Campus Governance</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Role-based access control for Students, Faculty, and Management.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info in left panel */}
        <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 space-y-2 sm:space-y-0">
          <span>&copy; 2026 United Institute of Technology. All rights reserved.</span>
          <span className="text-slate-400">ERP Technical Support: support@uit.edu</span>
        </div>
      </div>

      {/* RIGHT BLOCK: Login Card Box */}
      <div className="lg:w-5/12 p-6 sm:p-10 lg:p-12 flex items-center justify-center bg-slate-950 relative">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight">Portal Sign In</h3>
            <p className="text-xs text-slate-400">Select your account role to proceed</p>
          </div>

          {/* Role Picker Tabs */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dynamic Identifier Field based on Role */}
            {role === 'STUDENT' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Roll Number / Enrollment No.
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter Roll Number (e.g. 2022CSE0101)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {role === 'FACULTY' ? 'Name / Employee ID / Email' : 'Admin Username / Email'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={role === 'FACULTY' ? 'Enter Employee ID or Name' : 'Enter Admin ID or Email'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Designation Dropdown for Faculty and Admin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Designation / Title
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Professor">Professor</option>
                    <option value="HOD">Head of Department (HOD)</option>
                    <option value="Dean">Dean</option>
                    <option value="Principal">Principal</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                  </select>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
            </button>
          </form>

          {/* Link to Signup */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span>New user at UIT?</span>
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </Link>
          </div>

          {/* Quick Fill Test Accounts */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Quick Login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCreds('2022CSE0101', 'student123', 'STUDENT')}
                className="py-1.5 px-2 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-300 text-center"
              >
                Roll No (Student)
              </button>
              <button
                type="button"
                onClick={() => fillCreds('FAC9901', 'faculty123', 'FACULTY', 'HOD')}
                className="py-1.5 px-2 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-300 text-center"
              >
                Faculty (HOD)
              </button>
              <button
                type="button"
                onClick={() => fillCreds('admin', 'admin123', 'ADMIN', 'Dean')}
                className="py-1.5 px-2 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-[11px] font-medium text-slate-300 text-center"
              >
                Admin (Dean)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
