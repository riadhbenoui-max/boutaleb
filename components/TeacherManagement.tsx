
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, ids: string[] }>({ show: false, ids: [] });
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

  const executeDeletion = () => {
    const ids = deleteConfirm.ids;
    setTeachers(prev => prev.filter(t => !ids.includes(t.id)));
    setSchedule(prev => prev.filter(item => !ids.includes(item.teacherId)));
    setSelectedTeacherIds(prev => prev.filter(id => !ids.includes(id)));
    setDeleteConfirm({ show: false, ids: [] });
  };

  const handleDeleteIndividual = (id: string) => {
    if (!isAdmin) return;
    setDeleteConfirm({ show: true, ids: [id] });
  };

  const handleDeleteSelected = () => {
    if (!isAdmin || selectedTeacherIds.length === 0) return;
    setDeleteConfirm({ show: true, ids: [...selectedTeacherIds] });
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

  const teachersToDelete = teachers.filter(t => deleteConfirm.ids.includes(t.id));
  const affectedSessions = schedule.filter(item => deleteConfirm.ids.includes(item.teacherId)).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl shadow-inner">
               👨‍🏫
             </div>
             <div>
                <h3 className="text-2xl font-black text-gray-800">هيئة التدريس</h3>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">إدارة حسابات الأساتذة والمواد</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin && selectedTeacherIds.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="bg-red-50 text-red-600 px-6 py-4 rounded-[1.5rem] font-bold hover:bg-red-600 hover:text-white transition shadow-sm flex items-center gap-2 border border-red-100"
              >
                <span>🗑️</span> حذف المحدد ({selectedTeacherIds.length})
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-[#1A4B9E] text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                <span>➕</span> أستاذ جديد
              </button>
            )}
          </div>
        </div>

        {isAdmin && teachers.length > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100">
            <input 
              type="checkbox" 
              className="w-5 h-5 rounded-lg border-gray-300 text-[#1A4B9E] cursor-pointer" 
              checked={selectedTeacherIds.length === teachers.length && teachers.length > 0}
              onChange={toggleSelectAll}
            />
            <span className="text-sm font-black text-gray-600">تحديد الكل ({teachers.length})</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.length === 0 ? (
            <div className="col-span-full p-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-[3rem]">
               <div className="text-6xl mb-4">🔍</div>
               <p className="text-xl font-bold">لا يوجد أساتذة مسجلين حالياً</p>
               <p className="text-sm mt-2 text-gray-300">قم بإضافة الأساتذة لبدء تسيير الغيابات</p>
            </div>
          ) : (
            teachers.map(teacher => {
              const sessionsCount = getAssignedSessionsCount(teacher.id);
              const isSelected = selectedTeacherIds.includes(teacher.id);
              
              return (
                <div 
                  key={teacher.id} 
                  className={`group relative border-2 p-7 rounded-[2.5rem] flex items-center space-x-5 space-x-reverse transition-all duration-300 bg-white ${
                    isSelected ? 'border-[#1A4B9E] shadow-xl bg-blue-50/20' : 'border-gray-50 hover:shadow-2xl hover:border-blue-100'
                  }`}
                >
                  {isAdmin && (
                    <div className="absolute top-6 right-6 z-10">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded-lg border-gray-300 text-[#1A4B9E] cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleSelectTeacher(teacher.id)}
                      />
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-sm transition-all duration-500 ${
                    isSelected ? 'bg-[#1A4B9E] text-white scale-110' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-[#1A4B9E]'
                  }`}>
                     {teacher.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-black text-gray-800 text-lg truncate mb-0.5" title={teacher.name}>{teacher.name}</h4>
                    <p className="text-[11px] text-[#1A4B9E] font-black uppercase tracking-widest mb-3">{teacher.subject}</p>
                    
                    <div className="flex flex-wrap gap-2">
                       {sessionsCount > 0 ? (
                         <span className="text-[10px] bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-bold border border-orange-100">
                           {sessionsCount} حصص مبرمجة
                         </span>
                       ) : (
                         <span className="text-[10px] bg-gray-50 text-gray-300 px-3 py-1 rounded-full font-bold border border-gray-100">
                           بدون جدول
                         </span>
                       )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingTeacher(teacher)}
                        className="p-2.5 text-gray-400 hover:text-[#1A4B9E] hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteIndividual(teacher.id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Custom Deletion Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[99]">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in scale-in-center">
              <div className="bg-red-500 p-8 text-white text-center">
                 <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">⚠️</div>
                 <h4 className="text-2xl font-black">تأكيد الحذف النهائي</h4>
                 <p className="text-red-100 mt-2 font-bold">أنت على وشك حذف بيانات حساسة</p>
              </div>
              <div className="p-10">
                 <p className="text-gray-600 mb-6 font-bold leading-relaxed">
                   هل أنت متأكد من حذف <span className="text-red-600">{deleteConfirm.ids.length}</span> أستاذ(ة)؟ 
                   {affectedSessions > 0 && ` سيتم أيضاً تفريغ ${affectedSessions} حصة من الجداول الزمنية تلقائياً.`}
                 </p>
                 
                 <div className="bg-gray-50 rounded-2xl p-4 mb-8 max-h-32 overflow-y-auto border border-gray-100">
                    <ul className="space-y-2">
                       {teachersToDelete.map(t => (
                         <li key={t.id} className="text-sm font-black text-gray-700 flex items-center gap-2">
                           <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                           {t.name} ({t.subject})
                         </li>
                       ))}
                    </ul>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={executeDeletion}
                      className="flex-1 bg-red-600 text-white py-5 rounded-[1.5rem] font-black shadow-lg shadow-red-200 hover:bg-red-700 transition active:scale-95"
                    >
                      نعم، احذف نهائياً
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm({ show: false, ids: [] })}
                      className="px-8 bg-gray-100 text-gray-500 py-5 rounded-[1.5rem] font-black hover:bg-gray-200 transition"
                    >
                      إلغاء
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1A4B9E]/40 backdrop-blur-md flex items-center justify-center p-4 z-[90]">
           <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl scale-in-center border border-white">
              <h4 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">➕</span> إضافة أستاذ جديد
              </h4>
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">الاسم الكامل</label>
                    <input 
                      type="text" 
                      placeholder="محمد بوعلام" 
                      className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#1A4B9E] rounded-[1.5rem] outline-none transition font-bold" 
                      value={newTeacher.name} 
                      onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">المادة التعليمية</label>
                    <select 
                      className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#1A4B9E] rounded-[1.5rem] outline-none transition font-bold"
                      value={newTeacher.subject}
                      onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})}
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
              <div className="flex gap-3 pt-10 mt-6 border-t border-gray-50">
                 <button onClick={handleAdd} className="flex-1 bg-[#1A4B9E] text-white py-5 rounded-[1.5rem] font-black shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition active:scale-95">تأكيد الإضافة</button>
                 <button onClick={() => setShowAddModal(false)} className="px-8 bg-gray-100 text-gray-500 py-5 rounded-[1.5rem] font-black hover:bg-gray-200 transition">إلغاء</button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 bg-[#1A4B9E]/40 backdrop-blur-md flex items-center justify-center p-4 z-[90]">
           <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl scale-in-center border border-white">
              <h4 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">✏️</span> تعديل بيانات الأستاذ
              </h4>
              <div className="space-y-6">
                 <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">الاسم الكامل</label>
                    <input 
                      type="text" 
                      className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#1A4B9E] rounded-[1.5rem] outline-none transition font-bold" 
                      value={editingTeacher.name} 
                      onChange={e => setEditingTeacher({...editingTeacher, name: e.target.value})} 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">المادة التعليمية</label>
                    <select 
                      className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-[#1A4B9E] rounded-[1.5rem] outline-none transition font-bold"
                      value={editingTeacher.subject}
                      onChange={e => setEditingTeacher({...editingTeacher, subject: e.target.value})}
                    >
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
              <div className="flex gap-3 pt-10 mt-6 border-t border-gray-50">
                 <button onClick={handleUpdate} className="flex-1 bg-[#1A4B9E] text-white py-5 rounded-[1.5rem] font-black shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition active:scale-95">حفظ التغييرات</button>
                 <button onClick={() => setEditingTeacher(null)} className="px-8 bg-gray-100 text-gray-500 py-5 rounded-[1.5rem] font-black hover:bg-gray-200 transition">إلغاء</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
