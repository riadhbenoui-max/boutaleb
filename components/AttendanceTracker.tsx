
import React, { useState } from 'react';
import { Student, AttendanceRecord, ClassRoom, Session, User } from '../types';
import { SESSIONS, DAYS_OF_WEEK } from '../constants';

interface AttendanceTrackerProps {
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  students: Student[];
  classes: ClassRoom[];
  currentUser: User;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ attendance, setAttendance, students, classes, currentUser }) => {
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState<number>(1);

  const filteredStudents = students.filter(s => s.classId === selectedClass);

  const handleStatusChange = (studentId: string, status: 'ABSENT' | 'PRESENT' | 'LATE') => {
    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => 
        a.studentId === studentId && 
        a.date === selectedDate && 
        a.sessionId === selectedSession
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status };
        return updated;
      }

      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        date: selectedDate,
        sessionId: selectedSession,
        status,
        markedBy: currentUser.id
      };
      return [...prev, newRecord];
    });
  };

  const getStatus = (studentId: string) => {
    return attendance.find(a => 
      a.studentId === studentId && 
      a.date === selectedDate && 
      a.sessionId === selectedSession
    )?.status || 'PRESENT';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
      <div className="flex flex-wrap gap-4 items-end border-b pb-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-2">اختر القسم</label>
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
          >
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-2">التاريخ</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-bold text-gray-700 mb-2">الحصة</label>
          <select 
            value={selectedSession} 
            onChange={(e) => setSelectedSession(Number(e.target.value))}
            className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none"
          >
            {SESSIONS.map(s => <option key={s.id} value={s.id}>{s.time} ({s.isMorning ? 'صباحاً' : 'مساءً'})</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
              <th className="p-4 border-b">الاسم واللقب</th>
              <th className="p-4 border-b">تاريخ الميلاد</th>
              <th className="p-4 border-b text-center">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-400">لا يوجد تلاميذ في هذا القسم</td></tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-bold">{student.firstName} {student.lastName}</td>
                  <td className="p-4 text-gray-500">{student.birthDate}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition ${getStatus(student.id) === 'PRESENT' ? 'bg-green-600 text-white shadow-md' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        حاضر
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition ${getStatus(student.id) === 'ABSENT' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                      >
                        غائب
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition ${getStatus(student.id) === 'LATE' ? 'bg-orange-600 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                      >
                        متأخر
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTracker;
