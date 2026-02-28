"use client";
import { useState, useEffect } from "react";
import { getTeachersForSelect } from "@/lib/actions/classActions"; 
import { getClassesForStudent } from "@/lib/actions/studentActions";
import { createSubject, getSubjects, deleteSubject } from "@/lib/actions/subjectActions";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getSubjects().then(setSubjects);
    getTeachersForSelect().then(setTeachers);
    getClassesForStudent().then(setClasses);
  }, []);

  async function handleSubmit(formData) {
    const result = await createSubject(formData);
    if (result.success) {
      setIsModalOpen(false);
      getSubjects().then(setSubjects);
      alert("تمت إضافة المادة بنجاح");
    }
  }

  const handleDelete = async (id) => {
  if (confirm("هل أنت متأكد من حذف هذه المادة؟")) {
    const result = await deleteSubject(id);
    if (result.success) {
      getSubjects().then(setSubjects); // تحديث القائمة
      alert("تم حذف المادة بنجاح");
    } else {
      alert(result.error);
    }
  }
};

  return (
    <div className="p-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border-r-4 border-purple-600 shadow-sm mb-6">
        <h2 className="text-2xl font-bold text-purple-800">إدارة المواد الدراسية</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition">
          + إضافة مادة جديدة
        </button>
      </div>

      {/* جدول المواد */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead className="bg-purple-50 text-purple-700">
            <tr>
              <th className="p-4 border-b">اسم المادة</th>
              <th className="p-4 border-b text-center">الكود</th>
              <th className="p-4 border-b">المعلم</th>
              <th className="p-4 border-b">الفصل</th>
              <th className="p-4 border-b text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub) => (
              <tr key={sub._id} className="border-b hover:bg-purple-50 transition text-black">
                <td className="p-4 font-bold">{sub.subjectName}</td>
                <td className="p-4 text-center text-gray-500">{sub.subjectCode}</td>
                <td className="p-4 text-purple-600">{sub.teacher?.name}</td>
                <td className="p-4 font-medium">{sub.class?.className}</td>
                <td className="p-4 text-center">
                    <button onClick={() => handleDelete(sub._id)}
                            className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition border border-transparent hover:border-red-100">
                            حذف                 
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal الإضافة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border-t-4 border-purple-600">
            <h3 className="text-xl font-bold mb-6 text-purple-800">إضافة مادة تعليمية</h3>
            <form action={handleSubmit} className="space-y-4">
              <input name="subjectName" placeholder="اسم المادة (مثلاً: فيزياء)" className="w-full p-2.5 border rounded-lg text-black" required />
              <input name="subjectCode" placeholder="كود المادة (مثلاً: PHY10)" className="w-full p-2.5 border rounded-lg text-black" required />
              
              <select name="teacherId" className="w-full p-2.5 border rounded-lg text-black" required>
                <option value="">اختر المعلم</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>

              <select name="classId" className="w-full p-2.5 border rounded-lg text-black" required>
                <option value="">اختر الفصل</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
              </select>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700">حفظ المادة</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 py-2.5 rounded-lg font-bold hover:bg-gray-200">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}