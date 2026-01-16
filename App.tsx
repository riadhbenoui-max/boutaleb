
import React, { useState, useEffect } from 'react';
import { User, Student, AttendanceRecord, ClassRoom, ScheduleItem } from './types';
import { MOCK_TEACHERS, MOCK_STUDENTS, MOCK_CLASSES } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AttendanceTracker from './components/AttendanceTracker';
import StudentManagement from './components/StudentManagement';
import TeacherManagement from './components/TeacherManagement';
import ScheduleManagement from './components/ScheduleManagement';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App State
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
      <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
             <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
             </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">نظام غيابات الثانوي</h1>
          <p className="text-gray-500 mb-8">نظام تسيير وإدارة حضور التلاميذ والأساتذة</p>
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('ADMIN')}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-200"
            >
              الدخول كمدير المؤسسة
            </button>
            <button 
              onClick={() => handleLogin('TEACHER')}
              className="w-full py-4 px-6 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-all"
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
      case 'dashboard': return <Dashboard attendance={attendance} students={students} teachers={teachers} classes={classes} />;
      case 'attendance': return <AttendanceTracker attendance={attendance} setAttendance={setAttendance} students={students} classes={classes} currentUser={currentUser} />;
      case 'students': return <StudentManagement students={students} setStudents={setStudents} classes={classes} isAdmin={currentUser.role === 'ADMIN'} />;
      case 'teachers': return <TeacherManagement teachers={teachers} setTeachers={setTeachers} schedule={schedule} setSchedule={setSchedule} isAdmin={currentUser.role === 'ADMIN'} />;
      case 'schedule': return <ScheduleManagement schedule={schedule} setSchedule={setSchedule} classes={classes} teachers={teachers} isAdmin={currentUser.role === 'ADMIN'} />;
      default: return <Dashboard attendance={attendance} students={students} teachers={teachers} classes={classes} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        logout={logout}
      />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
           <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === 'dashboard' && 'لوحة التحكم'}
                {activeTab === 'attendance' && 'تسجيل الغيابات'}
                {activeTab === 'students' && 'إدارة التلاميذ'}
                {activeTab === 'teachers' && 'إدارة الأساتذة'}
                {activeTab === 'schedule' && 'توزيع الحصص'}
              </h2>
              <p className="text-gray-500 text-sm">مرحباً بك، {currentUser.name}</p>
           </div>
           <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
              {new Date().toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
