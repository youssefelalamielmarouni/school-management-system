"use client";
import { useState, useEffect } from "react";
import { getStudents } from "@/lib/actions/studentActions";
import { getStudentReport } from "@/lib/actions/examActions";

export default function TranscriptPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  const handleSelectStudent = async (studentId) => {
    const student = students.find(s => s._id === studentId);
    setSelectedStudent(student);
    const data = await getStudentReport(studentId);
    setReportData(data);
  };

  return (
    <div className="p-6 space-y-6 text-right">
      <h2 className="text-2xl font-bold text-purple-800">بيان درجات طالب</h2>

      {/* اختيار الطالب */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100 flex gap-4 items-center">
        <label className="font-bold">ابحث عن طالب:</label>
        <select 
          onChange={(e) => handleSelectStudent(e.target.value)}
          className="p-2 border rounded-lg flex-1 text-black outline-none focus:ring-2 focus:ring-purple-500 no-print"
        >
          <option value="">اختر الطالب من القائمة</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>)}
        </select>
        <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition">
          طباعة الشهادة
        </button>
      </div>

      {/* تصميم الشهادة */}
      {selectedStudent && (
        <div id="printable-area" className="bg-white p-10 rounded-2xl shadow-xl border-t-12 border-purple-600 max-w-4xl mx-auto">
          <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-black text-purple-900">شهادة تقدير درجات</h1>
              <p className="text-gray-500 mt-2">نظام إدارة المدرسة الذكي</p>
            </div>
            <div className="text-left">
              <p className="font-bold">الاسم: {selectedStudent.name}</p>
              <p>رقم القيد: {selectedStudent.rollNumber}</p>
              <p>الفصل: {selectedStudent.classId?.className}</p>
            </div>
          </div>

          <table className="w-full text-right">
            <thead>
              <tr className="bg-purple-50">
                <th className="p-4 border">المادة</th>
                <th className="p-4 border text-center">الامتحان</th>
                <th className="p-4 border text-center">الدرجة</th>
                <th className="p-4 border text-center">النسبة</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((res, i) => (
                <tr key={i} className="border-b">
                  <td className="p-4 border font-bold">{res.subject}</td>
                  <td className="p-4 border text-center text-gray-600">{res.examName}</td>
                  <td className="p-4 border text-center font-mono">{res.obtained} / {res.total}</td>
                  <td className="p-4 border text-center">
                    <span className={`px-2 py-1 rounded text-sm ${res.percentage > 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {res.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-10 flex justify-between items-center italic text-gray-400 text-sm">
            <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</p>
            <p className="border-t border-gray-300 pt-2 px-10">توقيع مدير المدرسة</p>
          </div>
        </div>
      )}
    </div>
  );
}