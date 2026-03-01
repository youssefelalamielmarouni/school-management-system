"use client";
import { useState, useEffect } from "react";
import { getClassesForStudent, getStudents, deleteStudent } from "@/lib/actions/studentActions";
import { createStudent } from "@/lib/actions/userActions";

export default function StudentsPage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // دالة جلب البيانات الشاملة
  const fetchData = async () => {
    setLoading(true);
    const classesData = await getClassesForStudent();
    const studentsData = await getStudents();
    setClasses(classesData);
    setStudents(studentsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(formData) {
    const result = await createStudent(formData);
    if (result.success) {
      setIsModalOpen(false);
      fetchData(); // تحديث الجدول فوراً
    } else {
      alert(result.error);
    }
  }

  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
      await deleteStudent(id);
      fetchData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border-r-4 border-purple-600 shadow-sm">
        <h2 className="text-2xl font-bold text-purple-800">قائمة الطلاب</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition shadow-md">
          + إضافة طالب جديد
        </button>
      </div>

      {/* جدول الطلاب */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-purple-50 text-purple-700">
            <tr>
              <th className="p-4 border-b font-semibold">رقم القيد</th>
              <th className="p-4 border-b font-semibold">اسم الطالب</th>
              <th className="p-4 border-b font-semibold">الفصل</th>
              <th className="p-4 border-b font-semibold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center text-purple-600 animate-pulse">جاري تحميل بيانات الطلاب...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400">لا يوجد طلاب مسجلون حالياً</td></tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="border-b hover:bg-purple-50 transition text-black">
                  <td className="p-4 font-mono text-sm text-gray-500">{student.rollNumber}</td>
                  <td className="p-4 font-medium">{student.name}</td>
                  <td className="p-4">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                      {student.classId?.className || "بدون فصل"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDelete(student._id)}
                      className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded-md hover:bg-red-50 transition"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal إضافة طالب */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border-t-4 border-purple-600">
            <h3 className="text-xl font-bold mb-4 text-purple-800">بيانات الطالب الجديد</h3>
            <form action={handleSubmit} className="space-y-4">
              <input name="name" placeholder="اسم الطالب الكامل" className="w-full p-2 border rounded text-black" required />
              <input name="email" type="email" placeholder="البريد الإلكتروني" className="w-full p-2 border rounded text-black" required />
              <input name="password" type="password" placeholder="كلمة المرور" className="w-full p-2 border rounded text-black" required />
              <input name="rollNumber" placeholder="رقم القيد (مثلاً: 2024001)" className="w-full p-2 border rounded text-black" required />
              
              <select name="classId" className="w-full p-2 border rounded text-black" required>
                <option value="">اختر الفصل</option>
                {classes.map(c => (
                  <option key={c._id} value={c._id}>{c.className}</option>
                ))}
              </select>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded font-bold hover:bg-purple-700 transition">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 py-2 rounded font-bold hover:bg-gray-300 transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}