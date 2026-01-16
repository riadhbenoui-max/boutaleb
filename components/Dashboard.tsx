import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, Student, User, ClassRoom } from '../types';
import { getAttendanceInsights } from '../services/geminiService';

interface DashboardProps {
  attendance: AttendanceRecord[];
  students: Student[];
  teachers: User[];
  classes: ClassRoom[];
}

const Dashboard: React.FC<DashboardProps> = ({ attendance, students, teachers, classes }) => {
  const [insights, setInsights] = useState<string>('جاري تحليل البيانات بواسطة الذكاء الاصطناعي...');

  useEffect(() => {
    const fetchInsights = async () => {
      if (attendance.length === 0) {
        setInsights('لا توجد بيانات غياب كافية للتحليل حالياً.');
        return;
      }
      const text = await getAttendanceInsights(attendance);
      setInsights(text || 'تعذر الحصول على تحليلات الذكاء الاصطناعي حالياً.');
    };
    fetchInsights();
  }, [attendance]);

  const stats = useMemo(() => {
    const absentRecords = attendance.filter(a => a.status === 'ABSENT');
    const lateRecords = attendance.filter(a => a.status === 'LATE');

    const uniqueAbsences = new Set<string>(absentRecords.map(a => `${a.studentId}-${a.date}`));
    const uniqueLates = new Set<string>(lateRecords.map(a => `${a.studentId}-${a.date}`));

    const classAbsences = classes.map(cls => {
      const classStudents = students.filter(s => s.classId === cls.id).map(s => s.id);
      const absCount = Array.from(uniqueAbsences).filter((key: string) => {
        const studentId = key.split('-')[0];
        return classStudents.includes(studentId);
      }).length;
      return { id: cls.id, name: cls.name, count: absCount };
    }).sort((a, b) => b.count - a.count);

    const uniqueDates = Array.from(new Set(attendance.map(a => a.date))).sort();
    const totalPossibleStudentDays = students.length * (uniqueDates.length || 1);
    const attendanceRate = totalPossibleStudentDays > 0 
      ? (100 - (uniqueAbsences.size / totalPossibleStudentDays * 100)).toFixed(1) 
      : '100';

    // حساب الغيابات المتتالية لكل تلميذ
    const consecutiveAbsenceAlerts = students.map(student => {
      const studentRecords = attendance.filter(a => a.studentId === student.id);
      const studentDates = Array.from(new Set(studentRecords.map(r => r.date))).sort().reverse();
      
      let streak = 0;
      for (const date of studentDates) {
        const isAbsentOnThatDay = studentRecords.some(r => r.date === date && r.status === 'ABSENT');
        const isPresentOnThatDay = studentRecords.some(r => r.date === date && (r.status === 'PRESENT' || r.status === 'LATE'));
        
        if (isAbsentOnThatDay && !isPresentOnThatDay) {
          streak++;
        } else if (isPresentOnThatDay) {
          break; // انقطع التسلسل بحضور أو تأخر
        }
      }

      return {
        id: student.id,
        name: `${student.lastName} ${student.firstName}`,
        className: classes.find(c => c.id === student.classId)?.name || 'غير معروف',
        streak
      };
    }).filter(alert => alert.streak >= 3).sort((a, b) => b.streak - a.streak);

    return {
      totalAbsences: uniqueAbsences.size,
      totalLates: uniqueLates.size,
      attendanceRate,
      topAbsentClasses: classAbsences.slice(0, 3),
      consecutiveAbsenceAlerts
    };
  }, [attendance, students, classes]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي التلاميذ" value={students.length} icon="👨‍🎓" color="blue" />
        <StatCard title="غيابات (أيام/تلميذ)" value={stats.totalAbsences} icon="❌" color="red" />
        <StatCard title="تأخرات (أيام/تلميذ)" value={stats.totalLates} icon="🕒" color="orange" />
        <StatCard title="نسبة الحضور" value={`${stats.attendanceRate}%`} icon="📈" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الذكاء الاصطناعي والأقسام */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <span className="ml-2">🤖</span> تحليلات الذكاء الاصطناعي
            </h3>
            <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg text-blue-900 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {insights}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold flex items-center gap-2 text-red-600">
                 <span>⚠️</span> إنذارات الغياب المتكرر
               </h3>
               <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full">3 أيام متتالية أو أكثر</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.consecutiveAbsenceAlerts.length === 0 ? (
                <div className="col-span-full py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                  لا توجد إنذارات حالياً. جميع التلاميذ في وضعية سليمة.
                </div>
              ) : (
                stats.consecutiveAbsenceAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                    <div>
                      <h4 className="font-bold text-gray-800">{alert.name}</h4>
                      <p className="text-xs text-gray-500">{alert.className}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-red-600">{alert.streak}</div>
                      <div className="text-[10px] font-bold text-red-400 uppercase">أيام متتالية</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {stats.consecutiveAbsenceAlerts.length > 0 && (
              <p className="mt-4 text-xs text-gray-400 italic text-center">
                * يرجى الاتصال بأولياء أمور هؤلاء التلاميذ لتبرير الغياب.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-xl font-bold mb-6">الأقسام الأكثر غياباً</h3>
          <div className="space-y-6">
            {stats.topAbsentClasses.length === 0 ? (
              <p className="text-gray-400 text-center py-10">لا توجد سجلات غياب بعد</p>
            ) : (
              stats.topAbsentClasses.map((cls) => (
                <div key={cls.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-700">{cls.name}</span>
                    <span className="text-red-600">{cls.count} يوم غياب</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-l from-red-500 to-orange-400 transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (cls.count / (stats.totalAbsences || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-[11px] text-gray-500 leading-tight">
              يتم احتساب الغياب مرة واحدة في اليوم للتلميذ حتى لو غاب في جميع الحصص السبعة (القاعدة الرسمية للإحصاء).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    red: 'bg-red-100 text-red-600 border-red-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    green: 'bg-green-100 text-green-600 border-green-200',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-lg group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1 font-semibold">{title}</p>
          <h4 className="text-3xl font-bold text-gray-800">{value}</h4>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border transition-transform group-hover:scale-110 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;