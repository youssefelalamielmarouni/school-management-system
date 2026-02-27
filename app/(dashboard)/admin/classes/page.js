"use client";
import { useState, useEffect } from "react";
import { getTeachersForSelect, createClass, getClasses, deleteClass } from "@/lib/actions/classActions";

export default function ClassesPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. دالة جلب البيانات (الفصول والمعلمين)
  const fetchData = async () => {
    setLoading(true);
    try {
      const teachersData = await getTeachersForSelect();
      const classesData = await getClasses();
      setTeachers(teachersData);
      setClasses(classesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. دالة معالجة إرسال النموذج
  async function handleSubmit(formData) {
    const result = await createClass(formData); 
    
    if (result && result.success) {
      setIsModalOpen(false);
      fetchData(); // تحديث الجدول فوراً
      alert("تم إنشاء الفصل بنجاح");
    } else if (result && result.error) {
      alert(result.error);
    }
  }

  const handleDelete = async (id) => {
  if (confirm("هل أنت متأكد من حذف هذا الفصل؟ سيؤدي ذلك لإزالة ارتباط الطلاب به.")) {
    const result = await deleteClass(id);
    if (result.success) {
      fetchData(); // تحديث الجدول فوراً
    } else {
      alert(result.error);
    }
  }
};

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg border-r-4 border-purple-600 shadow-sm">
        <h2 className="text-2xl font-bold text-purple-800">إدارة الفصول</h2>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition shadow-md font-medium"
        >
          + إنشاء فصل جديد
        </button>
      </div>

      {/* جدول عرض الفصول */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden mt-8">
        <table className="w-full text-right border-collapse">
          <thead className="bg-purple-50 text-purple-700">
            <tr>
              <th className="p-4 border-b font-semibold">اسم الفصل</th>
              <th className="p-4 border-b font-semibold">المعلم المسؤول</th>
              <th className="p-4 border-b font-semibold text-center">السعة القصوى</th>
              <th className="p-4 border-b font-semibold text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center text-purple-600 animate-pulse">جاري تحميل البيانات...</td></tr>
            ) : classes.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400">لا توجد فصول مسجلة حالياً</td></tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls._id} className="border-b hover:bg-purple-50 transition text-black">
                  <td className="p-4 font-medium">{cls.className}</td>
                  <td className="p-4 text-purple-600 font-bold">
                    {cls.teacher?.name || "غير محدد"}
                  </td>
                  <td className="p-4 text-center">{cls.capacity} طالب</td>
                  <td className="p-4 text-center">
<button 
  onClick={() => handleDelete(cls._id)}
  className="text-red-500 hover:text-red-700 font-bold px-3 py-1 rounded-md hover:bg-red-50 transition border border-transparent hover:border-red-200"
>
  حذف
</button>                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* النافذة المنبثقة (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border-t-4 border-purple-600 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-6 text-purple-800 border-b pb-2">بيانات الفصل الجديد</h3>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الفصل</label>
                <input 
                  name="className" 
                  placeholder="مثلاً: Grade 10-A" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-purple-500 outline-none transition" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المعلم المسؤول</label>
                <select 
                  name="teacherId" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-purple-500 outline-none transition" 
                  required
                >
                  <option value="">اختر المعلم من القائمة</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعة (عدد الطلاب)</label>
                <input 
                  name="capacity" 
                  type="number" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-purple-500 outline-none transition" 
                  defaultValue="30" 
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition shadow-md">حفظ البيانات</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}