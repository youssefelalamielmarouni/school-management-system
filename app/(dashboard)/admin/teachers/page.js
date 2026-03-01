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
     console.log("Submitting...", formData);

    const result = await createTeacher(formData);
      console.log("Result:", result);

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
     {/* نافذة إضافة معلم جديد (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* رأس النافذة */}
            <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">إضافة معلم جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition">
                ✕
              </button>
            </div>

            {/* نموذج الإدخال */}
            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  placeholder="مثال: يوسف محمد"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-right"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="teacher@school.com"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-left"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition text-left"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg active:scale-95"
                >
                  حفظ البيانات
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}