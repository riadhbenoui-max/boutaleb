
import { Session, ClassRoom, User, Student } from './types';

export const DAYS_OF_WEEK = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];

export const SUBJECTS = [
  "اللغة العربية", 
  "الرياضيات", 
  "العلوم الفيزيائية", 
  "علوم الطبيعة والحياة",
  "اللغة الفرنسية", 
  "اللغة الإنجليزية", 
  "التاريخ والجغرافيا", 
  "العلوم الإسلامية",
  "الفلسفة", 
  "اللغة الأمازيغية", 
  "المعلوماتية",
  "التكنولوجيا (هندسة مدنية)", 
  "التكنولوجيا (هندسة ميكانيكية)", 
  "التكنولوجيا (هندسة كهربائية)", 
  "التكنولوجيا (هندسة الطرائق)",
  "التسيير المحاسبي والمالي", 
  "الاقتصاد والمانجمنت", 
  "القانون",
  "اللغة الإسبانية", 
  "اللغة الألمانية", 
  "اللغة الإيطالية",
  "التربية البدنية والرياضية"
];

export const SESSIONS: Session[] = [
  { id: 1, time: "08:00 - 09:00", isMorning: true },
  { id: 2, time: "09:00 - 10:00", isMorning: true },
  { id: 3, time: "10:00 - 11:00", isMorning: true },
  { id: 4, time: "11:00 - 12:00", isMorning: true },
  { id: 5, time: "13:00 - 14:00", isMorning: false },
  { id: 6, time: "14:00 - 15:00", isMorning: false },
  { id: 7, time: "15:00 - 16:00", isMorning: false },
];

export const MOCK_CLASSES: ClassRoom[] = [
  // السنة الأولى ثانوي
  { id: '1as-st-1', name: '1 ج م ع ت 1' },
  { id: '1as-st-2', name: '1 ج م ع ت 2' },
  { id: '1as-st-3', name: '1 ج م ع ت 3' },
  { id: '1as-l-1', name: '1 ج م آداب 1' },
  { id: '1as-l-2', name: '1 ج م آداب 2' },
  
  // السنة الثانية ثانوي
  { id: '2as-se-1', name: '2 علوم تجريبية 1' },
  { id: '2as-se-2', name: '2 علوم تجريبية 2' },
  { id: '2as-m', name: '2 رياضيات' },
  { id: '2as-mt', name: '2 تقني رياضي' },
  { id: '2as-ge', name: '2 تسيير واقتصاد' },
  { id: '2as-ph', name: '2 آداب وفلسفة' },
  { id: '2as-le', name: '2 لغات أجنبية' },

  // السنة الثالثة ثانوي
  { id: '3as-se-1', name: '3 علوم تجريبية 1' },
  { id: '3as-se-2', name: '3 علوم تجريبية 2' },
  { id: '3as-m', name: '3 رياضيات' },
  { id: '3as-mt', name: '3 تقني رياضي' },
  { id: '3as-ge', name: '3 تسيير واقتصاد' },
  { id: '3as-ph-1', name: '3 آداب وفلسفة 1' },
  { id: '3as-ph-2', name: '3 آداب وفلسفة 2' },
  { id: '3as-le', name: '3 لغات أجنبية' },
];

export const MOCK_TEACHERS: User[] = [
  { id: 't1', name: 'أحمد بن علي', role: 'TEACHER', subject: 'الرياضيات' },
  { id: 't2', name: 'سارة محمود', role: 'TEACHER', subject: 'علوم الطبيعة والحياة' },
  { id: 't3', name: 'كمال بوزيد', role: 'TEACHER', subject: 'العلوم الفيزيائية' },
  { id: 't4', name: 'ليلى مناد', role: 'TEACHER', subject: 'اللغة العربية' },
  { id: 't5', name: 'ياسين بلقاسم', role: 'TEACHER', subject: 'التاريخ والجغرافيا' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', firstName: 'نوال', lastName: 'بختار', birthDate: '2007-03-12', classId: '3as-ph-1', gender: 'أ', birthPlace: 'السوقر', guardianName: 'محمد', address: 'حي الشهداء' },
  { id: 's2', firstName: 'إكرام', lastName: 'بلعربي', birthDate: '2008-01-15', classId: '3as-ph-1', gender: 'أ', birthPlace: 'تيارت', guardianName: 'عبد القادر', address: 'حي الوفاء' },
  { id: 's3', firstName: 'مروة', lastName: 'بن براهيم', birthDate: '2008-11-20', classId: '3as-ph-1', gender: 'أ', birthPlace: 'السوقر', guardianName: 'عمر', address: 'حي اللوز' },
];
