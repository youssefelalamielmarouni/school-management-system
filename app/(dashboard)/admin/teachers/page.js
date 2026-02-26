"use client";
import { useState } from "react";
import { createTeacher } from "@/lib/actions/userActions"; // تأكد من المسار

export default function TeachersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData) {
    setLoading(true);
    const result = await createTeacher(formData);
    setLoading(false);
    
    if (result.success) {
      alert("تمت إضافة المعلم بنجاح!");
      setIsModalOpen(false); // إغلاق النافذة
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-purple-800">إدارة المعلمين</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition-all shadow-md font-medium"
        >
          + إضافة معلم جديد
        </button>
      </div>

      {/* الجدول (مؤقت) */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-purple-50 text-purple-700">
            <tr>
              <th className="p-4 border-b">الاسم</th>
              <th className="p-4 border-b">البريد الإلكتروني</th>
              <th className="p-4 border-b">العمليات</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-4 text-gray-400" colSpan="3 text-center">لا توجد بيانات حالياً</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* الـ Modal (النافذة المنبثقة) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all border-t-4 border-purple-600">
            <h3 className="text-xl font-bold text-purple-800 mb-6">إضافة معلم جديد</h3>
            
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input 
                  name="name" required type="text" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="مثال: أحمد محمد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input 
                  name="email" required type="email" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="teacher@school.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور المؤقتة</label>
                <input 
                  name="password" required type="password" 
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="submit" disabled={loading}
                  className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 disabled:bg-purple-300 transition"
                >
                  {loading ? "جاري الحفظ..." : "حفظ البيانات"}
                </button>
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition"
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