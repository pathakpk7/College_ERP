import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getTimetable, getStudentProfile } from '../services/erpService';
import { Calendar, Clock } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Timetable() {
  const [slots, setSlots] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTimetable(), getStudentProfile()])
      .then(([tRes, sRes]) => {
        setSlots(tRes);
        setStudent(sRes);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageContainer><LoadingSpinner message="Fetching timetable..." /></PageContainer>;

  const subtitle = student
    ? `Semester ${student.current_semester} \u2022 ${student.branch} (Section ${student.section})`
    : 'Class Schedule';

  return (
    <PageContainer>
      <Card title="Weekly Class Schedule" icon={Calendar} subtitle={subtitle}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
          {days.map((day) => {
            const daySlots = slots.filter((s) => s.day_of_week === day);
            return (
              <div key={day} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">{day}</h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {daySlots.length} Classes
                  </span>
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-4 text-center">No scheduled lectures</p>
                ) : (
                  <div className="space-y-2.5">
                    {daySlots.sort((a, b) => (a.period_number || 0) - (b.period_number || 0)).map((s, idx) => (
                      <div key={s.id || idx} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-500 font-medium text-[10px]">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            <span>{s.start_time} - {s.end_time}</span>
                          </div>
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-[9px]">
                            Period #{s.period_number || idx + 1}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 mb-1">
                            <span className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-700 font-mono font-black text-[10px] rounded border border-indigo-200">
                              {s.subject_code || 'CS701'}
                            </span>
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 font-bold text-[9px] rounded">
                              Sem {s.semester} &bull; Sec {s.section}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 leading-tight">{s.subject_name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{s.branch}</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="truncate font-semibold">{s.faculty_name}</span>
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">{s.room_number}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </PageContainer>
  );
}
