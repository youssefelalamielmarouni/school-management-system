"use client";
import { useState, useEffect } from "react";
import { getClassesForStudent } from "@/lib/actions/studentActions"; // استخدمنا الدالة القديمة لجلب الفصول
import { getStudentsByClass, saveAttendance } from "@/lib/actions/attendanceActions";
import * as XLSX from 'xlsx';

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // {studentId: 'Present'}
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    getClassesForStudent().then(setClasses);
  }, []);

  const loadStudents = async (classId) => {
    setSelectedClass(classId);
    if (classId) {
      const data = await getStudentsByClass(classId);
      setStudents(data);
      // تهيئة الحضور الافتراضي (الكل حاضر)
      const initialAttendance = {};
      data.forEach(s => initialAttendance[s._id] = 'Present');
      setAttendance(initialAttendance);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    const formattedData = Object.keys(attendance).map(sId => ({
      studentId: sId,
      classId: selectedClass,
      date: date,
      status: attendance[sId]
    }));

    const result = await saveAttendance(formattedData);
    if (result.success) alert("تم حفظ الحضور بنجاح");
  };

  const exportToExcel = () => {
  // تجهيز البيانات لتناسب تنسيق Excel
  const excelData = report.map(item => ({
    "اسم الطالب": item.name,
    "رقم القيد": item.rollNumber,
    "أيام الحضور": item.present,
    "أيام الغياب": item.absent,
    "أيام التأخير": item.late,
    "نسبة الحضور %": ((item.present / item.total) * 100).toFixed(1)
  }));

  // إنشاء ملف Excel
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "تقرير الحضور");

  // تحميل الملف للمستخدم
  XLSX.writeFile(workbook, `تقرير_حضور_${selectedClass || 'عام'}.xlsx`);
};

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-purple-800">رصد الحضور والغياب اليومي</h2>
      
      <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border border-purple-100">
        <select onChange={(e) => loadStudents(e.target.value)} className="p-2 border rounded-lg flex-1 text-black">
          <option value="">اختر الفصل</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded-lg text-black" />
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-purple-100">
          <table className="w-full text-right">
            <thead className="bg-purple-50 text-purple-700">
              <tr>
                <th className="p-4 border-b">اسم الطالب</th>
                <th className="p-4 border-b text-center">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student._id} className="border-b text-black">
                  <td className="p-4">{student.name}</td>
                  <td className="p-4 flex justify-center gap-2">
                    {['Present', 'Absent', 'Late'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student._id, status)}
                        className={`px-4 py-1 rounded-full text-sm font-bold transition ${
                          attendance[student._id] === status 
                          ? (status === 'Present' ? 'bg-green-500 text-white' : status === 'Absent' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white')
                          : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {status === 'Present' ? 'حاضر' : status === 'Absent' ? 'غائب' : 'متأخر'}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 flex justify-end">
            <button onClick={submitAttendance} className="bg-purple-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-purple-700">
              حفظ السجل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}