
import React, { useState } from 'react';
import { ScheduleItem, ClassRoom, User } from '../types';
import { DAYS_OF_WEEK, SESSIONS } from '../constants';

interface ScheduleManagementProps {
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  classes: ClassRoom[];
  teachers: User[];
  isAdmin: boolean;
}

const ScheduleManagement: React.FC<ScheduleManagementProps> = ({ schedule, setSchedule, classes, teachers, isAdmin }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [editingCell, setEditingCell] = useState<{ day: string, sessionId: number } | null>(null);
  
  // Modal State for individual cell editing
  const [tempEdit, setTempEdit] = useState<{ teacherId: string, room: string }>({ teacherId: '', room: '' });

  const getCellItem = (day: string, sessionId: number) => {
    return schedule.find(item => item.classId === selectedClassId && item.day === day && item.sessionId === sessionId);
  };

  const handleOpenEdit = (day: string, sessionId: number) => {
    if (!isAdmin) return;
    const existing = getCellItem(day, sessionId);
    setTempEdit({
      teacherId: existing?.teacherId || '',
      room: existing?.room || ''
    });
    setEditingCell({ day, sessionId });
  };

  const handleSaveCell = () => {
    if (!editingCell) return;

    setSchedule(prev => {
      const filtered = prev.filter(item => 
        !(item.classId === selectedClassId && item.day === editingCell.day && item.sessionId === editingCell.sessionId)
      );

      if (tempEdit.teacherId) {
        const newItem: ScheduleItem = {
          id: Math.random().toString(36).substr(2, 9),
          classId: selectedClassId,
          teacherId: tempEdit.teacherId,
          day: editingCell.day,
          sessionId: editingCell.sessionId,
          room: tempEdit.room || 'قاعة غير محددة'
        };
        return [...filtered, newItem];
      }
      return filtered;
    });

    setEditingCell(null);
  };

  const handleClearCell = () => {
    if (!editingCell) return;
    setSchedule(prev => prev.filter(item => 
      !(item.classId === selectedClassId && item.day === editingCell.day && item.sessionId === editingCell.sessionId)
    ));
    setEditingCell(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
           <div>
              <h3 className="text-2xl font-bold text-gray-800">توزيع الحصص الأسبوعي</h3>
              <p className="text-gray-500 text-sm mt-1">عرض وتعديل الجدول الزمني للأقسام</p>
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-sm font-bold text-gray-600 whitespace-nowrap">القسم:</label>
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full md:w-64 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-inner">
          <table className="w-full text-center border-collapse table-fixed min-w-[1000px]">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="p-5 border-l border-blue-800 w-32 font-bold uppercase tracking-wider">الحصة</th>
                {DAYS_OF_WEEK.map(day => (
                  <th key={day} className="p-5 border-l border-blue-800 font-bold">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {SESSIONS.map(session => (
                <tr key={session.id} className={session.id === 4 ? "bg-orange-50/30" : ""}>
                  <td className="p-4 bg-gray-50 font-bold border-l border-gray-200">
                    <div className="text-blue-900">{session.time}</div>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase">{session.isMorning ? 'الفترة الصباحية' : 'الفترة المسائية'}</div>
                  </td>
                  {DAYS_OF_WEEK.map(day => {
                    const item = getCellItem(day, session.id);
                    const teacher = teachers.find(t => t.id === item?.teacherId);
                    
                    return (
                      <td 
                        key={`${day}-${session.id}`} 
                        onClick={() => handleOpenEdit(day, session.id)}
                        className={`p-3 border-l border-gray-200 transition-all cursor-pointer group relative h-32 ${
                          item ? 'bg-blue-50/40 hover:bg-blue-100/50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {item ? (
                          <div className="flex flex-col h-full justify-center">
                            <div className="text-blue-700 font-bold text-sm leading-tight mb-1">{teacher?.subject}</div>
                            <div className="text-gray-600 text-[11px] font-semibold mb-2">{teacher?.name}</div>
                            <div className="text-[10px] bg-white/80 text-blue-500 font-bold px-2 py-1 rounded-full border border-blue-100 self-center">
                               {item.room}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-300 text-xs italic opacity-0 group-hover:opacity-100 transition-opacity">
                             {isAdmin ? '+ إضافة حصة' : 'فارغ'}
                          </div>
                        )}
                        {isAdmin && (
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-gray-300">✏️</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 flex gap-6 items-center text-xs text-gray-400 font-medium">
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-50 border border-blue-100 rounded"></span>
              <span>حصة مبرمجة</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-white border border-gray-200 rounded"></span>
              <span>توقيت حر</span>
           </div>
           <p className="mr-auto">* انقر على أي خانة في الجدول لتعديل بيانات الحصة.</p>
        </div>
      </div>

      {/* Editing Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[70]">
           <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-in-center">
              <div className="bg-blue-600 p-6 text-white text-center">
                 <h4 className="text-xl font-bold">تعديل حصة {editingCell.day}</h4>
                 <p className="text-blue-100 text-sm mt-1">توقيت الحصة: {SESSIONS.find(s => s.id === editingCell.sessionId)?.time}</p>
              </div>
              <div className="p-8 space-y-5">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">الأستاذ / المادة</label>
                    <select 
                      value={tempEdit.teacherId}
                      onChange={(e) => setTempEdit({...tempEdit, teacherId: e.target.value})}
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition font-semibold"
                    >
                      <option value="">-- اختر الأستاذ --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">رقم القاعة</label>
                    <input 
                      type="text"
                      placeholder="مثال: قاعة 05، مخبر 1"
                      className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition font-semibold"
                      value={tempEdit.room}
                      onChange={(e) => setTempEdit({...tempEdit, room: e.target.value})}
                    />
                 </div>
                 
                 <div className="flex flex-col gap-3 pt-6">
                    <button 
                      onClick={handleSaveCell}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition active:scale-95"
                    >
                      حفظ التغييرات
                    </button>
                    <div className="flex gap-2">
                       <button 
                         onClick={handleClearCell}
                         className="flex-1 bg-red-50 text-red-600 py-3 rounded-2xl font-bold hover:bg-red-100 transition"
                       >
                         تفريغ الحصة
                       </button>
                       <button 
                         onClick={() => setEditingCell(null)}
                         className="px-6 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition"
                       >
                         إلغاء
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;
