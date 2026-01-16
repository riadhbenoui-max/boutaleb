
import React, { useState, useMemo, useRef } from 'react';
import { Student, ClassRoom } from '../types';
import * as XLSX from 'xlsx';

interface StudentManagementProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  classes: ClassRoom[];
  isAdmin: boolean;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, setStudents, classes, isAdmin }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMultiDeleteModal, setShowMultiDeleteModal] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ 
    firstName: '', 
    lastName: '', 
    birthDate: '', 
    gender: 'أ', 
    birthPlace: '', 
    guardianName: '', 
    address: '',
    classId: '' 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    let list = students.filter(s => s.classId === selectedClassId);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.firstName.toLowerCase().includes(term) || 
        s.lastName.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term)
      );
    }
    return list;
  }, [students, selectedClassId, searchTerm]);

  const selectedStudentsData = useMemo(() => {
    return students.filter(s => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  const currentClass = classes.find(c => c.id === selectedClassId);

  const handleAddStudent = () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.classId) return;
    const student: Student = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: newStudent.firstName!,
      lastName: newStudent.lastName!,
      birthDate: newStudent.birthDate || '',
      gender: newStudent.gender,
      birthPlace: newStudent.birthPlace,
      guardianName: newStudent.guardianName,
      address: newStudent.address,
      classId: newStudent.classId!
    };
    setStudents(prev => [...prev, student]);
    setShowAddModal(false);
    setNewStudent({ firstName: '', lastName: '', birthDate: '', gender: 'أ', birthPlace: '', guardianName: '', address: '', classId: '' });
  };

  const handleDownloadModel = () => {
    const wb = XLSX.utils.book_new();
    const schoolYear = "2025/2026";

    classes.forEach((cls) => {
      const className = cls.name;
      const data = [
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["ثانوية بوطالب محمد", "", "", "", "السنة الدراسية " + schoolYear, "", "", "", ""],
        ["السوقر", "", "", "", "", "", "", "", ""],
        ["", "", "", "", className, "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["الرقم", "اللقب", "الاسم", "الجنس", "تاريخ الميلاد", "مكان الميلاد", "ق م", "اسم الولي", "العنوان"],
        ["1", "اللقب هنا", "الاسم هنا", "أ/ذ", "YYYY/MM/DD", "مكان الميلاد", "", "اسم الولي", "العنوان بالتفصيل"]
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const safeSheetName = className.substring(0, 31).replace(/[\\*?\/\[\]]/g, '');
      XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
    });

    XLSX.writeFile(wb, `نموذج_شامل_لقوائم_تلاميذ_الثانوية.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      let allImportedStudents: Student[] = [];

      wb.SheetNames.forEach(sheetName => {
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        const classNameInSheet = data[4] ? String(data[4][4] || '').trim() : '';
        const targetClass = classes.find(c => c.name === classNameInSheet || c.name === sheetName);
        
        if (targetClass) {
          const dataRows = data.slice(8);
          const sheetStudents: Student[] = dataRows
            .filter(row => row && row[1] && row[2] && String(row[1]).trim() !== 'اللقب هنا') 
            .map(row => ({
              id: Math.random().toString(36).substr(2, 9),
              lastName: String(row[1] || '').trim(),
              firstName: String(row[2] || '').trim(),
              gender: String(row[3] || '').trim(),
              birthDate: String(row[4] || '').trim().replace(/\//g, '-'),
              birthPlace: String(row[5] || '').trim(),
              guardianName: String(row[7] || '').trim(),
              address: String(row[8] || '').trim(),
              classId: targetClass.id
            }));
          allImportedStudents = [...allImportedStudents, ...sheetStudents];
        }
      });

      if (allImportedStudents.length > 0) {
        setStudents(prev => [...prev, ...allImportedStudents]);
        alert(`تم استيراد ${allImportedStudents.length} تلميذ بنجاح.`);
      } else {
        alert("لم يتم العثور على بيانات صالحة.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteStudent = (id: string) => {
    if (!isAdmin) return;
    const student = students.find(s => s.id === id);
    if (confirm(`هل أنت متأكد من حذف التلميذ "${student?.lastName} ${student?.firstName}"؟`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setSelectedStudentIds(prev => prev.filter(sid => sid !== id));
    }
  };

  const confirmMultiDelete = () => {
    setStudents(prev => prev.filter(s => !selectedStudentIds.includes(s.id)));
    setSelectedStudentIds([]);
    setShowMultiDeleteModal(false);
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>🏫</span> الأقسام ({classes.length})
          </h4>
          <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {classes.map(cls => {
              const count = students.filter(s => s.classId === cls.id).length;
              return (
                <button
                  key={cls.id}
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    setSelectedStudentIds([]);
                    setSearchTerm(''); 
                  }}
                  className={`w-full text-right px-4 py-3 rounded-xl transition-all flex justify-between items-center group ${
                    selectedClassId === cls.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                    : 'bg-transparent text-gray-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="font-semibold text-sm">{cls.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedClassId === cls.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-2xl font-bold">
                 {currentClass?.name.charAt(0)}
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-gray-800">{currentClass?.name}</h3>
                  <p className="text-gray-400 text-sm font-semibold italic">ثانوية بوطالب محمد - السوقر</p>
               </div>
            </div>
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleDownloadModel}
                  className="bg-green-50 text-green-700 px-4 py-2.5 rounded-xl font-bold hover:bg-green-100 transition text-sm flex items-center gap-2 border border-green-200"
                >
                  <span>📊</span> تحميل النموذج
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition text-sm shadow-md flex items-center gap-2"
                >
                  <span>📥</span> استيراد إكسيل
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition text-sm"
                >
                  + إضافة يدوي
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="بحث عن تلميذ بالاسم أو اللقب أو المعرف..."
                className="block w-full pr-10 pl-3 py-3 bg-gray-50 border border-gray-200 rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isAdmin && filteredStudents.length > 0 && (
            <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
               <div className="flex items-center gap-3">
                 <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={toggleSelectAll}
                 />
                 <span className="text-sm font-bold text-gray-600">
                   {selectedStudentIds.length > 0 ? `تم تحديد ${selectedStudentIds.length} تلميذ` : 'تحديد الكل'}
                 </span>
               </div>
               <div className="flex gap-2">
                 {selectedStudentIds.length > 0 && (
                    <button 
                      onClick={() => setShowMultiDeleteModal(true)}
                      className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-600 hover:text-white transition"
                    >
                      حذف المحدد
                    </button>
                 )}
               </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs font-bold border-b">
                  {isAdmin && <th className="p-4 w-10"></th>}
                  <th className="p-4 w-12 text-center">الرقم</th>
                  <th className="p-4">اللقب</th>
                  <th className="p-4">الاسم</th>
                  <th className="p-4 text-center">الجنس</th>
                  <th className="p-4">تاريخ الميلاد</th>
                  <th className="p-4">مكان الميلاد</th>
                  <th className="p-4">اسم الولي</th>
                  <th className="p-4">العنوان</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 10 : 9} className="p-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-2">🔍</span>
                        <p>{searchTerm ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد بيانات لهذا القسم.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => (
                    <tr key={student.id} className={`hover:bg-blue-50/20 transition-colors ${selectedStudentIds.includes(student.id) ? 'bg-blue-50/50' : ''}`}>
                      {isAdmin && (
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => toggleSelectStudent(student.id)}
                          />
                        </td>
                      )}
                      <td className="p-4 text-gray-400 text-center text-sm font-bold">{idx + 1}</td>
                      <td className="p-4 font-bold text-gray-800">{student.lastName}</td>
                      <td className="p-4 font-bold text-gray-800">{student.firstName}</td>
                      <td className="p-4 text-center text-xs font-bold">
                        <span className={`px-2 py-1 rounded ${student.gender === 'أ' || student.gender === 'أنثى' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                          {student.gender?.charAt(0) || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm whitespace-nowrap">{student.birthDate}</td>
                      <td className="p-4 text-gray-600 text-sm">{student.birthPlace || '-'}</td>
                      <td className="p-4 text-gray-600 text-sm">{student.guardianName || '-'}</td>
                      <td className="p-4 text-gray-500 text-xs truncate max-w-[150px]">{student.address || '-'}</td>
                      <td className="p-4 text-center">
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteStudent(student.id)} 
                            className="text-red-300 hover:text-red-600 p-1 transition"
                            title="حذف"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Multi-Delete Confirmation Modal */}
      {showMultiDeleteModal && (
        <div className="fixed inset-0 bg-red-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl scale-in-center border-t-8 border-red-500">
            <h4 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <span>⚠️</span> تأكيد حذف جماعي
            </h4>
            <p className="text-gray-600 mb-6 font-semibold">
              أنت على وشك حذف <span className="text-red-600 font-bold">{selectedStudentIds.length}</span> تلاميذ من قاعدة البيانات. هذه العملية لا يمكن التراجع عنها.
            </p>
            
            <div className="max-h-48 overflow-y-auto mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
               <p className="text-xs font-bold text-gray-400 mb-2 uppercase">قائمة التلاميذ المحددين:</p>
               <ul className="space-y-1">
                 {selectedStudentsData.map(s => (
                   <li key={s.id} className="text-sm text-gray-700 font-bold flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                     {s.lastName} {s.firstName}
                   </li>
                 ))}
               </ul>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={confirmMultiDelete}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition active:scale-95"
              >
                نعم، احذف المحددين
              </button>
              <button 
                onClick={() => setShowMultiDeleteModal(false)}
                className="px-8 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl shadow-2xl scale-in-center">
            <h4 className="text-2xl font-bold mb-6">إضافة تلميذ جديد</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="اللقب" className="p-3 bg-gray-50 rounded-xl" value={newStudent.lastName} onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} />
              <input type="text" placeholder="الاسم" className="p-3 bg-gray-50 rounded-xl" value={newStudent.firstName} onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} />
              <select className="p-3 bg-gray-50 rounded-xl" value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})}>
                <option value="أ">أنثى (أ)</option>
                <option value="ذ">ذكر (ذ)</option>
              </select>
              <input type="date" className="p-3 bg-gray-50 rounded-xl" value={newStudent.birthDate} onChange={e => setNewStudent({...newStudent, birthDate: e.target.value})} />
              <input type="text" placeholder="مكان الميلاد" className="p-3 bg-gray-50 rounded-xl" value={newStudent.birthPlace} onChange={e => setNewStudent({...newStudent, birthPlace: e.target.value})} />
              <input type="text" placeholder="اسم الولي" className="p-3 bg-gray-50 rounded-xl" value={newStudent.guardianName} onChange={e => setNewStudent({...newStudent, guardianName: e.target.value})} />
              <input type="text" placeholder="العنوان" className="md:col-span-2 p-3 bg-gray-50 rounded-xl" value={newStudent.address} onChange={e => setNewStudent({...newStudent, address: e.target.value})} />
              <select className="p-3 bg-gray-50 rounded-xl" value={newStudent.classId} onChange={e => setNewStudent({...newStudent, classId: e.target.value})}>
                <option value="">-- اختر القسم --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-8 border-t mt-6">
              <button onClick={handleAddStudent} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold">حفظ</button>
              <button onClick={() => setShowAddModal(false)} className="px-6 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
