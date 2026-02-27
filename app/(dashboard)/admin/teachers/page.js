"use client";
import { useState, useEffect } from "react";
import { deleteTeacher, getTeachers, createTeacher } from "@/lib/actions/userActions";

export default function TeachersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة لجلب البيانات وتحديث الحالة
  const fetchTeachers = async () => {
    setLoading(true);
    const data = await getTeachers();
    setTeachers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function handleSubmit(formData) {
    const result = await createTeacher(formData);
    if (result.success) {
      setIsModalOpen(false);
      fetchTeachers(); // تحديث القائمة فوراً بعد الإضافة
    } else {
      alert(result.error);
    }
  }

  const handleDelete = async (id) => {
  if (confirm("هل أنت متأكد من رغبتك في حذف هذا المعلم؟")) {
    const result = await deleteTeacher(id);
    if (result.success) {
      // تحديث القائمة محلياً بعد الحذف الناجح
      fetchTeachers(); 
    } else {
      alert(result.error);
    }
  }
};

  return (
    <div className="space-y-6">
      {/* Header و Modal (نفس الكود السابق) */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-r-4 border-purple-600">
        <h2 className="text-2xl font-bold text-purple-800">قائمة المعلمين</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition shadow-md">
          + إضافة معلم
        </button>
      </div>

      {/* الجدول الاحترافي */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-purple-50 text-purple-700">
            <tr>
              <th className="p-4 border-b font-semibold">الاسم</th>
              <th className="p-4 border-b font-semibold">البريد الإلكتروني</th>
              <th className="p-4 border-b font-semibold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="p-10 text-center text-purple-600 animate-pulse">جاري تحميل البيانات...</td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan="3" className="p-10 text-center text-gray-400">لا يوجد معلمون مسجلون حالياً</td></tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher._id} className="border-b hover:bg-purple-50 transition">
                  <td className="p-4 text-gray-700 font-medium">{teacher.name}</td>
                  <td className="p-4 text-gray-600">{teacher.email}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleDelete(teacher._id)}
                        className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded-md hover:bg-red-50 transition border border-transparent hover:border-red-200">
                            حذف   
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal Code Here */}
    </div>
  );
}