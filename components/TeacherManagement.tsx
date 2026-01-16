
import React, { useState } from 'react';
import { User, ScheduleItem } from '../types';
import { SUBJECTS } from '../constants';

interface TeacherManagementProps {
  teachers: User[];
  setTeachers: React.Dispatch<React.SetStateAction<User[]>>;
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  isAdmin: boolean;
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ teachers, setTeachers, schedule, setSchedule, isAdmin }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [newTeacher, setNewTeacher] = useState({ name: '', subject: SUBJECTS[0] });
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  const handleAdd = () => {
    if (!newTeacher.name) return;
    const teacher: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTeacher.name,
      role: 'TEACHER',
      subject: newTeacher.subject
    };
    setTeachers(prev => [...prev, teacher]);
    setShowAddModal(false);
    setNewTeacher({ name: '', subject: SUBJECTS[0] });
  };

  const handleUpdate = () => {
    if (!editingTeacher || !editingTeacher.name) return;
    setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? editingTeacher : t));
    setEditingTeacher(null);
  };

  const getAssignedSessionsCount = (teacherId: string) => {
    return schedule.filter(item => item.teacherId === teacherId).length;
  };

  const deleteTeachersAction = (ids: string[]) => {
    setTeachers(prev => prev.filter(t => !ids.includes(t.id)));
    setSchedule(prev => prev.filter(item => !ids.includes(item.teacherId)));
    setSelectedTeacherIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const handleDeleteIndividual = (id: string) => {
    if (!isAdmin) return;
    const sessionsCount = getAssignedSessionsCount(id);
    const teacher = teachers.find(t => t.id === id);
    
    let message = `هل أنت متأكد من حذف الأستاذ "${teacher?.name}" نهائياً؟`;
    if (sessionsCount > 0) {
      message = `تحذير: الأستاذ "${teacher?.name}" لديه ${sessionsCount} حصة في الجدول الزمني. سيتم تفريغ هذه الحصص تلقائياً عند حذفه. هل تريد المتابعة؟`;
    }

    if (confirm(message)) {
      deleteTeachersAction([id]);
    }
  };

  const handleDeleteSelected = () => {
    if (!isAdmin || selectedTeacherIds.length === 0) return;
    
    const affectedSessions = schedule.filter(item => selectedTeacherIds.includes(item.teacherId)).length;
    let message = `هل أنت متأكد من حذف ${selectedTeacherIds.length} أساتذة؟`;
    
    if (affectedSessions > 0) {
      message = `تحذير: الأساتذة المحددون لديهم إجمالي ${affectedSessions} حصة مبرمجة. سيتم حذف الحصص مع الأساتذة. هل أنت متأكد؟`;
    }

    if (confirm(message)) {
      deleteTeachersAction(selectedTeacherIds);
    }
  };

  const toggleSelectTeacher = (id: string) => {
    setSelectedTeacherIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTeacherIds.length === teachers.length) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(teachers.map(t => t.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">إدارة هيئة التدريس</h3>
            <p className="text-gray-500 text-sm">إدارة حسابات الأساتذة وتوزيع المهام</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && selectedTeacherIds.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition shadow-sm flex items-center gap-2"
              >
                <span>🗑️</span> حذف المحددين ({selectedTeacherIds.length})
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2"
              >
                <span>➕</span> أستاذ جديد
              </button>
            )}
          </div>
        </div>

        {isAdmin && teachers.length > 0 && (
          <div className="mb-4 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer" 
              checked={selectedTeacherIds.length === teachers.length && teachers.length > 0}
              onChange={toggleSelectAll}
            />
            <span className="text-sm font-bold text-gray-600">تحديد الكل</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-400 border-2 border-dashed rounded-3xl">
               <span className="text-5xl block mb-3">👨‍🏫</span>
               <p className="text-lg">لا يوجد أساتذة مسجلين حالياً</p>
            </div>
          ) : (
            teachers.map(teacher => {
              const sessionsCount = getAssignedSessionsCount(teacher.id);
              const isSelected = selectedTeacherIds.includes(teacher.id);
              
              return (
                <div 
                  key={teacher.id} 
                  className={`group relative border p-6 rounded-3xl flex items-center space-x-4 space-x-reverse transition-all bg-white ${
                    isSelected ? 'border-blue-500 shadow-md ring-2 ring-blue-50' : 'border-gray-100 hover:shadow-xl hover:border-blue-100'
                  }`}
                >
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-10">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelectTeacher(teacher.id)}
                      />
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600'
                  }`}>
                     {teacher.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-gray-800 text-lg truncate" title={teacher.name}>{teacher.name}</h4>
                    <p className="text-sm text-blue-600 font-semibold mb-2">{teacher.subject}</p>
                    
                    <div className="flex flex-wrap gap-2">
                       {sessionsCount > 0 ? (
                         <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold border border-orange-100">
                           {sessionsCount} حصص مبرمجة
                         </span>
                       ) : (
                         <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full font-bold border border-gray-100">
                           غير مكلف بجدول
                         </span>
                       )}
                       <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold border border-green-100">نشط</span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => setEditingTeacher(teacher)}
                        className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="تعديل بيانات الأستاذ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteIndividual(teacher.id)}
                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="حذف الأستاذ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
           <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl scale-in-center">
              <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>➕</span> إضافة أستاذ جديد
              </h4>
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">الاسم الكامل</label>
                    <input 
                      type="text" 
                      placeholder="مثال: محمد بوعلام" 
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition font-semibold" 
                      value={newTeacher.name} 
                      onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">المادة التعليمية</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition font-semibold"
                      value={newTeacher.subject}
                      onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})}
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
              <div className="flex gap-3 pt-8 mt-4 border-t">
                 <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition active:scale-95">تأكيد الإضافة</button>
                 <button onClick={() => setShowAddModal(false)} className="px-6 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">إلغاء</button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
           <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl scale-in-center">
              <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>✏️</span> تعديل بيانات الأستاذ
              </h4>
              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">الاسم الكامل</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition font-semibold" 
                      value={editingTeacher.name} 
                      onChange={e => setEditingTeacher({...editingTeacher, name: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">المادة التعليمية</label>
                    <select 
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition font-semibold"
                      value={editingTeacher.subject}
                      onChange={e => setEditingTeacher({...editingTeacher, subject: e.target.value})}
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
              <div className="flex gap-3 pt-8 mt-4 border-t">
                 <button onClick={handleUpdate} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition active:scale-95">حفظ التغييرات</button>
                 <button onClick={() => setEditingTeacher(null)} className="px-6 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition">إلغاء</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
