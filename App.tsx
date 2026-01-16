
import React, { useState } from 'react';
import { User, Student, AttendanceRecord, ClassRoom, ScheduleItem } from './types';
import { MOCK_TEACHERS, MOCK_STUDENTS, MOCK_CLASSES } from './constants';
import Dashboard from './components/Dashboard';
import AttendanceTracker from './components/AttendanceTracker';
import StudentManagement from './components/StudentManagement';
import TeacherManagement from './components/TeacherManagement';
import ScheduleManagement from './components/ScheduleManagement';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [teachers, setTeachers] = useState<User[]>(MOCK_TEACHERS);
  const [classes, setClasses] = useState<ClassRoom[]>(MOCK_CLASSES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const handleLogin = (role: 'ADMIN' | 'TEACHER') => {
    if (role === 'ADMIN') {
      setCurrentUser({ id: 'admin-1', name: 'المدير العام', role: 'ADMIN' });
      setActiveTab('dashboard');
    } else {
      setCurrentUser(MOCK_TEACHERS[0]);
      setActiveTab('attendance');
    }
  };

  const logout = () => setCurrentUser(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F3F6] p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center border border-white/50">
          <div className="mb-8 flex justify-center">
             <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
             </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">نظام غيابات الثانوي</h1>
          <p className="text-gray-400 mb-10">إدارة ذكية ومستدامة للحضور المدرسي</p>
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('ADMIN')}
              className="w-full py-4 px-6 bg-[#1A4B9E] hover:bg-[#153a7a] text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
            >
              الدخول كمدير المؤسسة
            </button>
            <button 
              onClick={() => handleLogin('TEACHER')}
              className="w-full py-4 px-6 bg-white border-2 border-[#1A4B9E] text-[#1A4B9E] hover:bg-blue-50 font-bold rounded-2xl transition-all active:scale-95"
            >
              الدخول كأستاذ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard attendance={attendance} students={students} teachers={teachers} classes={classes} setActiveTab={setActiveTab} />;
      case 'attendance': return <AttendanceTracker attendance={attendance} setAttendance={setAttendance} students={students} classes={classes} currentUser={currentUser} />;
      case 'students': return <StudentManagement students={students} setStudents={setStudents} classes={classes} isAdmin={currentUser.role === 'ADMIN'} />;
      case 'teachers': return <TeacherManagement teachers={teachers} setTeachers={setTeachers} schedule={schedule} setSchedule={setSchedule} isAdmin={currentUser.role === 'ADMIN'} />;
      case 'schedule': return <ScheduleManagement schedule={schedule} setSchedule={setSchedule} classes={classes} teachers={teachers} isAdmin={currentUser.role === 'ADMIN'} />;
      default: return <Dashboard attendance={attendance} students={students} teachers={teachers} classes={classes} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-10">
      <header className="max-w-7xl mx-auto pt-6 px-4">
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] shadow-sm border border-white p-2 flex items-center justify-between">
          <nav className="flex items-center gap-1">
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="لوحة التحكم" />
            <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} label="تسجيل الغياب" />
            {currentUser.role === 'ADMIN' && (
              <>
                <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} label="التلاميذ" />
                <TabButton active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} label="الأساتذة" />
                <TabButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} label="التوزيع الزمني" />
              </>
            )}
          </nav>
          <div className="flex items-center gap-4 px-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{currentUser.role === 'ADMIN' ? 'المدير' : 'أستاذ'}</p>
            </div>
            <button onClick={logout} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto mt-8 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all ${
      active ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
    }`}
  >
    {label}
  </button>
);

export default App;
