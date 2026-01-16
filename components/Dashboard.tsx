
import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, Student, User, ClassRoom } from '../types';
import { getAttendanceInsights } from '../services/geminiService';

interface DashboardProps {
  attendance: AttendanceRecord[];
  students: Student[];
  teachers: User[];
  classes: ClassRoom[];
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ attendance, students, teachers, classes, setActiveTab }) => {
  const [insights, setInsights] = useState<string>('جاري تحليل البيانات بواسطة Gemini AI...');

  useEffect(() => {
    const fetchInsights = async () => {
      if (attendance.length === 0) {
        setInsights('أهلاً بك في نظام الغيابات. ابدأ بتسجيل حضور الحصص لتظهر لك التحليلات الذكية هنا.');
        return;
      }
      const text = await getAttendanceInsights(attendance);
      setInsights(text || 'تعذر الحصول على تحليلات الذكاء الاصطناعي حالياً.');
    };
    fetchInsights();
  }, [attendance]);

  const stats = useMemo(() => {
    const absentRecords = attendance.filter(a => a.status === 'ABSENT');
    const uniqueAbsences = new Set<string>(absentRecords.map(a => `${a.studentId}-${a.date}`));
    
    const uniqueDates = Array.from(new Set(attendance.map(a => a.date))).length || 1;
    const totalPossibleDays = students.length * uniqueDates;
    const attendanceRate = totalPossibleDays > 0 
      ? (100 - (uniqueAbsences.size / totalPossibleDays * 100)).toFixed(1) 
      : '100';

    const consecutiveAbsences = students.map(student => {
      const studentRecords = attendance.filter(a => a.studentId === student.id);
      const dates = Array.from(new Set(studentRecords.map(r => r.date))).sort().reverse();
      let streak = 0;
      for (const d of dates) {
        if (studentRecords.some(r => r.date === d && r.status === 'ABSENT')) streak++;
        else break;
      }
      return { ...student, streak };
    }).filter(s => s.streak >= 2).slice(0, 4);

    const classStats = classes.map(c => {
      const studentCount = students.filter(s => s.classId === c.id).length;
      return { name: c.name, count: studentCount };
    }).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      totalAbsences: uniqueAbsences.size,
      totalLates: attendance.filter(a => a.status === 'LATE').length,
      attendanceRate,
      consecutiveAbsences,
      classStats
    };
  }, [attendance, students, classes]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="نسبة الحضور" 
          value={`${stats.attendanceRate}%`} 
          subtitle="نسبة الحضور المسجلة" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="أيام الغياب" 
          value={stats.totalAbsences} 
          subtitle="إجمالي الغيابات الكلية" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>}
        />
        <StatCard 
          title="تأخرات مسجلة" 
          value={stats.totalLates} 
          subtitle="عدد حالات التأخر" 
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Main Content Grid */}
      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-white/50">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Alerts */}
          <div className="lg:col-span-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
               المتغيبون الآن باستمرار
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {stats.consecutiveAbsences.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-3xl text-center text-gray-400 text-sm border border-dashed">
                  لا يوجد إنذارات غياب متكرر حالياً.
                </div>
              ) : (
                stats.consecutiveAbsences.map(student => (
                  <div key={student.id} className="bg-white border border-orange-100 p-4 rounded-3xl flex items-center justify-between shadow-sm transition hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{student.lastName} {student.firstName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{student.streak} أيام متتالية</p>
                      </div>
                    </div>
                    <div className="text-orange-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Middle Column: Chart & Distribution */}
          <div className="lg:col-span-5 border-r border-gray-100 pr-0 lg:pr-10">
             <h3 className="text-xl font-bold text-gray-800 mb-6">توزيع الحضور حسب المواد</h3>
             <div className="flex flex-col items-center">
                {/* Simulated Doughnut Chart as per image */}
                <div className="relative w-48 h-48 mb-10">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#E2E8F0" strokeWidth="4"></circle>
                      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#1A4B9E" strokeWidth="4" strokeDasharray="65 100"></circle>
                      <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#FB923C" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-65"></circle>
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-2xl font-black text-gray-800 leading-none">84.5%</p>
                      <p className="text-[10px] text-gray-400 font-bold">المعدل العام</p>
                   </div>
                </div>

                <div className="w-full space-y-4">
                  {stats.classStats.map((cs, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-bold">{cs.name}</span>
                      <div className="flex-1 mx-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1A4B9E]" style={{ width: `${60 + i * 5}%` }}></div>
                      </div>
                      <span className="font-bold text-gray-800">{cs.count}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* Right Column: Actions & AI */}
          <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <ActionButton 
                label="الغياب الفني والمبرر" 
                primary 
                onClick={() => setActiveTab('attendance')} 
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 00-2-2v-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
              />
              <ActionButton 
                label="استيراد Excel" 
                onClick={() => setActiveTab('students')}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              />
              <ActionButton 
                label="السجل التاريخي للغياب" 
                outlined
                onClick={() => setActiveTab('dashboard')}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>
            
            <div className="p-5 bg-[#F8FAFC] rounded-3xl border border-gray-100 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-full -mr-10 -mt-10 blur-2xl"></div>
               <p className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">توصية الذكاء الاصطناعي</p>
               <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                 {insights}
               </p>
               <div className="mt-4 flex items-center gap-2">
                 <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                    <span className="text-[10px]">🤖</span>
                 </div>
                 <span className="text-[10px] font-bold text-gray-400">Gemini AI Engine</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon }: any) => (
  <div className="bg-white p-8 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-[#1A4B9E] transition-all group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">{title}</p>
        <h4 className="text-4xl font-black text-gray-800 mb-1">{value}</h4>
        <p className="text-[11px] font-bold text-gray-400">{subtitle}</p>
      </div>
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-[#1A4B9E] transition-colors">
        {icon}
      </div>
    </div>
  </div>
);

const ActionButton = ({ label, primary, outlined, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all active:scale-95 ${
      primary 
      ? 'bg-[#1A4B9E] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-800' 
      : outlined 
      ? 'border-2 border-[#1A4B9E] text-[#1A4B9E] hover:bg-blue-50' 
      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default Dashboard;
