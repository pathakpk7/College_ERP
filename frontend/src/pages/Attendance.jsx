import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  getAttendanceSummary,
  getDayWiseAttendance,
  getStudentSemesters,
  calculateAttendance
} from '../services/erpService';
import {
  CalendarCheck,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  History,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [semestersList, setSemestersList] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);

  // Active View Tab: 'DAILY_DETAILS' | 'SUMMARY_REPORT' | 'HISTORY_TAB' | 'CALCULATOR'
  const [activeTab, setActiveTab] = useState('DAILY_DETAILS');

  // Loaded Attendance Data
  const [summary, setSummary] = useState(null);
  const [dayWise, setDayWise] = useState([]);

  // Calculator Form State
  const [calcForm, setCalcForm] = useState({
    present_classes: 0,
    total_classes: 0,
    remaining_classes: 15,
    required_percentage: 75.0,
  });
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async () => {
    try {
      setLoading(true);
      const sems = await getStudentSemesters();
      setSemestersList(sems);
      const currentSem = sems.find((s) => s.is_current) || sems[0];
      const defaultSemNum = currentSem ? currentSem.semester_number : 7;
      setSelectedSemester(defaultSemNum);
      await fetchSemesterData(defaultSemNum);
    } catch (err) {
      console.error('Failed to load student semesters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesterData = async (semNum) => {
    setLoading(true);
    try {
      const [sumRes, dayRes] = await Promise.all([
        getAttendanceSummary(semNum),
        getDayWiseAttendance(semNum),
      ]);
      setSummary(sumRes);
      setDayWise(dayRes);

      if (sumRes) {
        setCalcForm((prev) => ({
          ...prev,
          present_classes: sumRes.present_classes,
          total_classes: sumRes.total_classes,
        }));
      }
    } catch (err) {
      console.error('Failed to load attendance for semester:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterChange = (semNum) => {
    setSelectedSemester(semNum);
    fetchSemesterData(semNum);
  };

  const handleRefresh = () => {
    if (selectedSemester) {
      fetchSemesterData(selectedSemester);
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const res = await calculateAttendance(calcForm);
      setCalcResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCalcLoading(false);
    }
  };

  // Helper date formatter DD/MM/YYYY
  const formatDateStr = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(dateVal);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateVal;
    }
  };

  // Build Date-wise matrix for Period 1 to Period 10
  const buildDateMatrix = () => {
    const datesSet = new Set(dayWise.map((r) => r.date));
    const sortedDates = Array.from(datesSet).sort((a, b) => new Date(a) - new Date(b));

    return sortedDates.map((dateStr, idx) => {
      const recordsForDate = dayWise.filter((r) => r.date === dateStr);
      const periodMap = {};
      recordsForDate.forEach((r) => {
        periodMap[r.class_number] = r;
      });

      return {
        sNo: idx + 1,
        dateStr: dateStr,
        formattedDate: formatDateStr(dateStr),
        periods: periodMap,
      };
    });
  };

  if (loading && !summary) {
    return (
      <PageContainer>
        <LoadingSpinner message="Loading iCampus ERP Attendance Portal..." />
      </PageContainer>
    );
  }

  const matrixRows = buildDateMatrix();

  return (
    <PageContainer>
      {/* Top Header Banner & Semester Switcher */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
              <BookOpen className="w-3.5 h-3.5" />
              <span>UNITED INSTITUTE OF TECHNOLOGY-[2026-2027]</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">Student Academic Attendance Portal</h1>
            <p className="text-xs text-slate-300">
              Viewing Session Records for Semester {selectedSemester || 7}
            </p>
          </div>

          {/* Semester History Selector Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <History className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs font-bold text-slate-300">Select Academic Semester:</span>
            <select
              value={selectedSemester || ''}
              onChange={(e) => handleSemesterChange(parseInt(e.target.value))}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-extrabold text-indigo-300 focus:outline-none focus:border-indigo-500"
            >
              {semestersList.map((s) => (
                <option key={s.semester_number} value={s.semester_number}>
                  Semester {s.semester_number} {s.is_current ? '(Current Session)' : `(${s.academic_year})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Tabs Navigation */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('DAILY_DETAILS')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 border ${
              activeTab === 'DAILY_DETAILS'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Daily Attendance Details (P1 - P10)</span>
          </button>

          <button
            onClick={() => setActiveTab('SUMMARY_REPORT')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 border ${
              activeTab === 'SUMMARY_REPORT'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance Summary Report</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY_TAB')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 border ${
              activeTab === 'HISTORY_TAB'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Previous Semesters History</span>
          </button>

          <button
            onClick={() => setActiveTab('CALCULATOR')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 border ${
              activeTab === 'CALCULATOR'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Eligibility Calculator</span>
          </button>
        </div>
      </div>

      {/* Admin Reset Banner Notification (If active) */}
      {summary?.last_reset_event && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700/80 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Official Administrative Reset Active:</strong> Evaluation cycle reset for <strong>{summary.last_reset_event}</strong>. Percentages calculated from effective reset date.
            </span>
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-900 border border-emerald-600 rounded font-bold text-[10px]">
            ADMIN CONTROLLED
          </span>
        </div>
      )}

      {/* TAB 1: DAILY ATTENDANCE DETAILS MATRIX VIEW (IMAGE 1 SPECIFICATION) */}
      {activeTab === 'DAILY_DETAILS' && (
        <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-lg bg-white">
          {/* Blue ERP Subhead Banner */}
          <div className="bg-[#003366] text-white px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-200" />
              <span className="font-extrabold text-sm tracking-wide">Attendance Details</span>
            </div>
            {/* Color Legend (Image 1) */}
            <div className="flex items-center space-x-2 text-[11px] font-extrabold">
              <span className="bg-[#008000] text-white px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                PRESENT
              </span>
              <span className="bg-[#cc0000] text-white px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                ABSENT
              </span>
            </div>
          </div>

          {/* ERP Top Stats Summary Bar (Image 1) */}
          <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 text-xs font-bold text-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>Total Lecture :: <span className="font-mono text-slate-900">{summary?.total_classes || 0}</span></div>
            <div>Total Present :: <span className="font-mono text-emerald-700">{summary?.present_classes || 0}</span></div>
            <div>Total Absent :: <span className="font-mono text-rose-700">{summary?.absent_classes || 0}</span></div>
            <div>Percentage :: <span className="font-mono text-indigo-700">{summary?.overall_percentage || 0} %</span></div>
          </div>

          {/* ERP Matrix Table (Period 1 to Period 10) */}
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-center border-collapse text-xs">
              <thead className="bg-[#003366] text-white font-bold text-[11px] sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 border border-slate-700 w-12 bg-[#002244]">SNo</th>
                  <th className="py-2.5 px-4 border border-slate-700 whitespace-nowrap bg-[#002244]">Lecture Date</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                    <th key={p} className="py-2.5 px-2 border border-slate-700 w-20 min-w-[70px]">
                      P{p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 bg-white">
                {matrixRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-slate-400 italic text-center">
                      No daily attendance logs recorded for Semester {selectedSemester}.
                    </td>
                  </tr>
                ) : (
                  matrixRows.map((row) => (
                    <tr key={row.dateStr} className="hover:bg-slate-50 border-b border-slate-300">
                      <td className="py-2 px-2 border border-slate-300 font-mono text-slate-600 font-bold bg-slate-50">
                        {row.sNo}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-mono font-bold text-slate-900 whitespace-nowrap bg-slate-50">
                        {row.formattedDate}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pNum) => {
                        const rec = row.periods[pNum];
                        if (!rec) {
                          return (
                            <td key={pNum} className="border border-slate-300 bg-white p-1">
                              {/* Empty slot cell */}
                            </td>
                          );
                        }
                        const isPresent = rec.status === 'PRESENT';
                        return (
                          <td key={pNum} className="border border-slate-300 p-1 font-mono">
                            <div
                              className={`w-full py-1.5 px-1 rounded text-[10px] font-black text-center shadow-xs truncate ${
                                isPresent ? 'bg-[#008000] text-white' : 'bg-[#cc0000] text-white'
                              }`}
                              title={`${rec.subject_code} - ${rec.subject_name} (${rec.status})`}
                            >
                              {rec.subject_code}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE SUMMARY REPORT VIEW (IMAGE 2 SPECIFICATION) */}
      {activeTab === 'SUMMARY_REPORT' && (
        <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-lg bg-white">
          {/* Dark Blue ERP Header (Image 2) */}
          <div className="bg-[#003366] text-white px-4 py-2.5 flex items-center justify-between">
            <span className="font-extrabold text-sm tracking-wide">Attendance Summary Report(s)</span>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-extrabold text-xs flex items-center space-x-1 transition shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* ERP Summary Table (Image 2 Columns) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#003366] text-white font-extrabold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 border border-slate-700 text-center w-12 bg-[#002244]">SNo</th>
                  <th className="py-2.5 px-4 border border-slate-700 bg-[#002244]">Subject Name</th>
                  <th className="py-2.5 px-3 border border-slate-700 text-center bg-[#002244]">Subject Code</th>
                  <th className="py-2.5 px-3 border border-slate-700 text-center whitespace-nowrap bg-[#002244]">Lecture Start</th>
                  <th className="py-2.5 px-3 border border-slate-700 text-center whitespace-nowrap bg-[#002244]">Lecture Updated</th>
                  <th className="py-2.5 px-3 border border-slate-700 text-center w-16 bg-[#002244]">Total</th>
                  <th className="py-2.5 px-3 border border-slate-700 text-center w-16 bg-[#002244]">Present</th>
                  <th className="py-2.5 px-3 border border-slate-700 text-center w-16 bg-[#002244]">Absent</th>
                  <th className="py-2.5 px-3 border border-slate-700 text-center w-24 bg-[#002244]">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 bg-white">
                {summary?.subjects?.map((sub, idx) => (
                  <tr key={sub.subject_id} className="hover:bg-slate-50 border-b border-slate-300 font-medium">
                    <td className="py-2.5 px-3 text-center border border-slate-300 font-mono font-bold text-slate-700 bg-slate-50">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 border border-slate-300 font-bold text-slate-900 uppercase">
                      {sub.subject_name}
                    </td>
                    <td className="py-2.5 px-3 text-center border border-slate-300 font-mono font-bold text-indigo-700 bg-slate-50">
                      {sub.subject_code}
                    </td>
                    <td className="py-2.5 px-3 text-center border border-slate-300 font-mono text-slate-700">
                      {formatDateStr(sub.lecture_start)}
                    </td>
                    <td className="py-2.5 px-3 text-center border border-slate-300 font-mono text-slate-700">
                      {formatDateStr(sub.lecture_updated)}
                    </td>
                    <td className="py-2.5 px-3 text-center border border-slate-300 font-mono font-bold text-slate-900">
                      {sub.total_classes}.0
                    </td>
                    <td className="py-2.5 px-3 text-center border border-slate-300 font-mono font-bold text-emerald-600">
                      {sub.present_classes}.0
                    </td>
                    <td className="py-2.5 px-3 text-center border border-slate-300 font-mono font-bold text-rose-600">
                      {sub.absent_classes}.0
                    </td>
                    <td className="py-2.5 px-3 text-center border border-slate-300 font-mono font-extrabold text-slate-900">
                      {sub.percentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PREVIOUS SEMESTERS HISTORY */}
      {activeTab === 'HISTORY_TAB' && (
        <Card
          title="Previous Semester Attendance History"
          icon={History}
          subtitle="Select any semester to review historical subject attendance, total lectures conducted, and attendance percentages"
        >
          {/* Semester Selector Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Layers className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Select Academic Semester</label>
                <p className="text-[11px] text-slate-500">Switch between semesters to load archived subject records</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedSemester || ''}
                onChange={(e) => handleSemesterChange(parseInt(e.target.value))}
                className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-indigo-900 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {semestersList.map((sem) => (
                  <option key={sem.semester_number} value={sem.semester_number}>
                    Semester {sem.semester_number} {sem.is_current ? '(Current Session)' : `(${sem.academic_year})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Attendance Table for the Selected Semester */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white mb-6">
            <div className="bg-[#003366] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-200" />
                <span className="font-extrabold text-xs tracking-wide">
                  Semester {selectedSemester} &mdash; Subject-Wise Attendance Breakdown
                </span>
              </div>
              <button
                onClick={() => setActiveTab('DAILY_DETAILS')}
                className="text-[11px] font-bold text-indigo-200 hover:text-white underline"
              >
                View Daily P1-P10 Grid &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5 text-center w-12">#</th>
                    <th className="py-3 px-3.5 w-32 font-mono">Subject Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-3.5 text-center w-24">Conducted</th>
                    <th className="py-3 px-3.5 text-center w-24">Attended</th>
                    <th className="py-3 px-3.5 text-center w-24">Absent</th>
                    <th className="py-3 px-4 text-right w-28">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!summary?.subjects || summary.subjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No subject attendance recorded for Semester {selectedSemester}.
                      </td>
                    </tr>
                  ) : (
                    summary.subjects.map((sub, idx) => (
                      <tr key={sub.subject_id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3.5 font-mono font-extrabold text-indigo-700">{sub.subject_code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 uppercase">{sub.subject_name}</td>
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">{sub.total_classes}</td>
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-emerald-600">{sub.present_classes}</td>
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-rose-600">{sub.absent_classes}</td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg font-mono font-black text-xs ${
                              sub.percentage >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sub.percentage.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall % / Conducted / Attended Summary for That Semester at the Bottom */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/60">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                Semester {selectedSemester} Aggregate Summary
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {semestersList.find((s) => s.semester_number === selectedSemester)?.academic_year || ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
                <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Overall %</p>
                <p className="text-2xl sm:text-3xl font-black mt-1 text-white">
                  {summary?.overall_percentage || 0}%
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {summary?.overall_percentage >= 75 ? 'Meets 75% Requirement' : 'Below 75% Shortage'}
                </p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
                <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Conducted</p>
                <p className="text-2xl sm:text-3xl font-black mt-1 text-slate-100">
                  {summary?.total_classes || 0}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Total Lectures Held</p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80">
                <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Attended</p>
                <p className="text-2xl sm:text-3xl font-black mt-1 text-emerald-400">
                  {summary?.present_classes || 0}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Absent: {summary?.absent_classes || 0} Lectures
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: ATTENDANCE ELIGIBILITY CALCULATOR */}
      {activeTab === 'CALCULATOR' && (
        <Card title="Attendance Eligibility Calculator" icon={Calculator} subtitle="Calculate additional classes needed using formula: x = ceil((0.75 * T - P) / 0.25)">
          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classes Attended (P)</label>
              <input
                type="number"
                min="0"
                required
                value={calcForm.present_classes}
                onChange={(e) => setCalcForm({ ...calcForm, present_classes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Conducted (T)</label>
              <input
                type="number"
                min="1"
                required
                value={calcForm.total_classes}
                onChange={(e) => setCalcForm({ ...calcForm, total_classes: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remaining Classes (R)</label>
              <input
                type="number"
                min="0"
                required
                value={calcForm.remaining_classes}
                onChange={(e) => setCalcForm({ ...calcForm, remaining_classes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={calcLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                {calcLoading ? 'Calculating...' : 'Run Eligibility Calculator'}
              </button>
            </div>
          </form>

          {calcResult && (
            <div className={`mt-4 p-3.5 rounded-2xl border text-xs ${calcResult.is_possible ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <div className="flex items-start space-x-3">
                {calcResult.is_possible ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <p className="font-bold text-xs">{calcResult.message}</p>
                  <p>Current Attendance: <strong>{calcResult.current_percentage}%</strong> &bull; Max Possible: <strong>{calcResult.max_possible_percentage}%</strong></p>
                  {calcResult.required_additional_classes > 0 && (
                    <p className="font-semibold text-indigo-700">Minimum additional classes to attend: {calcResult.required_additional_classes}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </PageContainer>
  );
}
